import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Remolques } from 'src/app/pages/invoice/models/invoice/carta-porte/remolques';
import { SubtiposRemolques } from 'src/app/pages/invoice/models/invoice/carta-porte/subtipos-remolques';
import { CataloguesListService } from '../services/catalogues-list.service';
import { CartaPorteInfoService } from '../services/carta-porte-info.service';
import { searchInList } from 'src/app/pages/invoice/containers/factura-edit-page/factura.core';

const REMOLQUES_DATA: Remolques[] = [];

@Component({
  selector: 'app-autotransporte',
  templateUrl: './autotransporte.component.html',
  styleUrls: ['./autotransporte.component.scss'],
})
export class AutotransporteComponent {
  @ViewChild(MatTable) table: MatTable<Remolques>;
  @Input() subtiposRemolques: SubtiposRemolques[];
  @Input() info: any;

  displayedColumns: string[] = ['conf', 'plate', 'action'];
  remolquesSource = [...REMOLQUES_DATA];

  public permisosSCT: any[] = [];
  public filteredSCTPermissions: any[];

  public validRemolquesConfig = false;
  public validRemolquesPlates = false;

  public vehicleConfigurations: any[] = [];
  public filteredVehicleConfigurations: any[];

  public trailerConfigurations: any[] = [];
  public filteredTrailerConfigurations: any[];

  autotransporteForm = new FormGroup({
    permisoSCT: new FormControl(''),
    numeroSCT: new FormControl(''),
    nombreCivil: new FormControl(''),
    numeroCivil: new FormControl(''),
    nombreAmbiental: new FormControl(''),
    numeroAmbiental: new FormControl(''),
    nombreCarga: new FormControl(''),
    numeroCarga: new FormControl(''),
    primaSeguro: new FormControl('', Validators.pattern('^[0-9]*$')),
    remolquesConfig: new FormControl(''),
    remolquesPlates: new FormControl(''),
    identificacionVehicularConfig: new FormControl(''),
    truckPlates: new FormControl('', Validators.compose([Validators.pattern(/^[a-zA-Z0-9]{5,7}$/)])),
    truckModel: new FormControl('', Validators.compose([Validators.pattern(/^19\d{2}$|20\d{2}$/)])),
    vehicleGrossWeight: new FormControl(''),
  });

  remolquesForm = new FormGroup({
    subtipoRemolque: new FormControl(''),
    Placa: new FormControl(''),
  });

