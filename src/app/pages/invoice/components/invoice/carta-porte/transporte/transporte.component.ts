import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CartaPorteCountries } from 'src/app/pages/invoice/models/invoice/carta-porte/CartaPorteCountries';
import { ClavesDeTransporte } from 'src/app/pages/invoice/models/invoice/carta-porte/ClavesDeTransporte';
import { SubtiposRemolques } from 'src/app/pages/invoice/models/invoice/carta-porte/subtipos-remolques';
import { CartaPorteInfoService } from '../services/carta-porte-info.service';
import { CataloguesListService } from '../services/catalogues-list.service';
import { RegimenesAduaneros } from 'src/app/pages/invoice/models/invoice/carta-porte/RegimenesAduaneros';

@Component({
  selector: 'app-transporte',
  templateUrl: './transporte.component.html',
  styleUrls: ['./transporte.component.scss'],
})
export class TransporteComponent implements OnInit {
  @Input() public subtiposRemolques: SubtiposRemolques[] = [];
  @Input() public info: any;

  public selectedCustomsRegime: string[] = [];

  public autotransportesInfo: any;

  public ingresoSalidaPais: ClavesDeTransporte[];
  public countries: CartaPorteCountries[];
  public regimenesAduaneros: RegimenesAduaneros[];
  public subscribedCartaPorte: Subscription;

  public cartaPorteType: string = 'autotransporte';

  public internationalTransport: boolean = false;
  public firstFormGroup: FormGroup = new FormGroup({
    transp_internac: new FormControl(''),
    pais_origen_destino: new FormControl(''),
    entrada_salida_merc: new FormControl(''),
    via_entrada_salida: new FormControl(''),
    regimen_aduanero: new FormControl(''),
    regimenes_aduaneros: new FormControl('[]'),
  });

  constructor(
    public cataloguesListService: CataloguesListService,
    public cartaPorteInfoService: CartaPorteInfoService,
  ) {
    this.cataloguesListService.countriesSubject.subscribe((data: any[]) => {
      this.countries = data;
    });

    this.cataloguesListService.consignmentNoteSubject.subscribe((data: any) => {
      this.ingresoSalidaPais = data.claves_de_transporte;
      this.regimenesAduaneros = data.regimen_aduanero;
    });
  }

  public ngOnInit(): void {
    if (!this.firstFormGroup.get('transp_internac').value) this.firstFormGroup.get('transp_internac').setValue('No');

    this.subscribedCartaPorte = this.cartaPorteInfoService.infoRecolector.subscribe((value) => {
      this.cartaPorteInfoService.addRecolectedInfo({
        ...this.firstFormGroup.value,
        transp_internac: this.firstFormGroup.get('transp_internac').value,
        isValid: this.firstFormGroup.status,
      });
    });

    this.firstFormGroup.get('transp_internac').valueChanges.subscribe((inputValue) => {
      if (inputValue && this.firstFormGroup.get('entrada_salida_merc').value == 'salida')
        this.cartaPorteInfoService.showFraccionArancelaria(true);
      else this.cartaPorteInfoService.showFraccionArancelaria(false);

      this.firstFormGroup.get('regimen_aduanero').setValue('');
    });

    this.firstFormGroup.controls.entrada_salida_merc.valueChanges.subscribe((inputValue) => {
      if (inputValue == 'salida' && this.firstFormGroup.get('transp_internac').value)
        this.cartaPorteInfoService.showFraccionArancelaria(true);
      else this.cartaPorteInfoService.showFraccionArancelaria(false);
    });
  }

  public ngOnDestroy() {
    this.subscribedCartaPorte.unsubscribe();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    //MAYBE THIS FUNCTION IS NOT NECESSARY
    if (changes.subtiposRemolques) {
      if (this.subtiposRemolques == null) {
        this.subtiposRemolques = [];
      }
    }

    if (changes.info && this.info) {
      this.autotransportesInfo = this.info?.mercancias.autotransporte;

      const {
        transp_internac,
        pais_origen_destino,
        entrada_salida_merc,
        via_entrada_salida,
        regimen_aduanero,
        regimenes_aduaneros = [],
      } = this.info;

      this.firstFormGroup.patchValue({
        transp_internac,
        pais_origen_destino,
        entrada_salida_merc,
        via_entrada_salida,
        regimen_aduanero,
        regimenes_aduaneros: regimenes_aduaneros.length ? JSON.stringify(regimenes_aduaneros) : '[]',
      });

      if (regimenes_aduaneros.length) this.selectedCustomsRegime = [...regimenes_aduaneros];
    }
  }
}
