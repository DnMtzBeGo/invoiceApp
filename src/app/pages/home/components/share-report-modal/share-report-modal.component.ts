import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';

interface Data {
  options: Options;
  heatmap: boolean;
}

interface Options {
  drivers: string[];
  polygons: string[];
  tags: string[];
  start_date?: string;
  end_date?: string;
  date?: string;
  type?: string;
}

@Component({
  selector: 'app-share-report-modal',
  templateUrl: './share-report-modal.component.html',
  styleUrls: ['./share-report-modal.component.scss']
})
export class ShareReportModalComponent {
  sended: boolean = false;
  shareForm: FormGroup;
  validForm: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Data,
    public dialogRef: MatDialogRef<ShareReportModalComponent>,
    private apiRestService: AuthService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this.shareForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.shareForm.valueChanges.subscribe(() => {
      this.validForm = this.shareForm.valid;
    });
  }

  async sendReport() {
    if (!this.shareForm.valid) return;

    const { start_date, ...options } = this.data.options;

    const requestJson = JSON.stringify({
      ...options,
      ...(this.data.heatmap ? { start_date } : { date: start_date }),
      invitations: [
        {
          email: this.shareForm.get('email').value,
          name: this.shareForm.get('name').value
        }
      ]
    });

    (
      await this.apiRestService.apiRest(requestJson, `polygons/${this.data.heatmap ? 'heatmaps' : 'dispersion'}/share_report`, {
        apiVersion: 'v1.1'
      })
    ).subscribe({
      next: () => {
        this.sended = true;
      },
      error: (err) => console.error(err)
    });
  }

  async actions(action: string) {
    if (action === 'done' && !this.sended) await this.sendReport();
    if (action === 'done' && this.sended) this.done();
  }

  done() {
    this.dialogRef.close();
  }

  back() {
    this.dialogRef.close();
  }
}
