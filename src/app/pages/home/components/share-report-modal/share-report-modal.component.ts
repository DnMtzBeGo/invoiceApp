import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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
  lang = {
    done: this.sended ? 'Awesome' : 'Send'
  };

  fullname: string = '';
  email: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Data,
    public dialogRef: MatDialogRef<ShareReportModalComponent>,
    private apiRestService: AuthService
  ) {
    console.log('open share modal: ', data);
  }

  async sendReport() {
    console.log('try send report: ', this.fullname, this.email);
    if (!this.fullname && !this.email) return;

    const requestJson = JSON.stringify({
      ...this.data.options,
      invitations: [
        {
          email: this.email,
          name: this.fullname
        }
      ]
    });

    console.log('sending report: ', requestJson);

    (
      await this.apiRestService.apiRest(requestJson, `polygons/${this.data.heatmap ? 'heatmaps' : 'dispersion'}/share_report`, {
        apiVersion: 'v1.1'
      })
    ).subscribe({
      next: ({ result }) => {
        console.log('dispersion: ', result);
        this.sended = true;
      }
    });
  }

  async actions(action: string) {
    console.log('actions: ', action);
    if (action === 'done' && !this.sended) await this.sendReport();
    if (action === 'done' && this.sended) this.done();
  }

  done() {
    this.dialogRef.close();
  }

  back() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
