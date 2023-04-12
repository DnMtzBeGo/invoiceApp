import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { InfoModalComponent } from '../../modals/info-modal/info-modal.component';
import { CartaPorteInfoService } from '../../components/invoice/carta-porte/services/carta-porte-info.service';
import { SubtiposRemolques } from '../../models/invoice/carta-porte/subtipos-remolques';
import { facturaPermissions } from '../factura-edit-page/factura.core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
@Component({
  selector: 'app-carta-porte-page',
  templateUrl: './carta-porte-page.component.html',
  styleUrls: ['./carta-porte-page.component.scss']
})
export class CartaPortePageComponent implements OnInit {
  public subtiposRemolquesList: SubtiposRemolques;
  public catalogues: any;
  private cartaPorteId: string;
  private redirectTo: string;

  @Input() facturaInfo: any;

  public transporteInfo: any;
  public ubicacionesInfo: any;
  public mercanciasInfo: any;
  public figuraTransporteInfo: any;
  public cartaPorteEnabled = [];
  public cartaPorteDisabled: boolean = false;
  isLinear = false;
  constructor(
    public cartaPorteInfoService: CartaPorteInfoService,
    private _location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public apiRestService: AuthService,
    public matDialog: MatDialog,
    private translateService: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    // this.cartaPorteId = this.route.snapshot.paramMap.get("id");
    // this.redirectTo = this.route.snapshot.paramMap.get("redirectTo");
    // const payload = { _id: this.cartaPorteId };
    // this.facturaInfo = (
    //   await this.apiRestService.apiRestGet("invoice", payload)
    // ).subscribe((e) => {
    //   this.facturaInfo = e.result.invoices[0];
    //   const { carta_porte } = this.facturaInfo;
    //   if (carta_porte) {
    //     this.transporteInfo = carta_porte;
    //     this.figuraTransporteInfo = carta_porte.figura_transporte;
    //     this.ubicacionesInfo = carta_porte.ubicaciones;
    //     this.mercanciasInfo = carta_porte.mercancias;
    //   }
    //   const { readonly } = facturaPermissions(this.facturaInfo);
    //   if (readonly) {
    //     this.showReadOnlyAlert();
    //   }
    // });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.facturaInfo?.currentValue?.carta_porte) {
      this.cartaPorteEnabled.push('carta_porte');
      this.facturaInfo.complementos = this.cartaPorteEnabled;
      this.facturaInfo = changes.facturaInfo?.currentValue;
      const { carta_porte } = this.facturaInfo;
      this.transporteInfo = carta_porte;
      this.figuraTransporteInfo = carta_porte.figura_transporte;
      this.ubicacionesInfo = carta_porte.ubicaciones;
      this.mercanciasInfo = carta_porte.mercancias;
    }

    if (changes.facturaInfo?.currentValue?.complementos.length > 0) {
      this.cartaPorteDisabled = true;
      // console.log('El switch se prende', this.cartaPorteDisabled);
    } else {
      this.cartaPorteDisabled = false;
      // console.log('El switch se apaga', this.cartaPorteDisabled);
    }
  }

  public cartaPorteStatus(event: MatSlideToggleChange) {
    if (event.checked) this.cartaPorteEnabled.push('carta_porte');
    else this.cartaPorteEnabled = [];
    this.facturaInfo.complementos = this.cartaPorteEnabled;
  }

  async gatherInfo(): Promise<void> {
    this.cartaPorteInfoService.invalidInfo = false;
    this.cartaPorteInfoService.resetCartaPorteInfo();
    this.cartaPorteInfoService.infoRecolector.next(null);
    this.facturaInfo.carta_porte = this.cartaPorteInfoService.info;

    this.facturaInfo.carta_porte.total_dist_rec = this.facturaInfo.carta_porte.ubicaciones
      .filter((e) => e.tipo_ubicacion == 'Destino')
      .map((e) => e.distancia_recorrida || 0)
      .reduce((a, b) => a + b, 0);

    if (this.facturaInfo.carta_porte.transp_internac == 'No') {
      delete this.facturaInfo.carta_porte.pais_origen_destino;
      delete this.facturaInfo.carta_porte.entrada_salida_merc;
      delete this.facturaInfo.carta_porte.via_entrada_salida;
    }

    this.facturaInfo.carta_porte.cve_transporte = '01';

    // (
    //   await this.apiRestService.apiRest(
    //     JSON.stringify(this.facturaInfo),
    //     "invoice/update"
    //   )
    // ).subscribe(
    //   (r) => {
    //     this.showSuccessModal();
    //   },
    //   (error) => {
    //     console.log("an error ocurrend, error is: ", error);
    //     this.showErrorModal(
    //       error.error.result.message.map((e) => {
    //         const msg = e.error;
    //         const pre = e.field.split("/");

    //         if (pre[2]?.trim() == "autotransporte") pre[1] = "Autotransporte";
    //         return `En ${pre[1]}: ${msg}`;
    //       })
    //     );
    //   }
    // );
  }

  showSuccessModal() {
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
        }
      },
      restoreFocus: false
    });
  }

  showErrorModal(error: string[] | string) {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: this.translateService.instant('invoice.cp-page.error-title'),
        message: error
      },
      restoreFocus: false
    });
  }

  showReadOnlyAlert() {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: this.translateService.instant('invoice.cp-page.readonly-title'),
        action: () => {
          this.router.navigateByUrl('/operations/facturas');
        }
      },
      restoreFocus: false,
      disableClose: true
    });
  }
}
