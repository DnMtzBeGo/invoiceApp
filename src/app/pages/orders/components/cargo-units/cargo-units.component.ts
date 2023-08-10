import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

const INITIAL_UNIT_VALUE = 1000;

@Component({
  selector: 'app-cargo-units',
  templateUrl: './cargo-units.component.html',
  styleUrls: ['./cargo-units.component.scss']
})
export class CargoUnitsComponent implements OnInit {
  @Input() units: number[] = [];
  @Output() unitsChange = new EventEmitter<number[]>();

  maxUnits = Number.MAX_SAFE_INTEGER;

  constructor() { }

  ngOnInit(): void {}

  updateUnitsQuantity(newQuantity: number) {
    if (newQuantity > this.units.length) {
      this.unitsChange.emit([...this.units, INITIAL_UNIT_VALUE])
    } else {
      this.unitsChange.emit(this.units.slice(0, -1))
    }
  }
}
