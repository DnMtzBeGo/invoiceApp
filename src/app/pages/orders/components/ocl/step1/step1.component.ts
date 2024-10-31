import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

const MAIL_REGEX =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

@Component({
  selector: 'app-ocl-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss'],
})
export class OclStep1Component {
  @Input() public cardIsOpen = false;
  @Input() public datePickup: number;
  @Output() public statusChange = new EventEmitter<boolean>();
  @Output() public dataChange = new EventEmitter<typeof this.form.value>();

  public form: FormGroup<{
    name: FormControl<string>;
    phone_flag: FormControl<string>;
    phone_code: FormControl<string>;
    phone_number: FormControl<string>;
    email: FormControl<string>;
    reference: FormControl<string>;
    date: FormControl<number>;
  }>;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        phone_flag: ['mx'],
        phone_code: ['+52'],
        phone_number: ['', Validators.required],
        email: ['', [Validators.required, Validators.pattern(MAIL_REGEX)]],
        reference: ['', Validators.required],
        date: [null as number, Validators.required],
      },
      { updateOn: 'blur' },
    );
  }

  public ngOnInit() {
    this.form.statusChanges.subscribe((status) => {
      const isValid = status === 'VALID';

      this.statusChange.emit(isValid);
      if (isValid) this.dataChange.emit(this.form.value);
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.datePickup) {
      this.form.controls.date.setValue(this.datePickup);
    }
  }

  public updatePhoneCode(ev: any) {
    this.form.patchValue({
      phone_code: ev.dial_code,
      phone_flag: ev.code.toLowerCase(),
      phone_number: '',
    });
  }

  public updateDate(date: number) {
    this.form.controls.date.setValue(date);
  }
}
