import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  // public timeOut = Infinity;

  constructor(private snackBar: MatSnackBar) {}

  public showSuccessToastr(message: string = '', duration: number = 5000, style: string = 'brand-snackbar-1'): void {
    let toast = this.snackBar.open(message, '', {
      duration: duration,
      panelClass: [style],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  showErrorToastr(message: string, duration: number = 5000, style: string = 'brand-snackbar-1'): void {
    this.showSuccessToastr(message, duration, style);
  }

  showInfoToastr(message: string, duration: number = 5000): void {
    this.showSuccessToastr(message, duration);
  }
}
