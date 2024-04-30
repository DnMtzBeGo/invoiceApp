import { EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pricing-step',
  templateUrl: './pricing-step.component.html',
  styleUrls: ['./pricing-step.component.scss']
})
export class PricingStepComponent implements OnInit {
  @Input() draftData: any;
  @Output() pricingStepFormData = new EventEmitter<any>();
  @Output() validPricingStep = new EventEmitter<boolean>();

  orderId: string = '';
  deferredPayment = false;

  payModeOptions = {
    pue: { label: 'PUE', value: false },
    ppd: { label: 'PPD', value: true }
  };

  currencyOptions = {
    mxn: { label: 'MXN', value: 'mxn' },
    usd: { label: 'USD', value: 'usd' }
  };

  public pricingForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.pricingForm = this.formBuilder.group({
      subtotal: [0],
      deferred_payment: [false],
      currency: ['mxn']
    }, { updateOn: 'blur' });

    this.pricingForm.statusChanges.subscribe((status) => {
      this.validPricingStep.emit(status === 'VALID');
    });

    this.pricingForm.valueChanges.subscribe((value) => {
      this.pricingStepFormData.emit(value);
    });
 
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.draftData && changes.draftData.currentValue){
      const { pricing}  = changes.draftData.currentValue;
      if(pricing){
        this.pricingForm.setValue(pricing);
      }
    }
  }

  updateSubtotalInput(el: HTMLInputElement) {
    if (el.value) return;

    el.value = `$${this.pricingForm.controls.subtotal.value}`;
  }

  changePay(data: any) {
    this.pricingForm.get('deferred_payment').setValue(data.value);
    this.deferredPayment = data.value;
  }

  changePricingMethod(data: any) {
    this.pricingForm.get('currency').setValue(data.value);
  }
}
