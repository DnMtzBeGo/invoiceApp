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
  urlSelector = {
    merc: "sat_cp_claves_productos_servicios",
    pack: "sat_cp_tipos_de_embalaje",
    hzrd: "sat_cp_material_peligroso",
  };
  catalogFetch: Option[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private apiRestService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.data.data && this.data.data.value && this.data.data.viewValue) {
      this.selected = this.data.data;
      this.selectOptions.push(this.selected);
    }
    this.urlType = this.data.type;
    this.getCatalog();
  }

  @ViewChild("mySelect") mySelect;

  public async handleInput(e) {
    const searchableValue = e.target.value;
    this.changeDataText(searchableValue);
  }

  // TODO: ENDPOINT FOR PACKAGING TYPE
  async getCatalog() {
    const requestJson = {
      catalogs: [
        {
          name: this.urlSelector[this.urlType],
          version: "0",
        },
      ],
    };
    await (
      await this.apiRestService.apiRest(
        JSON.stringify(requestJson),
        "invoice/catalogs/fetch"
      )
    ).subscribe(
      ({ result }) => {
        const optionsList = result.catalogs[0].documents.map((item) => {
          const filteredItem = {
            value: item.code,
            viewValue: item.description,
          };
          return filteredItem;
        });
        this.catalogFetch = optionsList;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  changeDataText(search) {
    const filteredArr = [];
    if (this.catalogFetch.length > 0) {
      this.catalogFetch.map((item) => {
        if (
          item.viewValue.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
          filteredArr.length < 20
        ) {
          filteredArr.push(item);
        }
      });
    }
    this.selectOptions = filteredArr;
    this.mySelect.open();
  }
}

// const filteredList = [];
// const optionsList = result;
// optionsList.map((option) => {
//   console.log(option);
//   filteredList.push({
//     viewValue: option.descripcion,
//     value: option.clave,
//   });
// });
// this.selectOptions = filteredList;
