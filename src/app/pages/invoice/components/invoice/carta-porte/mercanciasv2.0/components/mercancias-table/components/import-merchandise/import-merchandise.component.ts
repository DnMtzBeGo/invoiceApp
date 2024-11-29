import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';

import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CartaPorteInfoService } from '../../../../../services/carta-porte-info.service';

export interface IMultipleFilesLang {
  name: string;
  labelBrowse: string;
  labelOr: string;
  btnBrowse: string;
  labelMax: string;
  uploading: string;
}

@Component({
  selector: 'app-import-merchandise',
  templateUrl: './import-merchandise.component.html',
  styleUrls: ['./import-merchandise.component.scss'],
})
export class ImportMerchandiseComponent implements OnInit {
  public multipleFilesLang: IMultipleFilesLang;
  public invoice_id: string;
  constructor(
    private readonly apiRestService: AuthService,
    private readonly translateService: TranslateService,
    private readonly dialogRef: MatDialogRef<ImportMerchandiseComponent>,
    private readonly notificationsService: NotificationsService,
    private readonly httpClient: HttpClient,
    private readonly consignmentNoteService: CartaPorteInfoService,
  ) {}

  public allowedFileTypes: string[] = ['.xlsx'];
  public file: { name: string; date: Date; size: number } = null;
  public lang: string;

  public ngOnInit(): void {
    this.multipleFilesLang = {
      name: this.translateService.instant('orders.upload-multiple-orders.name'),
      labelBrowse: this.translateService.instant('orders.upload-multiple-orders.labelBrowse'),
      labelOr: this.translateService.instant('orders.upload-multiple-orders.labelOr'),
      btnBrowse: this.translateService.instant('orders.upload-multiple-orders.btnBrowse'),
      labelMax: this.translateService.instant('orders.upload-multiple-orders.labelMax'),
      uploading: this.translateService.instant('orders.upload-multiple-orders.uploading'),
    };

    this.invoice_id = this.consignmentNoteService.invoice_id;

    this.lang = localStorage.getItem('lang') || 'en';
  }

  public close(success: boolean = false): void {
    this.dialogRef.close(success);
  }

  public downloadLayoutTemplate(): void {
    const URL: string =
      'https://begoclients.s3.amazonaws.com/production/layouts/orders/layout-multiple-merchandise-order.xlsx';
    this.httpClient.get(URL, { responseType: 'blob' }).subscribe((blob) => {
      const link = document.createElement('a');
      const objectUrl = window.URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = URL.split('/').pop() || 'archivo';
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    });
  }

  public handleFileChange(file?: File) {
    if (file) {
      console.log('trying');
      this.file = {
        name: file.name,
        date: new Date(file.lastModified),
        size: file.size,
      };
      this.uploadMultipleCargoFile(file);
    } else {
      this.file = null;
      this.deleteMultipleCargoFile();
    }
  }

  private async uploadMultipleCargoFile(file: File) {
    if (!this.invoice_id) return;

    const formData = new FormData();
    formData.append('file', file);

    const req = await this.apiRestService.uploadFilesSerivce(
      formData,
      `consignment-note/import-merchandise/${this.invoice_id}`,
      { apiVersion: 'v1.0' },
      { timeout: '300000' },
    );

    await req
      .toPromise()
      .then((d) => {
        this.dialogRef.close(true);
      })
      .catch(
        ({
          error: {
            result: { errors, message },
          },
        }) => {
          const errorsAsStringArray = errors.map(
            (error: { line: number; error: string }) => `Línea ${error.line} ${error.error}`,
          );

          this.notificationsService.showErrorToastr(
            message + '\n' + errorsAsStringArray.join('\n'),
            10000,
            'brand-snackbar-2',
          );
        },
      );
  }

  private async deleteMultipleCargoFile() {
    if (!this.invoice_id) return;
    const req = await this.apiRestService.apiRest(null, `consignment-note/remove-multiple/${this.invoice_id}`, {
      apiVersion: 'v1.0',
      timeout: '300000',
    });
    await req.toPromise();
  }

  public invalidFile() {
    this.notificationsService.showErrorToastr('Archivo inválido');
  }
}
