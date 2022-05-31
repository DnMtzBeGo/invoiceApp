import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BehaviorSubject, Subject } from 'rxjs';
import { InfoModalComponent } from "src/app/pages/invoice/modals/info-modal/info-modal.component";

@Injectable({
  providedIn: "root",
})
export class CartaPorteInfoService {
  public info: any;
  public infoRecolector = new Subject();
  public emitShowFraccion = new BehaviorSubject(false);
  public invalidInfo: boolean;

  constructor(private matDialog: MatDialog) {
    this.info = this.resetCartaPorteInfo();
  }

  addRecolectedInfo(infoToAdd: any) {
    const { isValid } = infoToAdd;
    delete infoToAdd.isValid;
    if (!isValid && !this.invalidInfo) {
      this.invalidInfo = true;
      // this.showInvalidInfoModal(
      //   `Se encontró un error en ${Object.keys(infoToAdd)[0].replace(
      //     /_/g,
      //     ' '
      //   )}`
      // );
    }
    Object.assign(this.info, infoToAdd);
  }

  addRecoletedInfoMercancias(infoToAdd: any): void {
    if (!this.info.mercancias) this.info.mercancias = {};
    Object.assign(this.info.mercancias, infoToAdd);
  }

  showInvalidInfoModal(message: string) {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: "La información es invalida",
        message,
      },
      restoreFocus: false,
    });
  }

  resetCartaPorteInfo(): void {
    this.info = {
      version: "2.0",
      mercancias: {},
    };
  }

  showSuccessModal() {}

  showFraccionArancelaria(data: boolean) {
    this.emitShowFraccion.next(data);
    return this.emitShowFraccion
  }
}
