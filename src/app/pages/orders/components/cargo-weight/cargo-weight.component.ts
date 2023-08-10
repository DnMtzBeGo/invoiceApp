import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CargoWeight } from '../../interfaces/cargo-weight'

@Component({
  selector: 'app-cargo-weight',
  templateUrl: './cargo-weight.component.html',
  styleUrls: ['./cargo-weight.component.scss']
})
export class CargoWeightComponent implements OnInit {
  maxUnits = Number.MAX_SAFE_INTEGER;

  constructor(
    public dialogRef: MatDialogRef<CargoWeightComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CargoWeight
  ) {}

  ngOnInit() {}

  updateUnit(i: number, value: number) {
    this.data.units[i] = value;
  }

  save() {
    this.dialogRef.close(this.data.units);
  }

  // needed to avoid extrange visual changes
  trackByIndex(i: number, _value: number) {
    return i;
  }
}
