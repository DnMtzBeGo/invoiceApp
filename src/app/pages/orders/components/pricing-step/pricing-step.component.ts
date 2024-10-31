import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pricing-step',
  templateUrl: './pricing-step.component.html',
  styleUrls: ['./pricing-step.component.scss'],
})
export class PricingStepComponent {
  @Input() public draftData: any;
  @Output() public pricingStepFormData = new EventEmitter<any>();
  @Output() public validPricingStep = new EventEmitter<boolean>();

  public orderId: string = '';

  public payModeOptions = {
    pue: { label: 'PUE', value: true },
    ppd: { label: 'PPD', value: false },
  };

  public currencyOptions = {
    mxn: { label: 'MXN', value: 'mxn' },
    usd: { label: 'USD', value: 'usd' },
  };

  public pricingForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.pricingForm = this.formBuilder.group(
      {
        subtotal: [0],
        deferred_payment: [false],
        currency: ['mxn'],
      },
      { updateOn: 'blur' },
    );

    this.pricingForm.statusChanges.subscribe((status) => {
      this.validPricingStep.emit(status === 'VALID');
    });

    this.pricingForm.valueChanges.subscribe((value) => {
      this.pricingStepFormData.emit(value);
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.draftData && changes.draftData.currentValue) {
      const { pricing } = changes.draftData.currentValue;
      if (pricing) {
        this.pricingForm.setValue(pricing);
      }
    }
  }

  public updateSubtotalInput(el: HTMLInputElement) {
    if (el.value) return;

    el.value = `$${this.pricingForm.controls.subtotal.value}`;
  }

  public changePay(data: any) {
    this.pricingForm.get('deferred_payment').setValue(!data.value);
  }

  public changePricingMethod(data: any) {
    this.pricingForm.get('currency').setValue(data.value);
  }
}
