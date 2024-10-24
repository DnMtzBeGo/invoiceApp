import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { IRelatedDocumentEdit } from '../interfaces';

@Component({
  selector: 'app-edit-payment-bill',
  templateUrl: './edit-payment-bill.component.html',
  styleUrls: ['./edit-payment-bill.component.scss'],
})
export class EditPaymentBillComponent implements OnInit {
  @Input() public data: IRelatedDocumentEdit;
  @Output() public save: EventEmitter<IRelatedDocumentEdit> = new EventEmitter();
  @Output() public closeDialog: EventEmitter<IRelatedDocumentEdit> = new EventEmitter();

  public readonly: boolean = true;
  public editPaymentForm: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    this.editPaymentForm = this.formBuilder.group({
      uuid: new FormControl(''),
      serie_label: new FormControl(''),
      folio: new FormControl(''),
      moneda: new FormControl(''),
      tipo_de_cambio: new FormControl(''),
      parcialidad: new FormControl(''),
      saldo_pendiente: new FormControl(''),
      monto_a_pagar: new FormControl('', { validators: [Validators.required, Validators.min(0.01)] }),
    });
  }

  public ngOnInit() {
    this.editPaymentForm.patchValue(this.data);
  }

  public saveEdit() {
    this.save.emit({ ...this.data, ...this.editPaymentForm.value });
  }

  public closeEdit() {
    this.closeDialog.emit(null);
  }
}
