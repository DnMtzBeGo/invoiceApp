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
@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.scss'],
})
export class CommodityComponent implements OnChanges {
  @ViewChildren(CantidadTransportaComponent) cantidadTransportaRef: QueryList<CantidadTransportaComponent>;
  @ViewChild(MatTable) table: MatTable<any>;

  @Input() dataCoin: any;
  @Input() commodityInfo: any;

  public typesOfMatter: any[] = [];
  public cantidadTransportaInfo: Array<CantidadTansporta>;
  public cantidad_transporta: Array<CantidadTansporta> = [{ cantidad: '', id_origen: '', id_destino: '' }];
  public embalaje: Array<object> = [];
  public filteredBienesTransportados: any[] = [];
  public bienesTransportados: any[] = [];
  public claveUnidad: any[] = [];
  public filteredClaveUnidad: any[];
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

  constructor(private catalogListService: CataloguesListService, private cartaPorteInfoService: CartaPorteInfoService) {
    this.cartaPorteInfoService.emitShowFraccion.subscribe((value) => {
      this.showFraccion = true;
      // if (value) this.showFraccion = true;
      // else this.showFraccion = true;
    });

    this.catalogListService.consignmentNoteSubject.subscribe((data: any) => {
      this.embalaje = data.tipos_de_embalaje;
      this.claveUnidad = Object.assign([], data.claves_de_unidad);
      this.filteredClaveUnidad = Object.assign([], this.claveUnidad);
      this.typesOfMatter = Object.assign([], data.tipo_materia);

      this.setCatalogsFields();
    });
  }

  public setCatalogsFields() {
    //Obtener Autocomplete de Bienes Transportados
    this.commodity.controls.bienesTransportados.valueChanges.subscribe(async (val: string) => {
      if (val !== '') {
        this.bienesTransportados = await this.catalogListService.getCatalogue(
          'consignment-note/productos-y-servicios',
          {
            term: val,
            limit: 30,
          },
        );
        this.filteredBienesTransportados = Object.assign([], this.bienesTransportados);

        if (this.filteredBienesTransportados.length < 1) {
          let productsCatalogs = await this.catalogListService.getCatalogue('consignment-note/productos-y-servicios', {
            term: '01010101',
            limit: 1,
          });
          this.filteredBienesTransportados = Object.assign([], productsCatalogs);
          this.bienesTransportados = [...productsCatalogs];
        }
      } else {
        this.bienesTransportados = await this.catalogListService.getCatalogue(
          'consignment-note/productos-y-servicios',
          {
            term: '',
            limit: 30,
          },
        );

        this.filteredBienesTransportados = Object.assign([], this.bienesTransportados);
      }
    });

    //Obtener Autocomplete de Material Peligroso
    this.commodity.controls.claveMaterialPeligroso.valueChanges.subscribe(async (val: string) => {
      if (val !== '') {
        this.materialPeligroso = await this.catalogListService.getCatalogue('consignment-note/material-peligroso', {
          term: val,
          limit: 30,
        });
        this.filteredMaterialPeligroso = Object.assign([], this.materialPeligroso);
      }
    });

    this.commodity.controls.claveUnidad.valueChanges.subscribe(async (val: any) => {
      if (val !== '') {
        this.filteredClaveUnidad = this.claveUnidad.filter((e) => {
          const currentValue = `${e.clave} ${e.nombre}`.toLowerCase();
          const input =
            typeof val == 'string' ? val.toLowerCase() : val ? `${val.clave} ${val.nombre}`.toLowerCase() : '';
          return currentValue.includes(input);
        });
      }
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

      console.log({ com: this.commodityInfo });

      if (pedimentos) this.dataSourcePedimento = pedimentos;
      if (bienesTransportados) {
        this.bienesTransportados = await this.catalogListService.getCatalogue(
          'consignment-note/productos-y-servicios',
          {
            term: bienesTransportados,
          },
        );
      }
      if (claveMaterialPeligroso) {
        this.materialPeligroso = await this.catalogListService.getCatalogue('consignment-note/material-peligroso', {
          term: claveMaterialPeligroso,
          limit: 30,
        });
      }

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

  async addPedimento(event: KeyboardEvent) {
    const valuePedimento = event.target['value'];
    event.target['value'] = '';
    this.dataSourcePedimento.push({
      pedimento: valuePedimento,
    });
    this.table?.renderRows();
    this.commodity.get('pedimento').reset();
    this.commodity.patchValue({ pedimento: this.dataSourcePedimento });
  }

  getBienesTransportadosText(option: string) {
    const optionInfo = this.bienesTransportados?.find((e) => e.code == option);
    this.commodity.patchValue({
      bienesTransportadosDescripcion: optionInfo?.description,
    });
    return optionInfo ? `${optionInfo.code} - ${optionInfo.description}` : '';
  }

  getClaveUnidadText(option) {
    let stateFound = option ? this.claveUnidad.find((x) => x.clave === option) : undefined;
    return stateFound ? `${stateFound.clave} - ${stateFound.nombre}` : undefined;
  }

  getMaterialPeligrosoText(option: string) {
    const optionInfo = this.materialPeligroso.find((e) => e.clave == option);
    return optionInfo ? `${optionInfo.clave} - ${optionInfo.descripcion}` : '';
  }

  removeData(id) {
    this.dataSourcePedimento = this.dataSourcePedimento.filter((item, index) => index !== id);
    this.table.renderRows();
  }

  acceptOnlyNumbers(event: Event): void {
    event.target['value'] = event.target['value'].replace(/\D/g, '');
  }

  resetFilterList(list) {
    switch (list) {
      case 'bienesTransportados':
        this.filteredBienesTransportados = this.bienesTransportados;
        break;
      case 'claveUnidad':
        this.filteredClaveUnidad = this.claveUnidad;
        break;
      case 'claveMaterialPeligroso':
        this.filteredMaterialPeligroso = this.materialPeligroso;
        break;
    }
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
}
