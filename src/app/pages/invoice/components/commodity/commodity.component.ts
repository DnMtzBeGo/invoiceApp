import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';

import { CartaPorteInfoService } from '../invoice/carta-porte/services/carta-porte-info.service';
import { CataloguesListService } from '../invoice/carta-porte/services/catalogues-list.service';
import {
  CantidadTansporta,
  CantidadTansportaChangedEvent,
  CantidadTransportaComponent,
} from '../cantidad-transporta/cantidad-transporta.component';
import { searchInList } from '../../containers/factura-edit-page/factura.core';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.scss'],
})
export class CommodityComponent implements OnChanges {
  @ViewChildren(CantidadTransportaComponent) public cantidadTransportaRef: QueryList<CantidadTransportaComponent>;
  @ViewChild(MatTable) public table: MatTable<any>;

  @Input() public commodityInfo: any;

  public currencies: any[];
  public filteredCurrencies: any[];

  public packagingTypes: any[];
  public filteredPackagingTypes: any[];

  public typesOfMatter: any[] = [];
  public cantidadTransportaInfo: Array<CantidadTansporta>;
  public cantidad_transporta: Array<CantidadTansporta> = [{ cantidad: '', id_origen: '', id_destino: '' }];

  public transportedGoods: any[] = [];

  public unitTypes: any[] = [];
  public filteredUnitTypes: any[];

  public materialPeligroso: any[] = [];
  public filteredMaterialPeligroso: any[];
  public pedimento: any[] = [];
  public dataSourcePedimento: Array<object> = [];
  public displayedColumns: string[] = ['value', 'action'];
  public showFraccion: boolean = false;

  public commodity: FormGroup = new FormGroup({
    bienesTransportados: new FormControl(''),
    bienesTransportadosDescripcion: new FormControl(''),
    // claveSCTT: new FormControl(''),
    claveUnidad: new FormControl(''),
    dimensiones: new FormControl('', Validators.compose([Validators.pattern(/^\d{1,3}\/\d{1,3}\/\d{1,3}(cm|plg)$/)])),
    peso: new FormControl(''),
    valorMercancia: new FormControl(''),
    moneda: new FormControl('MXN'),
    pedimento: new FormControl(''),
    materialPeligroso: new FormControl(false),
    tipoMateria: new FormControl(''),
    claveMaterialPeligroso: new FormControl(''),
    embalaje: new FormControl(''),
    cantidad: new FormControl(''),
    fraccionArancelaria: new FormControl(''),
    // prettier-ignore
    UUIDComercioExt: new FormControl(
      '',
      Validators.compose([Validators.pattern(
        /^[a-f0-9A-F]{8}-[a-f0-9A-F]{4}-[a-f0-9A-F]{4}-[a-f0-9A-F]{4}-[a-f0-9A-F]{12}$/
      )])
    ),
    cantidad_transporta: new FormControl([]),
  });

  constructor(
    private apiRestService: AuthService,
    private catalogListService: CataloguesListService,
    private cartaPorteInfoService: CartaPorteInfoService,
  ) {
    this.cartaPorteInfoService.emitShowFraccion.subscribe((value) => {
      this.showFraccion = true;
      // if (value) this.showFraccion = true;
      // else this.showFraccion = true;
    });

    this.catalogListService.consignmentNoteSubject.subscribe((data: any) => {
      this.packagingTypes = [...data.tipos_de_embalaje];
      this.filteredPackagingTypes = [...data.tipos_de_embalaje];

      this.unitTypes = [...data.claves_de_unidad];
      this.filteredUnitTypes = [...this.unitTypes];

      this.typesOfMatter = [...data.tipo_materia];
    });

    this._getCurrencies();
  }

  private _getCurrencies(): CommodityComponent {
    this.apiRestService.apiRestGet('invoice/catalogs/moneda').then((observer) => {
      observer.subscribe(({ result }) => {
        this.currencies = [...result];
        this.filteredCurrencies = [...result];
      });
    });

    return this;
  }

  private async _getTransportedGoodsCatalog(code?: string): Promise<void> {
    await this.catalogListService
      .getCatalogue('consignment-note/productos-y-servicios', {
        term: code || '01010101',
        limit: 30,
      })
      .then((catalog) => {
        this.transportedGoods = catalog;
      });
  }

