import { Component, Input, Output, EventEmitter, Inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"],
})
export class ConfirmDialogComponent {
  @Output() hideItems: EventEmitter<any> = new EventEmitter();

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(ConfirmDialogDialogComponent, {
      width: "250px",
      data: {
        hideItems: this,
      },
    });
  }
}

@Component({
  selector: "app-confirm-dialog-dialog",
  templateUrl: "./confirm-dialog-dialog.component.html",
})
class ConfirmDialogDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {}

  ok() {
    const { hideItems } = this.data;

    hideItems.hideItems.emit(true);
    this.close();
  }
  close() {
    this.dialogRef.close();
  }
}
