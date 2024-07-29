import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { RegimenAduanero } from './interfaces';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-regimenes-aduaneros',
  templateUrl: './regimenes-aduaneros.component.html',
  styleUrls: ['./regimenes-aduaneros.component.scss'],
})
export class RegimenesAduanerosComponent implements OnInit {
  @Input() public entrada_salida_merc: string = '';
  @Input() public regimes_list: RegimenAduanero[] = [];
  @Input() public initialValue: string[] = [];
  @Output() public regimeHasChanged = new EventEmitter<string>();

  public items: string[] = [''];

  constructor(private readonly alertService: AlertService, private cd: ChangeDetectorRef) {}

  public ngOnInit(): void {
    if (this.initialValue.length) this.items = this.initialValue;
  }

  public addLine(): void {
    if (this.items.length < 10) this.items.push('');
  }

  public setRegimeCode(index: number, value: string): void {
    this.items[index] = value;
    this._emitValue();
  }

  public remove(index: number): void {
    this.alertService.create({
      title: 'Eliminar regimen aduanero',
      body: 'Por favor confirme la eliminación el regimen aduanero',
      handlers: [
        {
          text: 'Si, eliminar',
          action: () => {
            if (this.items.length > 1) this.items.splice(index, 1);
            else this.items[0] = '';
            this.cd.markForCheck();
            this._emitValue();
            this.alertService.close();
          },
        },
        {
          text: 'Cancelar',
          action: () => {
            this.alertService.close();
          },
        },
      ],
    });
  }

  private _emitValue(): void {
    const val = JSON.stringify(this.items);
    this.regimeHasChanged.emit(val === '[]' ? '' : val);
  }
}
