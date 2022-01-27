import { Component, Input, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CargoWeight } from '../../interfaces/cargo-weight'

@Component({
  selector: 'app-cargo-weight',
  templateUrl: './cargo-weight.component.html',
  styleUrls: ['./cargo-weight.component.scss']
})
export class CargoWeightComponent implements OnInit {

  form: FormGroup;
  btnIncrement = [] as Array<boolean>;
  btnDecrement = [] as Array<boolean>;
  minUnits = 1;
  maxUnits = 20;

  public quantityunits: number = 1;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CargoWeightComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CargoWeight
  ) {
    this.form = this._formBuilder.group({
      cargo: this._formBuilder.array([]),
      cargoUnits: [data.units, Validators.required]
    });

    this.quantityunits = data.units;
  }

  ngOnInit() {
    this.addUnitsArray();
    this.onChanges();
  }

  addUnitsArray() {
    if (this.data.weight.length > 0) {
      for (var i = 0; i < this.data.units; i++) {
        this.addUnits(this.data.weight[i]);
        this.btnDecrement[i] = true;
      }
    } else {
      for (var i = 0; i < this.data.units; i++) {
        this.addUnits(1);
        this.btnDecrement[i] = true;
      }
    }
  }

  getControls() {
    return (this.form.get('cargo') as FormArray).controls;
  }

  increment() {
    if (this.quantityunits < 100) {
      this.btnDecrement[this.quantityunits] = true;
      this.quantityunits++;
      this.form.get('cargoUnits')!.setValue(this.quantityunits);
      this.addUnits(this.data.weight[this.quantityunits]);
    }
  }

  decrement() {
    if (this.quantityunits > 1) {
      this.quantityunits--;
      this.form.get('cargoUnits')!.setValue(this.quantityunits);
      this.removeUnits(this.data.weight[this.quantityunits]);
    }
  }

  addUnits(values: any) {
    if (values == null) {
      values = 1;
    }
    const items = this.form.controls.cargo as FormArray;
    items.push(
      this._formBuilder.group({
        units: [values],
      })
    );
  }

  removeUnits(values: any) {
    if (values == null) {
      values = 1;
    }
    const items = this.form.controls.cargo as FormArray;
    items.removeAt(items.length - 1);
  }

  onChanges() {
    (this.form.get('cargo') as FormArray).valueChanges.subscribe((values) => {
      console.log(values);
    });
  }

  saverange($event: any, i: number) {
    // console.log($event.target.value);
    if ($event.target.value == '') {
      ((this.form.get('cargo') as FormArray).at(i) as FormGroup).get('units')!.patchValue(1);
      this.btnDecrement[i] = true;('units')
    } else if ($event.target.value < this.maxUnits && $event.target.value > this.minUnits) {
      this.btnIncrement[i] = false;
      this.btnDecrement[i] = false;
    } else if ($event.target.value == this.minUnits) {
      this.btnIncrement[i] = false;
      this.btnDecrement[i] = true;
    } else {
      this.btnIncrement[i] = true;
      this.btnDecrement[i] = false;
    }
  }

  increament(i: number) {
    let val = (this.form.get('cargo') as FormArray).at(i).get('units')!.value;
    if (val < this.maxUnits) {
      this.btnIncrement[i] = false;
      this.btnDecrement[i] = false;
      ((this.form.get('cargo') as FormArray).at(i) as FormGroup).get('units')!.patchValue(val + 1);
      let num = (this.form.get('cargo') as FormArray).at(i).get('units')!.value;
      if (num === this.maxUnits) {
        this.btnIncrement[i] = true;
      } else {
        this.btnIncrement[i] = false;
      }
    } else {
      this.btnIncrement[i] = true;
    }
  }

  decreament(i: number) {
    let val = (this.form.get('cargo') as FormArray).at(i).get('units')!.value;
    if (val > this.minUnits) {
      this.btnIncrement[i] = false;
      this.btnDecrement[i] = false;
      ((this.form.get('cargo') as FormArray).at(i) as FormGroup).get('units')!.patchValue(val - 1);
      let num = (this.form.get('cargo') as FormArray).at(i).get('units')!.value;
      if (num === this.minUnits) {
        this.btnDecrement[i] = true;
      } else {
        this.btnDecrement[i] = false;
      }
    } else {
      this.btnDecrement[i] = true;
    }
  }

  save() {
    let result = this.form.controls.cargo.value.map((value: any) => value.units);
    console.log(result)
    this.dialogRef.close({units:result.length,weight:result});
  }
}
