import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "src/app/shared/services/auth.service";

interface Option {
  value: string;
  viewValue: string;
}

@Component({
  selector: "app-input-selectable",
  templateUrl: "./input-selectable.component.html",
  styleUrls: ["./input-selectable.component.scss"],
})
export class InputSelectableComponent implements OnInit {
  // SELECTABLE OPTIONS
  selectOptions: Option[] = [];

  selected: Option;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private apiRestService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.value && this.data.viewValue) {
      this.selected = this.data;
      this.selectOptions.push(this.selected);
    }
  }

  @ViewChild("mySelect") mySelect;

  public async handleInput(e) {
    const searchableValue = e.target.value;
    this.changeDataText(searchableValue);
  }

  async changeDataText(search) {
    await (
      await this.apiRestService.apiRestGet(
        `invoice/catalogs/productos-y-servicios?term=${search}&limit=20&page=1`
      )
    ).subscribe(
      ({ result }) => {
        const filteredList = [];
        const optionsList = result.productos_servicios;
        optionsList.map((option) => {
          filteredList.push({
            viewValue: option.description,
            value: option.code,
          });
        });
        this.selectOptions = filteredList;
        this.mySelect.open();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
