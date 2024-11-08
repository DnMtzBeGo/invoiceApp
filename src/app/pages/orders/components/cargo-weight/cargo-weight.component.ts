import { Component, OnInit, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';

import { CargoWeight } from '../../interfaces/cargo-weight';

@Component({
  selector: 'app-cargo-weight',
  templateUrl: './cargo-weight.component.html',
  styleUrls: ['./cargo-weight.component.scss'],
})
export class CargoWeightComponent {
  private maxUnits = Number.MAX_SAFE_INTEGER;
  public arrayButtons: any;

  constructor(
    public dialogRef: MatDialogRef<CargoWeightComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: CargoWeight,
  ) {
    this.arrayButtons = [
      {
        textBtn: this.translateService.instant('orders.btn-save'),
        textEmit: 'close',
        activated: true,
      },
    ];
  }

  public updateUnit(i: number, value: number) {
    this.data.units[i] = value;
  }

  public save() {
    this.dialogRef.close(this.data.units);
  }

  // needed to avoid extrange visual changes
  public trackByIndex(i: number, _value: number) {
    return i;
  }
}
