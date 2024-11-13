import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';

import { reactiveComponent } from 'src/app/shared/utils/decorators';
import { oof } from 'src/app/shared/utils/operators.rx';
import { groupStatus } from '../../containers/factura-edit-page/factura.core';

const parseNumbers = (str?: string) => {
  str = str || '';
  if (str === '') return [];
  return str.split(',').map(Number);
};

@Component({
  selector: 'app-factura-filters',
  templateUrl: './factura-filters.component.html',
  styleUrls: ['./factura-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
})
export class FacturaFiltersComponent implements OnInit {
  public $rx = reactiveComponent(this);

  public vm: {
    form?: {
      invoice: string;
      motivo_cancelacion: string;
      uuid_relacion: string;
    };
    tiposComprobante?: unknown[];
    facturaStatus?: unknown[];
    metodosDePago?: unknown[];
    params?: {
      uuid?: string;
      fec_inicial?: Date;
      fec_final?: Date;
      emisor?: string;
      receptor?: string;
      tipo_de_comprobante?: string;
      status?: string;
      metodo_de_pago?: string;
    };
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<FacturaFiltersComponent>,
    public router: Router,
    public route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    //FORM
    const form$ = oof({
      invoice: this.data._id,
      motivo_cancelacion: '',
      uuid_relacion: '',
    });

    //CATALOGOS
    const tiposComprobante$ = oof(this.data.tiposComprobante);
    const facturaStatus$ = oof(groupStatus(this.data.facturaStatus));
    const metodosDePago$ = oof(this.data.metodosDePago);
    //PARAMS

    const params$ = oof(this.data.params);

    this.vm = this.$rx.connect({
      form: form$,
      tiposComprobante: tiposComprobante$,
      facturaStatus: facturaStatus$,
      params: params$,
      metodosDePago: metodosDePago$,
    });
  }

  //METHODS
  public apply(): void {
    this.dialogRef.close(this.vm.params);
  }

  public deselectRadio(event: any): void {
    window.requestAnimationFrame(() => {
      const el = event.target?.closest('mat-radio-group')?.querySelector('mat-radio-button.empty-radio input');
      el?.click();
    });
  }

  // UTILS
  public log = (...args: any[]): void => {
    console.log(...args);
  };

  public showError = (error: any): string => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error).join(',\n') : error;
  };

  public parseNumbers = parseNumbers;

  public filterClave =
    (clave) =>
    (item): boolean => {
      return item !== clave;
    };
}
