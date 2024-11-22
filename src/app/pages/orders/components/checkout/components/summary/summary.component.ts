import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent {
  public summaryForm: FormGroup = this.formBuilder.group({
    fullName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    phoneCode: ['', Validators.required],
    email: ['', Validators.required],
    company: ['', Validators.required],
    rfc: ['', Validators.required],
    cfdi: ['', Validators.required],
  });

  public formIsDisabled: boolean = true;

  @Input() public orderData: any = {};
  @Input() public selectedCard: string = 'pickup';
  @Input() public weights: any;

  @ViewChild('weightTextArea') public weightTextArea!: ElementRef;

  constructor(private formBuilder: FormBuilder) {}

  public phoneBreakDown(phone: string) {
    const splittedPhone = phone.split(' ');
    const dialCode = splittedPhone.shift();
    const barePhone = splittedPhone.join(' ');
    return { dialCode, barePhone };
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.orderData && this.orderData) {
      let pickupContactInfo = this.orderData?.pickup?.contact_info;
      let dropoffContactInfo = this.orderData?.dropoff?.contact_info;

      const pickupPhone = this.phoneBreakDown(pickupContactInfo.telephone);
      const dropoffPhone = this.phoneBreakDown(dropoffContactInfo.telephone);

      Object.assign(pickupContactInfo, pickupPhone);
      Object.assign(dropoffContactInfo, dropoffPhone);
    }
  }
}