  constructor(
    public cataloguesListService: CataloguesListService,
    public cartaPorteInfoService: CartaPorteInfoService,
  ) {
    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      if (data?.tipos_de_permiso) {
        //permisosSCT
        this.permisosSCT = data.tipos_de_permiso;
        this.filteredSCTPermissions = [...this.permisosSCT];

        //identificación vehicular => Configuración
        this.vehicleConfigurations = data.config_autotransporte;
        this.filteredVehicleConfigurations = [...this.vehicleConfigurations];

        //remolques => Configuración
        this.trailerConfigurations = data.subtipos_de_remolques;
        this.filteredTrailerConfigurations = [...this.trailerConfigurations];

        // Evita que no se seleccionen los valores que provienen de catalogos
        this.setCatalogsFields();
      }
    });
  }

  private setCatalogsFields(): void {
    this.autotransporteForm.patchValue(this.autotransporteForm.value);

    this.cartaPorteInfoService.infoRecolector.subscribe(() => {
      const info = this.autotransporteForm.value;

      const response = {
        perm_sct: info.permisoSCT,
        num_permiso_sct: info.numeroSCT,

        identificacion_vehicular: {
          config_vehicular: info.identificacionVehicularConfig,
          placa_v_m: info.truckPlates,
          anio_modelo_v_m: info.truckModel,
          peso_bruto_vehicular: info.vehicleGrossWeight,
        },

        seguros: {
          asegura_carga: info.nombreCarga,
          poliza_carga: info.numeroCarga,

          asegura_resp_civil: info.nombreCivil,
          poliza_resp_civil: info.numeroCivil,

          asegura_med_ambiente: info.nombreAmbiental,
          poliza_ambiente: info.numeroAmbiental,

          prima_seguro: info.primaSeguro,
        },

        remolques: {
          sub_tipo_rem: info.remolquesConfig,
          placa: info.remolquesPlates,
        },
      };

      this.cartaPorteInfoService.addRecoletedInfoMercancias({
        autotransporte: response,
        // isValid: this.autotransporteForm.status,
      });
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.info && this.info) {
      const { seguros, remolques, identificacion_vehicular } = this.info;

      this.autotransporteForm.patchValue({
        identificacionVehicularConfig: identificacion_vehicular?.config_vehicular,
        nombreAmbiental: seguros?.asegura_med_ambiente,
        nombreCarga: seguros?.asegura_carga,
        nombreCivil: seguros?.asegura_resp_civil,
        numeroAmbiental: seguros?.poliza_ambiente,
        numeroCarga: seguros?.poliza_carga,
        numeroCivil: seguros?.poliza_resp_civil,
        numeroSCT: this.info.num_permiso_sct,
        permisoSCT: this.info.perm_sct,
        primaSeguro: seguros?.prima_seguro,
        remolquesConfig: Array.isArray(remolques) ? remolques[0]?.sub_tipo_rem : remolques?.sub_tipo_rem,
        remolquesPlates: Array.isArray(remolques) ? remolques[0]?.placa : remolques?.placa,
        truckModel: identificacion_vehicular?.anio_modelo_v_m,
        truckPlates: identificacion_vehicular?.placa_v_m,
        vehicleGrossWeight: identificacion_vehicular?.peso_bruto_vehicular,
      });
    }
  }

  public addRemolque() {
    if (
      this.autotransporteForm.get('trailerConfigurations').value &&
      this.autotransporteForm.get('remolquesPlates').value
    ) {
      this.remolquesSource.push({
        configuracion: this.autotransporteForm.get('trailerConfigurations').value,
        placa: this.autotransporteForm.get('remolquesPlates').value,
      });
      this.table?.renderRows();
      this.autotransporteForm.get('trailerConfigurations').reset();
      this.autotransporteForm.get('remolquesPlates').reset();
      // this.filteredTrailerConfigurations = this.trailerConfigurations;
    }
  }

  public addData() {
    const randomElementIndex = Math.floor(Math.random() * REMOLQUES_DATA.length);
    this.remolquesSource.push(REMOLQUES_DATA[randomElementIndex]);
    this.table.renderRows();
  }

  public omitSpecialChar(event) {
    var k;
    k = event.charCode;
    return (k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57);
  }

  public removeRemolque(id) {
    this.remolquesSource = this.remolquesSource.filter((item, index) => index !== id);
    this.table.renderRows();
  }

  public getOptionText(filtered, option) {
    if (undefined != this[filtered]) {
      let stateFound = option ? this[filtered].find((x) => x.clave === option) : undefined;
      return stateFound ? `${stateFound.clave} - ${stateFound.descripcion}` : undefined;
    }
    return undefined;
  }

  public resetFilterList(list) {
    switch (list) {
      case 'permisosSCT':
        this.filteredSCTPermissions = this.permisosSCT;
        break;
      case 'identificacionVehicularConfig':
        this.filteredVehicleConfigurations = this.vehicleConfigurations;
        break;
      case 'trailerConfigurations':
        this.filteredTrailerConfigurations = this.trailerConfigurations;
        break;
    }
  }

  public checkIfIsListValueOrEmpty($event: any, formGroup: string, listName: string): void {
    const controlName = $event.target.attributes.formcontrolname.value;
    const currentValue = $event.target.value;
    const control = this[formGroup].get(controlName);

    if (!this?.[listName]) console.log(`La lista ${listName} no existe en el componente`);
    else {
      const byCode = this[listName].find((item) => item.clave === currentValue?.toUpperCase().trim());

      if (!this[listName].length || currentValue?.trim() === '')
        // if the filtered list or value is empty sets control value empty
        control.setValue('');
      else if (byCode)
        // enables selection by code
        control.setValue(byCode.clave);
      else if (!this[listName].find((item) => item.clave + ' - ' + item.descripcion === currentValue))
        // empty value if entered values have not result
        control.setValue('');
    }
  }

  public searchSCTPermissions(code: string): void {
    searchInList(this, 'permisosSCT', 'filteredSCTPermissions', code, 'clave', 'descripcion');
  }

  public searchVehicleConfiguration(code: string): void {
    searchInList(this, 'vehicleConfigurations', 'filteredVehicleConfigurations', code, 'clave', 'descripcion');
  }

  public searchTrailerConfiguration(code: string): void {
    searchInList(this, 'trailerConfigurations', 'filteredTrailerConfigurations', code, 'clave', 'descripcion');
  }
}
