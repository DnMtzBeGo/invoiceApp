import { Component, OnInit, Input, QueryList, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { TranslateService } from '@ngx-translate/core';
import { InfoModalComponent } from '../../../../../../modals/info-modal/info-modal.component';
import { CartaPorteInfoService } from '../../../services/carta-porte-info.service';
import { CataloguesListService } from '../../../services/catalogues-list.service';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.scss'],
})
export class UbicacionComponent implements OnInit {
  @Input() allUbicaciones: QueryList<UbicacionComponent>;
  @Input() locationInfo: any;
  @ViewChild('picker') pickerRef: ElementRef;

  public origenInfoAlreadySet: boolean;
  public locationComponentInfo: any;
  public isForeignRFC: boolean = false;

  public ubicacionesForm = new FormGroup({
    distancia_recorrida: new FormControl(''),
    tipo_ubicacion: new FormControl('', Validators.required),
    fecha_hora_salida_llegada: new FormControl('', Validators.required),
    id_ubicacion: new FormControl('', Validators.compose([Validators.pattern(/^(OR|DE)\d{6}$/)])),
    nombre_remitente_destinatario: new FormControl(''),
    rfc_remitente_destinatario: new FormControl(
      '',
      Validators.compose([
        Validators.pattern(/^([A-Z&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d&]{2}(?:[A\d]))?$/),
        Validators.required,
      ]),
    ),
    num_reg_id_trib: new FormControl(''),
    residencia_fiscal: new FormControl(''),
    // numeroEstacion: new FormControl(''),
    // nombreEstacion: new FormControl(''),
    // tipoEstacion: new FormControl(''),
  });

  public infoIsLoaded: boolean = false;

  public tipoEstacionOptions: any[];
  public tipoUbicacion: any[] = [
    {
      clave: 'Origen',
      descripcion: 'Origen',
    },
    {
      clave: 'Destino',
      descripcion: 'Destino',
    },
  ];
  public residenciaFiscal: any[];

  constructor(
    public cataloguesListService: CataloguesListService,
    public cartaPorteInfoService: CartaPorteInfoService,
    public matDialog: MatDialog,
    private translateService: TranslateService,
  ) {
    this.cataloguesListService.countriesSubject.subscribe((data: any[]) => {
      this.residenciaFiscal = data;
    });

    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      this.tipoEstacionOptions = data.excepto_autotransporte?.tipos_de_estacion;
    });
  }

  public async ngOnInit(): Promise<void> {
    this.ubicacionesForm.controls.tipo_ubicacion.valueChanges.subscribe((inputValue) => {
      if (this.allUbicaciones) {
        const ubicacionesSeleccionadas = this.allUbicaciones.map((e: UbicacionComponent) => {
          return e.ubicacionesForm.value.tipo_ubicacion;
        });
        const origenInfoAlreadySet = ubicacionesSeleccionadas.some((e) => e == 'Origen');

        if (origenInfoAlreadySet && inputValue == 'Origen' && this.infoIsLoaded) {
          this.showOriginAlreadySetModal();

          this.ubicacionesForm.patchValue({ tipo_ubicacion: 'Destino' });
        }
      }
    });

    // this.ubicacionesForm.get('rfc_remitente_destinatario').statusChanges.subscribe((val) => {
    //   this.toggleForeignFields(val);
    // });

    this.ubicacionesForm.patchValue(this.ubicacionesForm.value);

    this.toggleForeignFields(this.ubicacionesForm.value.rfc_remitente_destinatario);

    this.infoIsLoaded = true;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.locationInfo?.currentValue) {
      this.ubicacionesForm.patchValue(this.locationInfo);
      this.locationComponentInfo = this.locationInfo.domicilio;
    }
  }

  public onDestinationRfcChanged(event: any): void {
    this.toggleForeignFields(event.target.value);
  }

  public toggleForeignFields(value: string): void {
    if (value !== 'XEXX010101000') {
      this.ubicacionesForm.controls['num_reg_id_trib'].setValue('');
      this.ubicacionesForm.controls['residencia_fiscal'].setValue('');
      this.isForeignRFC = false;
    } else {
      this.isForeignRFC = true;
    }
  }

  public showOriginAlreadySetModal(): void {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: this.translateService.instant('invoice.ubicacion.origin-already-title'),
        message: this.translateService.instant('invoice.ubicacion.origin-already-message'),
      },
      restoreFocus: false,
    });
  }

  public getFormattedUbicacion(): any {
    const ubicacion: any = Object.assign({}, this.ubicacionesForm.value);
    ubicacion.domicilio = this.locationComponentInfo;

    if (ubicacion.tipo_ubicacion == 'Origen') delete ubicacion.distancia_recorrida;
    return ubicacion;
  }

  public checkIfFormValid(): boolean {
    return this.ubicacionesForm.valid;
    //MUST BE CHANGED TO THE VALIDATION OF THE COMPONENT
    // && this.domicilioForm.valid;
  }

  public catchLocationInfoChanges(val): void {
    this.locationComponentInfo = val;
  }
}
