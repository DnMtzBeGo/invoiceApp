import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-fleet-invite-driver',
  templateUrl: './fleet-invite-driver.component.html',
  styleUrls: ['./fleet-invite-driver.component.scss']
})
export class FleetInviteDriverComponent implements OnInit {

  form = this._formBuilder.group({
    drivers: this._formBuilder.array([])
  });

  constructor(
    private _formBuilder: FormBuilder,
  ) { 
  }

  ngOnInit(): void {
    this.addDriver();
  }

  get drivers() {
    return this.form.controls["drivers"] as FormArray;
  }

  addDriver() {
    const driverForm = this._formBuilder.group({
      fullname: ['', Validators.required],
      email: ['', Validators.required]
    });
    this.drivers.push(driverForm);
  }

  deleteDriver(driverIndex: number) {
    console.log(driverIndex)
    if(driverIndex != 0) {
      this.drivers.removeAt(driverIndex);
    }
  }

}
