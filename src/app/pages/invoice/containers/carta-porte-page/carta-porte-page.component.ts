import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
// import { ApiRestService } from "src/app/core/services";
import { AuthService } from "src/app/shared/services/auth.service";
import { InfoModalComponent } from "../../modals/info-modal/info-modal.component";
import { CartaPorteInfoService } from "../../components/invoice/carta-porte/services/carta-porte-info.service";
import { SubtiposRemolques } from "../../models/invoice/carta-porte/subtipos-remolques";
import { facturaPermissions } from "../factura-edit-page/factura.core";

@Component({
  selector: "app-carta-porte-page",
  templateUrl: "./carta-porte-page.component.html",
  styleUrls: ["./carta-porte-page.component.scss"],
})
export class CartaPortePageComponent implements OnInit {
  public subtiposRemolquesList: SubtiposRemolques;
  public catalogues: any;
  private cartaPorteId: string;
  private redirectTo: string;
  public facturaInfo: any;

  public transporteInfo: any;
  public ubicacionesInfo: any;
  public mercanciasInfo: any;
  public figuraTransporteInfo: any;

  isLinear = false;
  constructor(
    public cartaPorteInfoService: CartaPorteInfoService,
    private _location: Location,
    public router: Router,
    public route: ActivatedRoute,
    public apiRestService: AuthService,
    public matDialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.cartaPorteId = this.route.snapshot.paramMap.get("id");
    this.redirectTo = this.route.snapshot.paramMap.get("redirectTo");
    const payload = { _id: this.cartaPorteId };
    this.facturaInfo = (
      await this.apiRestService.apiRestGet("invoice", payload)
    ).subscribe((e) => {
      this.facturaInfo = e.result.invoices[0];
      const { carta_porte } = this.facturaInfo;
      if (carta_porte) {
        this.transporteInfo = carta_porte;
        this.figuraTransporteInfo = carta_porte.figura_transporte;
        this.ubicacionesInfo = carta_porte.ubicaciones;
        this.mercanciasInfo = carta_porte.mercancias;
      }
      const { readonly } = facturaPermissions(this.facturaInfo);
      if (readonly) {
        this.showReadOnlyAlert();
      }
    });
  }

  async gatherInfo(): Promise<void> {
    this.cartaPorteInfoService.invalidInfo = false;
    this.cartaPorteInfoService.resetCartaPorteInfo();
    this.cartaPorteInfoService.infoRecolector.next(null);
    this.facturaInfo.carta_porte = this.cartaPorteInfoService.info;

    this.facturaInfo.carta_porte.total_dist_rec =
      this.facturaInfo.carta_porte.ubicaciones
        .filter((e) => e.tipo_ubicacion == "Destino")
        .map((e) => e.distancia_recorrida || 0)
        .reduce((a, b) => a + b, 0);

    if (this.facturaInfo.carta_porte.transp_internac == "No") {
      delete this.facturaInfo.carta_porte.pais_origen_destino;
      delete this.facturaInfo.carta_porte.entrada_salida_merc;
      delete this.facturaInfo.carta_porte.via_entrada_salida;
    }

    (
      await this.apiRestService.apiRest(
        JSON.stringify(this.facturaInfo),
        "invoice/update"
      )
    ).subscribe(
      (r) => {
        this.showSuccessModal();
      },
      (error) => {
        console.log("an error ocurrend, error is: ", error);
        this.showErrorModal(
          error.error.result.message.map((e) => {
            const msg = e.error;
            const pre = e.field.split("/");

            if (pre[2]?.trim() == "autotransporte") pre[1] = "Autotransporte";
            return `En ${pre[1]}: ${msg}`;
          })
        );
      }
    );
  }

  showSuccessModal() {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: "Carta porte",
        message: "La carta porte se ha guardado de manera satisfactoria",
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

  showErrorModal(error: string[] | string) {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: "La información es invalida",
        message: error,
      },
      restoreFocus: false,
    });
  }

  showReadOnlyAlert() {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: "Esta carta porte ya no puede ser editada",
        action: () => {
          this.router.navigateByUrl("/operations/facturas");
        },
      },
      restoreFocus: false,
      disableClose: true,
    });
  }
}
