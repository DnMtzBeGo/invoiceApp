import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ApiRestService } from '@begomx/ui-components';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { generateIDCCP } from 'src/app/pages/invoice/containers/factura-edit-page/factura.core';

import { InfoModalComponent } from 'src/app/pages/invoice/modals/info-modal/info-modal.component';
import { ICommodity } from '../mercanciasv2.0/model';
import { Paginator } from 'src/app/pages/invoice/models';

@Injectable({
  providedIn: 'root',
})
export class CartaPorteInfoService {
  public ACTIVE_VERSION = '3.1';

  public invoice_id: string = '';

  public id_ccp: string;
  public info: any;
  public infoRecolector = new Subject();
  public emitShowFraccion = new BehaviorSubject(false);
  public invalidInfo: boolean;

  public commodities: ICommodity[] = [];

  constructor(private matDialog: MatDialog, private readonly api: ApiRestService) {
    this.resetCartaPorteInfo();
  }

  public addRecolectedInfo(infoToAdd: any) {
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
    this.info = { ...this.info, ...infoToAdd };
  }

  public addRecoletedInfoMercancias(infoToAdd: any): void {
    const _getTotalWeight = () => this.commodities.reduce((total, item) => total + (item.peso_en_kg || 0), 0);

    if (!this.info?.mercancias) this.info.mercancias = {};

    const data = {
      ...this.info.mercancias,
      ...infoToAdd,
    };

    // If is a new invoice the merchandise data will be send with the invoice data
    // otherwise it will be sent directly to the server when edit or add a merchandise
    if (!this.invoice_id) {
      data.peso_bruto_total = _getTotalWeight();
      data.num_total_mercancias = this.commodities.length;
      data.mercancia = [...this.commodities];
      data.peso_bruto_total = _getTotalWeight();
    } else {
      if (infoToAdd.num_total_mercancias) data.num_total_mercancias = infoToAdd.num_total_mercancias;
      if (infoToAdd.peso_bruto_total) data.peso_bruto_total = infoToAdd.peso_bruto_total;
    }

    this.info = { ...this.info, mercancias: data };

    //console.log({ info2: this.info });
  }

  public showInvalidInfoModal(message: string) {
    this.matDialog.open(InfoModalComponent, {
      data: {
        title: 'La información es invalida',
        message,
      },
      restoreFocus: false,
    });
  }

  public resetCartaPorteInfo(): void {
    this.info = {
      version: this.ACTIVE_VERSION,
      regimenes_aduaneros: '[]',
      mercancias: {},
      id_ccp: generateIDCCP(),
    };
  }

  public showFraccionArancelaria(data: boolean) {
    this.emitShowFraccion.next(data);
    return this.emitShowFraccion;
  }

  public getMerchandise(component: any, pagination: Paginator): void {
    if (this.invoice_id) {
      this.api
        .request('GET', `consignment-note/merchandise/${this.invoice_id}`, {
          params: { page: pagination.pageIndex.toString(), limit: pagination.pageSize.toString() },
        })
        .subscribe((response) => {
          this._setCommodities(response.result.merchandise).then(() => {
            if (component) {
              component.handleUpdate();
              component.commoditiesTable.pageUI = {
                index: response.result.page,
                total: response.result.total,
                size: response.result.limit,
              };
              // component.page = {
              //   pageIndex: response.result.page,
              //   pageSize: response.result.limit,
              //   pageTotal: response.result.pages,
              //   pageSearch: '',
              // };
            }
          });
        });
    }
  }

  public createOrUpdateCommodityAtDatabase(data: ICommodity): Observable<any> {
    const body = { ...data };
    delete body.id; // removing local id
    return this.api.request('POST', `consignment-note/merchandise/create-or-update/${this.invoice_id}`, { body });
  }

  private async _setCommodities(commodities: ICommodity[]): Promise<void> {
    this.commodities = [...commodities];
  }

  public unloadService() {
    this.resetCartaPorteInfo();
    this.commodities = [];
    this.infoRecolector.complete();
    this.emitShowFraccion.complete();
    this.invalidInfo = false;
    this.invoice_id = '';
    this.id_ccp = '';
    this.info = null;
    this.infoRecolector.next(null);
    this.emitShowFraccion.next(false);
    this.invalidInfo = false;
    this.commodities = [];
    this.info = null;
    this.infoRecolector.next(null);
    this.emitShowFraccion.next(false);
    this.invalidInfo = false;
    this.invoice_id = '';
    this.id_ccp = '';
    this.info = null;
    this.infoRecolector.next(null);
    this.emitShowFraccion.next(false);
  }
}
