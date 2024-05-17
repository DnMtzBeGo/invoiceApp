import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AuthService } from 'src/app/shared/services/auth.service';

interface Data {
  _id: string;
  title: string;
  created: string;
}

@Component({
  selector: 'app-history-modal',
  templateUrl: './history-modal.component.html',
  styleUrls: ['./history-modal.component.scss']
})
export class HistoryModalComponent {
  title: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Data,
    public dialogRef: MatDialogRef<HistoryModalComponent>,
    private apiRestService: AuthService
  ) {
    this.title = `"${this.data.title}"`;
  }

  async deleteHistory() {
    // this.dialogRef.close(true);
    // return;
    (
      await this.apiRestService.apiRestDelete(`assistant/${this.data._id}`, {
        apiVersion: 'v1.1'
      })
    ).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => console.error(err)
    });
  }

  async actions(action: string) {
    if (action === 'done') this.deleteHistory();
    else this.back();
  }

  back() {
    this.dialogRef.close();
  }
}
