import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class NotificationsService {
  public timeOut = 3000;
  // public timeOut = Infinity;

  constructor(private snackBar: MatSnackBar) {}

  public showSuccessToastr(message): void {
    let toast = this.snackBar.open(message, "", {
      duration: this.timeOut,
      panelClass: ["brand-snackbar-1"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  }

  showErrorToastr(message): void {
    this.showSuccessToastr(message);
  }

  showInfoToastr(message): void {
    this.showSuccessToastr(message);
  }
}
