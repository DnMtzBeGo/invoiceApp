import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  CantidadTansporta,
  CantidadTansportaChangedEvent,
  CantidadTransportaComponent,
} from '../cantidad-transporta/cantidad-transporta.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CataloguesListService } from '../../../services/catalogues-list.service';
import { CartaPorteInfoService } from '../../../services/carta-porte-info.service';
import { searchInList } from 'src/app/pages/invoice/containers/factura-edit-page/factura.core';
import { ICommodity } from '../../model';

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.scss'],
})
export class CommodityComponent implements OnInit, OnChanges {
  @ViewChildren(CantidadTransportaComponent) public cantidadTransportaRef: QueryList<CantidadTransportaComponent>;
  @Input() public editId: string = null;
  @Output() public dataChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() public editCanceled: EventEmitter<any> = new EventEmitter<any>();

  public commodityInfo: ICommodity;
  public currencies: any[];
  public filteredCurrencies: any[];

  public packagingTypes: any[];
  public filteredPackagingTypes: any[];

  public typesOfMatter: any[] = [];
  public cantidadTransportaInfo: Array<CantidadTansporta> = [];
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

  public commodityForm: FormGroup = new FormGroup({
    line: new FormControl(''),
    _id: new FormControl(''),
    id: new FormControl(''),
    bienes_transp: new FormControl(''),
    descripcion: new FormControl(''),
    // claveSCTT: new FormControl(''),
    clave_unidad: new FormControl(''),
    dimensiones: new FormControl('', Validators.compose([Validators.pattern(/^\d{1,3}\/\d{1,3}\/\d{1,3}(cm|plg)$/)])),
    peso_en_kg: new FormControl(''),
    valor_mercancia: new FormControl(''),
    moneda: new FormControl(''),
    pedimento: new FormControl(''),
    material_peligroso: new FormControl(false),
    tipo_materia: new FormControl(''),
    cve_material_peligroso: new FormControl(''),
    embalaje: new FormControl(''),
    cantidad: new FormControl(''),
    fraccion_arancelaria: new FormControl(''),
    // prettier-ignore
    uuid_comercio_ext: new FormControl(
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
    private readonly cd: ChangeDetectorRef,
  ) {
    const _normalizeMaterialPeligrosoBoolean = () => {
      if (this.commodityForm.value.material_peligroso === 'Sí')
        this.commodityForm.get('material_peligroso').setValue(true);
      else this.commodityForm.get('material_peligroso').setValue(false);
    };

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

    this._setFieldsListeners();

    _normalizeMaterialPeligrosoBoolean();
  }

  public ngOnInit(): void {
    this.searchTransportedGoods('01010101');
  }

  private _setFieldsListeners(): void {
    this.commodityForm.get('bienes_transp').valueChanges.subscribe((value) => {
      // sets goods description

      if (value) {
        const description = this.transportedGoods.find((good) => good.code === value);
        if (description) this.commodityForm.get('descripcion').setValue(description.description);
      }
    });
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
    return await this.catalogListService
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
    if (changes?.editId?.currentValue) {
      const activeRecord = this.cartaPorteInfoService.commodities.find((commodity) => commodity.id === this.editId);

      if (activeRecord.material_peligroso === 'No') activeRecord.material_peligroso = false;
      else activeRecord.material_peligroso = true;

      this.commodityInfo = {
        ...activeRecord,
      };

      this._getTransportedGoodsCatalog(activeRecord.bienes_transp).then(() => {
        // refresh the lists before set value to prevent lose data
        if (activeRecord.cve_material_peligroso) this.searchHazardousMaterialType(activeRecord.cve_material_peligroso);
        if (activeRecord.clave_unidad) this.searchUnitType(activeRecord.clave_unidad);
        if (activeRecord.moneda) this.searchCurrency(activeRecord.moneda);
        if (activeRecord.embalaje) this.searchPackagingType(activeRecord.embalaje);

        this.cantidadTransportaInfo = [...(activeRecord.cantidad_transporta || [])];
        this.cantidad_transporta = [...(this.cantidadTransportaInfo || [])];
        this.dataSourcePedimento = [...(activeRecord.pedimento || [])];

        this.commodityForm.patchValue(activeRecord);
      });
    }
  }

  public async addPedimento(event: KeyboardEvent) {
    const valuePedimento = event.target['value'];

    event.target['value'] = '';
    this.dataSourcePedimento = [
      ...this.dataSourcePedimento,
      {
        pedimento: valuePedimento,
      },
    ];
    this.commodityForm.get('pedimento').setValue([...this.dataSourcePedimento]);
  }

  public async addCommodityRow(): Promise<void> {
    const _normalizeMaterialPeligrosoValue = () => {
      if (this.commodityForm.value.material_peligroso === true)
        this.commodityForm.get('material_peligroso').setValue('Sí');
      else this.commodityForm.get('material_peligroso').setValue('No');
    };

    if (this.commodityForm.get('bienes_transp').value?.trim()) {
      _normalizeMaterialPeligrosoValue();

      const data = {
        ...this.commodityForm.value,
      };

      const _updateLocalData = () => {
        if (this.editId) {
          const tempCommodities = [...this.cartaPorteInfoService.commodities];
          const index = tempCommodities.findIndex((commodity) => commodity.id === this.editId);
          tempCommodities[index] = data;
          this.cartaPorteInfoService.commodities = [...tempCommodities];
        } else this.cartaPorteInfoService.commodities = [...this.cartaPorteInfoService.commodities, data];

        this.cd.markForCheck();
        this._resetForm();
        this.dataChanged.emit();
      };

      if (this.cartaPorteInfoService.invoice_id) {
        console.log('send to database before make changes');

        this.cartaPorteInfoService
          .createOrUpdateCommodityAtDatabase(data)
          .toPromise()
          .then(({ result }: any) => {
            // in this case is required to call _updateLocalData after database update
            // or the data will not be reflected in the UI
            const { peso_bruto_total, num_total_mercancias } = result;
            this.cartaPorteInfoService.addRecoletedInfoMercancias({ peso_bruto_total, num_total_mercancias });
            _updateLocalData();
            // this.cd.markForCheck();
          });
      } else _updateLocalData();
    } else console.log('Debe especificar los bienes transportados');
  }

  public cancelAddCommodityRow() {
    this._resetForm();
    this.editCanceled.emit();
  }

  private _clearEmptyPedimento(pedimentos: any[]): any[] {
    let cleared: any[] = [];
    if (pedimentos.length) cleared = pedimentos.filter((pedimento: any) => pedimento.pedimento);

    return cleared;
  }
  private _clearEmptyCantidadTransporta(cantidad_transporta: any[]): any[] {
    let cleared: any[] = [];
    if (cantidad_transporta.length)
      cleared = cantidad_transporta.filter(
        (cantidad: any) => cantidad.id_origen || cantidad.id_destino || cantidad.cantidad,
      );

    return cleared;
  }

  private _resetForm(): void {
    this.commodityForm.reset();
    this.dataSourcePedimento = [];
    this.cantidad_transporta = [{ cantidad: '', id_origen: '', id_destino: '' }];
    this.commodityForm.get('pedimento').reset();
  }

  public removeData(id) {
    this.dataSourcePedimento = [...this.dataSourcePedimento.filter((item, index) => index !== id)];
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
    this.commodityForm.get('cantidad_transporta').setValue([...this.cantidadTransportaInfo]);
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
