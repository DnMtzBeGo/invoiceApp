import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { v4 as uuidv4 } from 'uuid';

import { AuthService } from 'src/app/shared/services/auth.service';
import { InfoModalComponent } from '../../modals/info-modal/info-modal.component';
import { CartaPorteInfoService } from '../../components/invoice/carta-porte/services/carta-porte-info.service';
import { SubtiposRemolques } from '../../models/invoice/carta-porte/subtipos-remolques';
import { generateIDCCP } from '../factura-edit-page/factura.core';

@Component({
  selector: 'app-carta-porte-page',
  templateUrl: './carta-porte-page.component.html',
  styleUrls: ['./carta-porte-page.component.scss'],
})
export class CartaPortePageComponent {
  public subtiposRemolquesList: SubtiposRemolques;
  public catalogues: any;
  private redirectTo: string;

  @Input() public invoice_id: string = '';
  @Input() public facturaInfo: any;

  public transporteInfo: any;
  public ubicacionesInfo: any;
  public mercanciasInfo: any;
  public figuraTransporteInfo: any;
  public cartaPorteEnabled = [];
  public cartaPorteDisabled: boolean = false;
  public isLinear = false;
  constructor(
    public cartaPorteInfoService: CartaPorteInfoService,
    private _location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public apiRestService: AuthService,
    public matDialog: MatDialog,
    private translateService: TranslateService,
  ) {
    this.cartaPorteInfoService.id_ccp = '';
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.facturaInfo?.currentValue?.carta_porte) {
      if (!this.cartaPorteEnabled.includes('carta_porte')) this.cartaPorteEnabled.push('carta_porte');

      this.facturaInfo.complementos = this.cartaPorteEnabled;
      this.facturaInfo = changes.facturaInfo?.currentValue;
      const { carta_porte } = this.facturaInfo;
      this.transporteInfo = carta_porte;
      this.figuraTransporteInfo = carta_porte.figura_transporte;
      this.ubicacionesInfo = carta_porte.ubicaciones;
      this.mercanciasInfo = carta_porte.mercancias;
    }

    if (changes.facturaInfo?.currentValue?.complementos?.length > 0) this.cartaPorteDisabled = true;
    else this.cartaPorteDisabled = false;

    this.setIDCCP(this.cartaPorteDisabled, this.facturaInfo?.carta_porte?.id_ccp);
  }

  public cartaPorteStatus(event: MatSlideToggleChange) {
    if (event.checked) this.cartaPorteEnabled.push('carta_porte');
    else this.cartaPorteEnabled = [];

    this.facturaInfo.complementos = this.cartaPorteEnabled;

    this.setIDCCP(event.checked, this.facturaInfo?.carta_porte?.id_ccp);
  }

  private setIDCCP(checked: boolean, forcedValue: string = ''): void {
    if (checked) {
      if (!this.cartaPorteInfoService.id_ccp) this.cartaPorteInfoService.id_ccp = generateIDCCP();
    } else this.cartaPorteInfoService.id_ccp = null;

    if (forcedValue) {
      this.cartaPorteInfoService.id_ccp = forcedValue;
    }
  }

  public async gatherInfo(): Promise<void> {
    this.cartaPorteInfoService.invalidInfo = false;
    // this.cartaPorteInfoService.resetCartaPorteInfo();
    this.cartaPorteInfoService.infoRecolector.next(null);
    this.facturaInfo.carta_porte = this.cartaPorteInfoService.info;
    this.facturaInfo.carta_porte.id_ccp = this.cartaPorteInfoService.id_ccp;

    this.facturaInfo.carta_porte.total_dist_rec = this.facturaInfo?.carta_porte.ubicaciones
      ?.filter((e) => e.tipo_ubicacion == 'Destino')
      ?.map((e) => e.distancia_recorrida || 0)
      ?.reduce((a, b) => a + b, 0);

    if (this.facturaInfo.carta_porte.transp_internac == 'No') {
      delete this.facturaInfo.carta_porte.pais_origen_destino;
      delete this.facturaInfo.carta_porte.entrada_salida_merc;
      delete this.facturaInfo.carta_porte.via_entrada_salida;
      delete this.facturaInfo.carta_porte.regimen_aduanero;
      delete this.facturaInfo.carta_porte.regimenes_aduaneros;
    } else {
      if (this.facturaInfo.carta_porte.regimenes_aduaneros) {
        const { regimenes_aduaneros } = this.facturaInfo.carta_porte;
        this.facturaInfo.carta_porte.regimenes_aduaneros = JSON.parse(regimenes_aduaneros);
      }
    }

    this.facturaInfo.carta_porte.cve_transporte = '01';
  }

  public showSuccessModal() {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: this.translateService.instant('invoice.cp-page.success-title'),
        message: this.translateService.instant('invoice.cp-page.success-message'),
        action: () => {
          if (this.redirectTo) {
            this.router.navigateByUrl(this.redirectTo);
          } else {
            this._location.back();
          }
        },
      },
      restoreFocus: false,
    });
  }

  public showErrorModal(error: string[] | string) {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: this.translateService.instant('invoice.cp-page.error-title'),
        message: error,
      },
      restoreFocus: false,
    });
  }

  public showReadOnlyAlert() {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: this.translateService.instant('invoice.cp-page.readonly-title'),
        action: () => {
          this.router.navigateByUrl('/operations/facturas');
        },
      },
      restoreFocus: false,
      disableClose: true,
    });
  }
}
