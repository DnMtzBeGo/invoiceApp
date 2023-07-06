import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Remolques } from 'src/app/pages/invoice/models/invoice/carta-porte/remolques';
import { SubtiposRemolques } from 'src/app/pages/invoice/models/invoice/carta-porte/subtipos-remolques';
import { CataloguesListService } from '../services/catalogues-list.service';
import { CartaPorteInfoService } from '../services/carta-porte-info.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

const REMOLQUES_DATA: Remolques[] = [];

@Component({
  selector: 'app-autotransporte',
  templateUrl: './autotransporte.component.html',
  styleUrls: ['./autotransporte.component.scss']
})
export class AutotransporteComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<Remolques>;
  @Input() subtiposRemolques: SubtiposRemolques[];
  @Input() info: any;

  displayedColumns: string[] = ['conf', 'plate', 'action'];
  remolquesSource = [...REMOLQUES_DATA];

  public permisosSCT: any[] = [];
  public filteredPermisosSCT: any[];

  validRemolquesConfig = false;
  validRemolquesPlates = false;

  public identificacionVehicular: any[] = [];
  public filteredIdentificacionVehicular: any[];

  public remolquesConfig: any[] = [];
  public filteredRemolquesConfig: any[];

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
    truckModel: new FormControl('', Validators.compose([Validators.pattern(/^19\d{2}$|20\d{2}$/)]))
  });

  remolquesForm = new FormGroup({
    subtipoRemolque: new FormControl(''),
    Placa: new FormControl('')
  });

  constructor(public cataloguesListService: CataloguesListService, public cartaPorteInfoService: CartaPorteInfoService) {
    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      if (data?.tipos_de_permiso) {
        //permisosSCT
        this.permisosSCT = data.tipos_de_permiso;
        this.filteredPermisosSCT = Object.assign([], this.permisosSCT);

        //identificación vehicular => Configuración
        this.identificacionVehicular = data.config_autotransporte;
        this.filteredIdentificacionVehicular = Object.assign([], this.identificacionVehicular);

        //remolques => Configuración
        this.remolquesConfig = data.subtipos_de_remolques;
        this.filteredRemolquesConfig = Object.assign([], this.remolquesConfig);

        // Evita que no se seleccionen los valores que provienen de catalogos
        this.setCatalogsFields();
      }
    });
  }

  setCatalogsFields() {
    this.autotransporteForm.patchValue(this.autotransporteForm.value);

    this.autotransporteForm.controls.permisoSCT.valueChanges.subscribe((inputValue) => {
      if (inputValue) {
        this.filteredPermisosSCT = this.permisosSCT?.filter((e) => {
          const currentValue = `${e.clave} ${e.descripcion}`.toLowerCase();
          const input =
            typeof inputValue == 'string' ? inputValue.toLowerCase() : `${inputValue.clave} ${inputValue.descripcion}`.toLowerCase();
          return currentValue.includes(input);
        });
      }
    });

    this.autotransporteForm.controls.identificacionVehicularConfig.valueChanges.subscribe((inputValue) => {
      if (inputValue) {
        this.filteredIdentificacionVehicular = this.identificacionVehicular?.filter((e) => {
          const currentValue = `${e.clave} ${e.descripcion}`.toLowerCase();
          const input =
            inputValue && typeof inputValue == 'string'
              ? inputValue.toLowerCase()
              : `${inputValue.clave} ${inputValue.descripcion}`.toLowerCase();
          return currentValue.includes(input);
        });
      }
    });

    this.autotransporteForm.controls.remolquesConfig.valueChanges.subscribe((inputValue) => {
      if (inputValue) {
        this.filteredRemolquesConfig = this.remolquesConfig?.filter((e) => {
          const currentValue = `${e.clave} ${e.descripcion}`.toLowerCase();
          const input =
            typeof inputValue == 'string' ? inputValue.toLowerCase() : `${inputValue.clave} ${inputValue.descripcion}`.toLowerCase();
          return currentValue.includes(input);
        });
      }
    });

    this.cartaPorteInfoService.infoRecolector.subscribe(() => {
      const info = this.autotransporteForm.value;

      const response = {
        perm_sct: info.permisoSCT,
        num_permiso_sct: info.numeroSCT,

        identificacion_vehicular: {
          config_vehicular: info.identificacionVehicularConfig,
          placa_v_m: info.truckPlates,
          anio_modelo_v_m: info.truckModel
        },

        seguros: {
          asegura_carga: info.nombreCarga,
          poliza_carga: info.numeroCarga,

          asegura_resp_civil: info.nombreCivil,
          poliza_resp_civil: info.numeroCivil,

          asegura_med_ambiente: info.nombreAmbiental,
          poliza_ambiente: info.numeroAmbiental,

          prima_seguro: info.primaSeguro
        },

        remolques: {
          sub_tipo_rem: info.remolquesConfig,
          placa: info.remolquesPlates
        }
      };

      this.cartaPorteInfoService.addRecoletedInfoMercancias({
        autotransporte: response
        // isValid: this.autotransporteForm.status,
      });
    });
  }

  async ngOnInit(): Promise<void> {}

  ngOnChanges(changes: SimpleChanges): void {
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
        truckPlates: identificacion_vehicular?.placa_v_m
      });
    }
  }

  addRemolque() {
    if (this.autotransporteForm.get('remolquesConfig').value && this.autotransporteForm.get('remolquesPlates').value) {
      this.remolquesSource.push({
        configuracion: this.autotransporteForm.get('remolquesConfig').value,
        placa: this.autotransporteForm.get('remolquesPlates').value
      });
      this.table?.renderRows();
      this.autotransporteForm.get('remolquesConfig').reset();
      this.autotransporteForm.get('remolquesPlates').reset();
      this.filteredRemolquesConfig = this.remolquesConfig;
    }
  }

  addData() {
    const randomElementIndex = Math.floor(Math.random() * REMOLQUES_DATA.length);
    this.remolquesSource.push(REMOLQUES_DATA[randomElementIndex]);
    this.table.renderRows();
  }

  omitSpecialChar(event) {
    var k;
    k = event.charCode;
    return (k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57);
  }

  removeRemolque(id) {
    this.remolquesSource = this.remolquesSource.filter((item, index) => index !== id);
    this.table.renderRows();
  }

  getOptionText(filtered, option) {
    if (undefined != this[filtered]) {
      let stateFound = option ? this[filtered].find((x) => x.clave === option) : undefined;
      return stateFound ? `${stateFound.clave} - ${stateFound.descripcion}` : undefined;
    }
    return undefined;
  }

  permisoSCTSearch() {
    this.filteredPermisosSCT = this.permisosSCT;
  }

  identificacionVehicularConfigSearch() {
    this.filteredIdentificacionVehicular = this.identificacionVehicular;
  }

  remolquesConfigSearch() {
    this.filteredRemolquesConfig = this.remolquesConfig;
  }

  resetFilterList(list) {
    switch (list) {
      case 'permisosSCT':
        this.filteredPermisosSCT = this.permisosSCT;
        break;
      case 'identificacionVehicularConfig':
        this.filteredIdentificacionVehicular = this.identificacionVehicular;
        break;
      case 'remolquesConfig':
        this.filteredRemolquesConfig = this.remolquesConfig;
        break;
    }
  }
}
