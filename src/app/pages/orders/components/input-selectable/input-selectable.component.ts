import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "src/app/shared/services/auth.service";

interface Option {
  value?: string;
  viewValue?: string;
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
  urlType: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private apiRestService: AuthService
  ) {}

  ngOnInit(): void {
    console.log("Modal INIT Data:", this.data);
    if (this.data.data && this.data.data.value && this.data.data.viewValue) {
      this.selected = this.data.data;
      this.selectOptions.push(this.selected);
    }
    this.urlType = this.data.type;
  }

  @ViewChild("mySelect") mySelect;

  public async handleInput(e) {
    const searchableValue = e.target.value;
    this.changeDataText(searchableValue);
  }

  // TODO: ENDPOINT FOR PACKAGING TYPE
  async changeDataText(search) {
    console.log("changeDataText:", search);
    if (this.urlType === "merc") {
      await (
        await this.apiRestService.apiRestGet(
          `invoice/catalogs/productos-y-servicios?term=${search}&limit=20&page=1`
        )
      ).subscribe(
        ({ result }) => {
          console.log("get results:");
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
    } else if (this.urlType === "hzrd") {
      const requestJson = {
        term: search,
        limit: 20,
      };
      await (
        await this.apiRestService.apiRest(
          JSON.stringify(requestJson),
          "invoice/catalogs/consignment-note/material-peligroso"
        )
      ).subscribe(
        ({ result }) => {
          console.log(result);
          const filteredList = [];
          const optionsList = result;
          optionsList.map((option) => {
            console.log(option);
            filteredList.push({
              viewValue: option.descripcion,
              value: option.clave,
            });
          });
          this.selectOptions = filteredList;
          this.mySelect.open();
        },
        (err) => {
          console.log(err);
        }
      );
    } else {
      return;
    }
  }
}
