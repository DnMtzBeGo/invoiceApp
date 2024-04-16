import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

const MAIL_REGEX =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

@Component({
  selector: 'app-ocl-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class OclStep2Component {
  @Output() statusChange = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<typeof this.form.value>();

  form: FormGroup<{
    name: FormControl<string>;
    phone_flag: FormControl<string>;
    phone_code: FormControl<string>;
    phone_number: FormControl<string>;
    email: FormControl<string>;
    aditional_details: FormControl<string>;
  }>;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        phone_flag: ['mx'],
        phone_code: ['+52'],
        phone_number: ['', Validators.required],
        email: ['', [Validators.required, Validators.pattern(MAIL_REGEX)]],
        aditional_details: ['', Validators.required]
      },
      { updateOn: 'blur' }
    );
  }

  ngOnInit() {
    this.form.statusChanges.subscribe((status) => {
      const isValid = status === 'VALID';

      this.statusChange.emit(isValid);
      if (isValid) this.dataChange.emit(this.form.value);
    });
  }

  updatePhoneCode(ev: any) {
    this.form.patchValue({
      phone_code: ev.dial_code,
      phone_flag: ev.code.toLowerCase(),
      phone_number: ''
    });
  }

  updateDetails(ev: any) {
    this.form.controls.aditional_details.setValue(ev.details);
  }
}
