import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edited-modal',
  templateUrl: './edited-modal.component.html',
  styleUrls: ['./edited-modal.component.scss']
})
export class EditedModalComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<EditedModalComponent>) {}

  ngOnInit(): void {}

  closeEmitter(type: 'ok' | 'cancel') {
    if (type === 'ok') this.done();
    else this.close();
  }

  done() {
    this.dialogRef.close();
  }
  
  close() {
    this.dialogRef.close();
  }
}
