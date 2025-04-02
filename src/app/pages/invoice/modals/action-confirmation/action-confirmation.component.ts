import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { routes } from '../../consts';

@Component({
  selector: 'app-action-confirmation',
  templateUrl: './action-confirmation.component.html',
  styleUrls: ['./action-confirmation.component.scss'],
})
export class ActionConfirmationComponent {
  public routes: typeof routes = routes;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ActionConfirmationComponent>,
    private notificationsService: NotificationsService,
    private apiRestService: AuthService,
    private router: Router,
  ) {}

  public async confirmAction() {
    (
      await this.apiRestService.apiRest(JSON.stringify(this.data.modalPayload.body), this.data.modalPayload.endpoint)
    ).subscribe(
      (res) => {
        this.notificationsService.showSuccessToastr(this.data.modalPayload.successMessage);
        this.dialogRef.close(true);
      },
      (err) => {
        if (err.status === 401) {
          this.router.navigate([this.routes.LOGIN]).then();
        } else {
          this.notificationsService.showErrorToastr(this.data.modalPayload.errorMessage);
          console.error('ON ERROR', err);
        }

        this.dialogRef.close();
      },
    );
  }

  public readirectToEmitters() {
    this.close();
    this.router.navigate([this.routes.EMISORES]);
  }

  public close() {
    this.dialogRef.close();
  }
}
