import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cargo-units',
  template: `
    <div class="cargo-units">
      <label>Unidades de carga:</label>
      <input type="text" 
             [value]="units" 
             (input)="onUnitsChange($event)"
             placeholder="Ingrese las unidades">
    </div>
  `,
  styles: [`
    .cargo-units {
      margin: 10px 0;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  `]
})
export class CargoUnitsComponent {
  @Input() units: string = '';
  @Output() unitsChange = new EventEmitter<string>();

  onUnitsChange(event: any) {
    this.unitsChange.emit(event.target.value);
  }
}