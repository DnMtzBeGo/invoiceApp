import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "src/app/shared/services/auth.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";

interface Option {
  value?: string;
  viewValue?: string;
}

interface UnitDetailsModalData {
  satUnit: Option;
  qty: number;
  description: string;
}

@Component({
  selector: "app-unit-details-modal",
  templateUrl: "./unit-details-modal.component.html",
  styleUrls: ["./unit-details-modal.component.scss"],
})
export class UnitDetailsModalComponent implements OnInit {
  unitForm = new FormGroup({
    qty: new FormControl(1),
    description: new FormControl(""),
  });

  selected: Option;
  selectOptions: Option[] = [];
  catalogFetch: Option[] = [];

  translateList = {};

  constructor(
    translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: UnitDetailsModalData,
    private apiRestService: AuthService,
    public dialogRef: MatDialogRef<UnitDetailsModalComponent>
  ) {
    this.translateList = translateService.instant("orders.unit-details-list");
    console.log("TRADUCCION:", this.translateList);
  }

  ngOnInit(): void {
    this.getCatalog();
    this.loadPrevData();
  }

  @ViewChild("mySelect") mySelect;

  loadPrevData() {
    console.log("PREV DATA:", this.data);
    this.data.qty && this.unitForm.get("qty")!.setValue(this.data.qty);
    this.data.description &&
      this.unitForm.get("description")!.setValue(this.data.description);
    this.data.satUnit && (this.selected = this.data.satUnit);
    this.selected && this.selectOptions.push(this.selected);
  }

  async getCatalog() {
    const requestJson = {
      catalogs: [
        {
          name: "sat_claves_de_unidad",
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
            viewValue: item.name,
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

  public async handleInput(e) {
    const searchableValue = e.target.value;
    this.changeDataText(searchableValue);
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

  decreament() {
    if (this.unitForm.value.qty > 1) {
      const newValue = this.unitForm.value.qty - 1;
      this.unitForm.get("qty")!.setValue(newValue);
    }
  }

  increament() {
    if (this.unitForm.value.qty < 20) {
      const newValue = this.unitForm.value.qty + 1;
      this.unitForm.get("qty")!.setValue(newValue);
    }
  }

  save() {
    let result = { ...this.unitForm.value, ...this.selected };
    this.dialogRef.close(result);
  }
}
