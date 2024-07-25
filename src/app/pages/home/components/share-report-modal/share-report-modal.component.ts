import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';

import { AuthService } from 'src/app/shared/services/auth.service';

interface Data {
  options: Options;
  heatmap: boolean;
  activeDrivers: boolean;
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

const DAY = 86_399_000;

@Component({
  selector: 'app-share-report-modal',
  templateUrl: './share-report-modal.component.html',
  styleUrls: ['./share-report-modal.component.scss'],
})
export class ShareReportModalComponent {
  public sended: boolean = false;
  public shareForm: FormGroup;
  public validForm: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Data,
    public dialogRef: MatDialogRef<ShareReportModalComponent>,
    private apiRestService: AuthService,
    private formBuilder: FormBuilder,
  ) {
    this.shareForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.shareForm.valueChanges.subscribe(() => {
      this.validForm = this.shareForm.valid;
    });
  }

  public async sendReport() {
    if (!this.shareForm.valid) return;

    const { start_date, ...options } = this.data.options;

    const requestJson = JSON.stringify({
      ...options,
      ...(this.data.heatmap ? { start_date, end_date: options.end_date + DAY } : { date: start_date + DAY }),
      ...(!this.data.heatmap && { include_older_locations: this.data.activeDrivers }),
      invitations: [
        {
          email: this.shareForm.get('email').value,
          name: this.shareForm.get('name').value,
        },
      ],
    });

    (
      await this.apiRestService.apiRest(
        requestJson,
        `polygons/${this.data.heatmap ? 'heatmaps' : 'dispersion'}/share_report`,
        {
          apiVersion: 'v1.1',
        },
      )
    ).subscribe({
      next: () => {
        this.sended = true;
      },
      error: (err) => console.error(err),
    });
  }

  public async actions(action: string) {
    if (action === 'done' && !this.sended) await this.sendReport();
    if (action === 'done' && this.sended) this.done();
  }

  public done() {
    this.dialogRef.close();
  }

  public back() {
    this.dialogRef.close();
  }
}
