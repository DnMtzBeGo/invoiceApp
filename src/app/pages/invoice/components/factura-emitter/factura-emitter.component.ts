import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { EmitterAttributesInterface } from '../../models/invoice/emisores';
import { CataloguesListService } from '../invoice/carta-porte/services/catalogues-list.service';

@Component({
  selector: 'app-factura-emitter',
  templateUrl: './factura-emitter.component.html',
  styleUrls: ['./factura-emitter.component.scss']
})
export class FacturaEmitterComponent implements OnInit {
  public keySrc: any;
  public keyFile: any;
  public cerSrc: any;
  public cerFile: any;
  public regimen_fiscal: Array<object> = [];
  public isEditing: boolean = false;
  public isLoading: boolean = false;
  public flags: {
    keyFileError: boolean;
    cerFileError: boolean;
  } = {
    keyFileError: false,
    cerFileError: false
  };

  public emitterAttributesForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    regimen_fiscal: new FormControl('', [Validators.required]),
    archivo_cer: new FormControl('', [Validators.required]),
    archivo_key: new FormControl('', [Validators.required]),
    archivo_key_pswd: new FormControl('', [Validators.required])
  });

  constructor(
    private apiRestService: AuthService,
    private translateService: TranslateService,
    public dialogRef: MatDialogRef<FacturaEmitterComponent>,
    @Inject(MAT_DIALOG_DATA) public editData: EmitterAttributesInterface,
    private catalogListService: CataloguesListService,
    private notificationsService: NotificationsService
  ) {}

  async ngOnInit() {
    let result = await this.catalogListService.getCatalogue('regimen-fiscal');
    this.regimen_fiscal = result;
    if (this.editData) {
      this.isEditing = !!this.editData?._id;
      this.emitterAttributesForm.patchValue(this.editData as any);
      this.emitterAttributesForm.get('archivo_key_pswd').patchValue('');
    }
  }

  public async saveEmisor(): Promise<void | boolean> {
    this.emitterAttributesForm.markAllAsTouched();

    if (!this.emitterAttributesForm.valid) {
      if (!this.emitterAttributesForm.get('archivo_cer').valid) this.flags.cerFileError = true;
      if (!this.emitterAttributesForm.get('archivo_key').valid) this.flags.keyFileError = true;

      return false;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const formData = new FormData();
    formData.append('regimen_fiscal', this.emitterAttributesForm.get('regimen_fiscal').value);
    formData.append('email', this.emitterAttributesForm.get('email').value);
    if (this.emitterAttributesForm.get('archivo_key_pswd').value !== '')
      formData.append('archivo_key_pswd', this.emitterAttributesForm.get('archivo_key_pswd').value);
    if (this.cerFile) formData.append('archivo_cer', this.cerFile);
    if (this.keyFile) formData.append('archivo_key', this.keyFile);
    if (this.isEditing) formData.append('_id', this.editData._id);

    const type = this.isEditing ? 'update' : 'create';

    (await this.apiRestService.uploadFilesSerivce(formData, 'invoice/emitters/' + type, {})).subscribe(
      (res) => {
        this.isLoading = false;

        const message = this.translateService.instant(`invoice.emisor-edit.${type}-success`);

        this.notificationsService.showSuccessToastr(message);

        this.dialogRef.close({
          success: true,
          message,
          data: {
            _id: res.result?._id,
            rfc: res.result?.rfc,
            nombre: res.result?.razon_social,
            regimen_fiscal: this.emitterAttributesForm.get('regimen_fiscal').value
          }
        });
      },
      (err) => {
        console.log('uploading', err);
        this.isLoading = false;
        let message = '';

        if (typeof err.error?.error === 'object') {
          if (err.error?.error?.[0]) message = err.error?.error[0]?.error ?? err.statusText ?? err.message;
          else message = err.error?.error.error;
        } else message = err.error?.error;

        this.notificationsService.showErrorToastr(message);
      }
    );
  }

  public onFileSelected(event, type) {
    const inputNode = event.target;
    if (type === 'archivo_key') {
      this.flags.keyFileError = false;
      this.keyFile = inputNode.files[0];
    } else {
      this.flags.cerFileError = false;
      this.cerFile = inputNode.files[0];
    }

    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        console.log(e);
        if (type === 'archivo_key') {
          this.keySrc = e.target.result;
        } else {
          this.cerSrc = e.target.result;
        }
      };

      if (type === 'archivo_key') reader.readAsDataURL(this.keyFile);
      else reader.readAsDataURL(this.cerFile);
    }
  }

  public closeModal() {
    this.dialogRef.close({
      close: true
    });
  }
}
