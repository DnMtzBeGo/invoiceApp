import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-insurance',
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.scss']
})
export class InsuranceComponent implements OnInit {
  @Output() cargoValues: EventEmitter<string> = new EventEmitter();
  @Output() getInsurance: EventEmitter<number> = new EventEmitter();
  @Input() totalInsurance: number = 0;
  @Input() cargoValueSet: boolean = true;
  @Input() slide: number = 0;

  lang: any;
  txtBtnCargo: string = '';
  activeBtnCargo: boolean = true
  btnQuit: number = 0;
  focused: boolean = true;

  insuranceForm: FormGroup = this.formBuilder.group({
    cargoValue: [0]
  });

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.txtBtnCargo = this.translateService.instant('checkout.insurance-modal.btn-add')

    this.insuranceForm.get('cargoValue')!.valueChanges.subscribe((value) => {
      if(value > 0) {
        this.activeBtnCargo = false
        this.btnQuit = this.btnQuit + 1;
      } else {
        this.activeBtnCargo = true
      }
    });
  }

  resetInputFormat() {
    let value = this.insuranceForm.get('cargoValue')!.value;
    if(value > 0) {
      this.cargoValues.emit(value)
    }
  }

  removeInsurance() {
    if(this.btnQuit > 0) {
      this.insuranceForm.controls['cargoValue'].disable();
      this.txtBtnCargo = this.translateService.instant('checkout.insurance-modal.btn-quit');
      this.btnQuit = 0;
      this.getInsurance.emit(this.insuranceForm.get('cargoValue')!.value)
    } else {
      this.insuranceForm.controls['cargoValue'].enable();
      this.insuranceForm.get('cargoValue')!.setValue(0);
      this.txtBtnCargo = this.translateService.instant('checkout.insurance-modal.btn-add')
      this.getInsurance.emit(0);
      this.cargoValues.emit(this.insuranceForm.get('cargoValue')!.value);
    }
  }
}
