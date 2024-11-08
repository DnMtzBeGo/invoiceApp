import { previewFactura, toFactura } from '../factura-edit-page/factura.core';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { ApiRestService } from 'src/app/services/api-rest.service';

export class InvoicePDF {
  public pdfLinkSource: string;
  public viewPdfLinkSource: string;

  constructor(private readonly api: ApiRestService, private readonly _notificationsService: NotificationsService) {}
  public downloadPreviewById(invoice_id: string): void {
    this.api
      .request('GET', `invoice/preview-by-id/${invoice_id}`, {
        specifics: {
          responseType: 'arraybuffer',
        },
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], {
            type: 'application/pdf',
          });

          if (this.pdfLinkSource) this.revokePdfUrl();

          this.pdfLinkSource = URL.createObjectURL(blob);

          const downloadLink = document.createElement('a');
          downloadLink.href = this.pdfLinkSource;
          downloadLink.target = '_blank';
          // downloadLink.download = 'Vista previa.pdf'
          downloadLink.click();
        },
        error: (error) => {
          console.log(error);
          this._notificationsService.showErrorToastr('Error al generar vista previa');
        },
      });
  }

  public downloadPreview(factura: any): void {
    console.log({ factura });
    if (factura == void 0) return;
    this.api
      .request('POST', 'invoice/preview', {
        body: previewFactura(toFactura({ ...factura })),
        specifics: {
          responseType: 'arraybuffer',
        },
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], {
            type: 'application/pdf',
          });

          if (this.pdfLinkSource) this.revokePdfUrl();

          this.pdfLinkSource = URL.createObjectURL(blob);

          const downloadLink = document.createElement('a');
          downloadLink.href = this.pdfLinkSource;
          downloadLink.target = '_blank';
          // downloadLink.download = 'Vista previa.pdf'
          downloadLink.click();
        },
        error: (error) => {
          console.log(error);
          this._notificationsService.showErrorToastr('Error al generar vista previa');
        },
      });
  }

  public openInNewTab(url: string): void {
    this.api
      .request('GET', `invoice/utils/get-pdf-file/${encodeURIComponent(url)}`, {
        specifics: {
          responseType: 'arraybuffer',
        },
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], {
            type: 'application/pdf',
          });

          if (this.viewPdfLinkSource) this.revokePdfUrl();

          this.viewPdfLinkSource = URL.createObjectURL(blob);

          const viewLink = document.createElement('a');
          viewLink.href = this.viewPdfLinkSource;
          viewLink.target = '_blank';
          // viewLink.download = 'Vista previa.pdf'
          viewLink.click();
        },
        error: (error) => {
          console.log(error);
          this._notificationsService.showErrorToastr('Error al obtener el archivo');
        },
      });
  }

  public revokePdfUrl(): void {
    if (this.pdfLinkSource) URL.revokeObjectURL(this.pdfLinkSource);
    if (this.viewPdfLinkSource) URL.revokeObjectURL(this.viewPdfLinkSource);
  }
}
