import { Component, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "src/app/shared/services/auth.service";
import { NotificationsService } from "src/app/shared/services/notifications.service";
import { FacturaEmitterComponent } from "../../components/factura-emitter/factura-emitter.component";
import { CataloguesListService } from "../../components/invoice/carta-porte/services/catalogues-list.service";

@Component({
  selector: "app-emisores",
  templateUrl: "./emisores.component.html",
  styleUrls: ["./emisores.component.scss"],
})
export class EmisoresComponent implements OnInit {
  dataSource: unknown[];
  public regimen_fiscal: Array<object> = [];

  constructor(
    public dialog: MatDialog,
    private notificationsService: NotificationsService,
    private apiRestService: AuthService,
    private catalogListService: CataloguesListService,
    private translateService: TranslateService
  ) {
    this.getEmisores();
  }

  async ngOnInit() {
    let result = await this.catalogListService.getCatalogue("regimen-fiscal");
    this.regimen_fiscal = result;

    // this.newEmisor();
  }

  public async getEmisores() {
    (await this.apiRestService.apiRestGet("invoice/emitters")).subscribe(
      (res) => {
        this.dataSource = res.result.documents;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  newEmisor(): void {
    const dialogRef = this.dialog.open(FacturaEmitterComponent, {
      restoreFocus: false,
      autoFocus: false,
      backdropClass: ["brand-dialog-1"],
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (!result.close) {
        if (result) {
          this.notificationsService.showSuccessToastr(
            this.translateService.instant("invoice.emisores.create-success")
          );
          this.getEmisores();
        } else {
          this.notificationsService.showErrorToastr(
            this.translateService.instant("invoice.emisores.create-error")
          );
        }
      }
    });
  }
}