  private async _getHazardousMaterialType(code?: string): Promise<void> {
    await this.catalogListService
      .getCatalogue('consignment-note/material-peligroso', {
        term: code,
        limit: 30,
      })
      .then((catalog) => {
        this.materialPeligroso = [...catalog];
        this.filteredMaterialPeligroso = [...catalog];
      });
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.commodityInfo && this.commodityInfo) {
      const {
        bienes_transp: bienesTransportados,
        cantidad,
        clave_unidad: claveUnidad,
        dimensiones,
        moneda,
        pedimentos,
        peso_en_kg: peso,
        valor_mercancia: valorMercancia,
        embalaje,
        material_peligroso,
        cve_material_peligroso: claveMaterialPeligroso,
        fraccion_arancelaria: fraccionArancelaria,
        cantidad_transporta,
        tipo_materia,
      } = this.commodityInfo;

      // Ensure fields with backend search is filled at loading
      if (bienesTransportados) this.searchTransportedGoods(bienesTransportados);
      if (claveMaterialPeligroso) this.searchHazardousMaterialType(claveMaterialPeligroso);

      if (pedimentos) this.dataSourcePedimento = pedimentos;

      if (cantidad_transporta?.length) {
        this.cantidad_transporta = cantidad_transporta;
        this.cantidadTransportaInfo = [...cantidad_transporta];
      } else {
        this.cantidadTransportaInfo = [];
      }

      this.commodity.patchValue({
        bienesTransportados,
        claveUnidad,
        dimensiones,
        peso,
        valorMercancia,
        moneda,
        pedimento: pedimentos,
        materialPeligroso: material_peligroso == 'Sí',
        claveMaterialPeligroso,
        embalaje,
        cantidad,
        fraccionArancelaria,
        cantidad_transporta,
        tipoMateria: tipo_materia,
      });
    }
  }

  public async addPedimento(event: KeyboardEvent) {
    const valuePedimento = event.target['value'];
    event.target['value'] = '';
    this.dataSourcePedimento.push({
      pedimento: valuePedimento,
    });
    this.table?.renderRows();
    this.commodity.get('pedimento').reset();
    this.commodity.patchValue({ pedimento: this.dataSourcePedimento });
  }

  public removeData(id) {
    this.dataSourcePedimento = this.dataSourcePedimento.filter((item, index) => index !== id);
    this.table.renderRows();
  }

  public acceptOnlyNumbers(event: Event): void {
    event.target['value'] = event.target['value'].replace(/\D/g, '');
  }

  public addCantidadTransportaRow(): void {
    const cantidadTransportaObject = { cantidad: '', id_origen: '', id_destino: '' };

    this.cantidad_transporta.push(cantidadTransportaObject);
    this.cantidadTransportaInfo.push(cantidadTransportaObject);
    this.updateCantidadTransportaInfo();
  }

  public removeCantidadTransportaRow(index: number): void {
    this.cantidadTransportaInfo.splice(index, 1);
    this.cantidad_transporta.splice(index, 1);
    this.updateCantidadTransportaInfo();
  }

  public cantidadTransportaRowHasChanged($event: CantidadTansportaChangedEvent): void {
    const { index, item } = $event;
    if (item && Array.isArray(this.cantidadTransportaInfo)) {
      this.cantidadTransportaInfo[index] = item;
      this.updateCantidadTransportaInfo();
    }
  }

  private updateCantidadTransportaInfo() {
    this.commodity.controls['cantidad_transporta'].setValue(this.cantidadTransportaInfo);
  }

  public searchTransportedGoods(code: string): void {
    this._getTransportedGoodsCatalog(code);
  }

  public searchHazardousMaterialType(code: string): void {
    this._getHazardousMaterialType(code);
  }

  public searchUnitType(code: string): void {
    searchInList(this, 'unitTypes', 'filteredUnitTypes', code, 'clave', 'nombre');
  }

  public searchCurrency(code: string): void {
    searchInList(this, 'currencies', 'filteredCurrencies', code, 'clave', 'descripcion');
  }

  public searchPackagingType(code: string): void {
    searchInList(this, 'packagingTypes', 'filteredPackagingTypes', code, 'clave', 'descripcion');
  }
}
