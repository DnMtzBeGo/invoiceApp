// import { Component, Input, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
// import { MatTable } from '@angular/material/table';
// import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';

// import { Pedimento } from '../../../../models/invoice/carta-porte/ubicaciones';
// import { CartaPorteInfoService } from '../services/carta-porte-info.service';
// import { CataloguesListService } from '../services/catalogues-list.service';
// import { searchInList } from 'src/app/pages/invoice/containers/factura-edit-page/factura.core';
// import { CommodityComponent } from '../mercanciasv2.0/components/commodity/commodity.component';

// const ELEMENT_DATA: Pedimento[] = [];

// @Component({
//   selector: 'app-mercancias',
//   templateUrl: './mercancias.component.html',
//   styleUrls: ['./mercancias.component.scss'],
// })
// export class MercanciasComponent {
//   @ViewChildren(CommodityComponent) public commodityRef: QueryList<CommodityComponent>;
//   @ViewChild(MatTable) public table: MatTable<Pedimento>;

//   @Input() public info: any;

//   public displayedColumns: string[] = ['value', 'action'];
//   public dataSource = [...ELEMENT_DATA];

//   public pesoBrutoTotal: number;

//   public weightUnits: any[];
//   public filteredWeightUnits: any[] = [];

//   public numTotalMercancias: number;

//   public commodities: Array<any> = [1];

//   public mercanciasForm = new FormGroup({
//     peso_bruto_total: new FormControl('', Validators.required),
//     unidad_peso: new FormControl('', Validators.required),
//   });

//   constructor(
//     public cartaPorteInfoService: CartaPorteInfoService,
//     private cataloguesListService: CataloguesListService,
//   ) {
//     this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
//       if (data?.unidades_de_peso) {
//         this.weightUnits = data.unidades_de_peso;
//         this.filteredWeightUnits = Object.assign([], this.weightUnits);

//         this.setCatalogsFields();
//       }
//     });
//   }

//   public setCatalogsFields() {
//     this.cartaPorteInfoService.infoRecolector.subscribe(() => {
//       const mercancia = this.sendDataToService();
//       const { peso_bruto_total, unidad_peso } = this.mercanciasForm.value;

//       this.cartaPorteInfoService.addRecoletedInfoMercancias({
//         peso_bruto_total: peso_bruto_total,
//         unidad_peso,
//         num_total_mercancias: mercancia.length,
//         mercancia,
//         // isValid: this.isValid()
//       });
//     });

//     this.mercanciasForm.patchValue(this.info);
//   }

//   public ngOnChanges(changes: SimpleChanges): void {
//     if (changes.info && this.info) {
//       const { mercancia, peso_bruto_total, unidad_peso } = this.info;
//       if (mercancia) this.commodities = mercancia;
//       this.mercanciasForm.patchValue({
//         peso_bruto_total,
//         unidad_peso,
//       });
//     }
//   }

//   public addMerchandise() {
//     this.commodities.push(1);
//   }

//   public removeData() {
//     if (this.commodities.length > 1) this.commodities.pop();
//   }

//   public sendDataToService() {
//     return this.commodityRef.toArray().map((e) => {
//       const info = e.commodity.value;

//       const response = {
//         clave_unidad: info.claveUnidad,
//         peso_en_kg: info.peso,
//         material_peligroso: info.materialPeligroso ? 'Sí' : 'No',
//         cve_material_peligroso: info.claveMaterialPeligroso ? info.claveMaterialPeligroso : '',
//         embalaje: info.embalaje,
//         descrip_embalaje: info.embalaje?.descripcion,
//         bienes_transp: info.bienesTransportados,
//         descripcion: info.bienesTransportadosDescripcion,
//         dimensiones: info.dimensiones,
//         valor_mercancia: parseFloat(info.valorMercancia),
//         fraccion_arancelaria: info.fraccionArancelaria,
//         moneda: info.moneda,
//         cantidad: parseInt(info.cantidad),
//         pedimentos: info.pedimento,
//         cantidad_transporta: info.cantidad_transporta,
//         tipo_materia: info.tipoMateria,
//       };

//       if (!info.materialPeligroso) {
//         delete response.cve_material_peligroso;
//         delete response.embalaje;
//       }

//       return response;
//     });
//   }

//   public isValid() {
//     if (this.commodityRef) {
//       const commodityRef = this.commodityRef.toArray();

//       const validityArr = commodityRef.filter((x): any => x.commodity.status == 'VALID');
//       const validity = validityArr.length == commodityRef.length;
//       return validity;
//     }
//   }

//   public getUnidadPesoText(option: string): string {
//     let stateFound = option ? this.weightUnits?.find((x) => x.clave === option) : undefined;
//     return stateFound ? `${stateFound.clave} - ${stateFound.nombre}` : undefined;
//   }

//   public resetFilterList(list) {
//     switch (list) {
//       case 'permisosSCT':
//         this.filteredWeightUnits = this.weightUnits;
//         break;
//     }
//   }

//   public searchWeightUnit(code: string): void {
//     searchInList(this, 'weightUnits', 'filteredWeightUnits', code, 'clave', 'nombre');
//   }
// }
