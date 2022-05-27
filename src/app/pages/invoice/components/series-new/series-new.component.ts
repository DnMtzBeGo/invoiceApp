import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
// import { ApiRestService } from "src/app/core/services";
import { AuthService } from "src/app/shared/services/auth.service";

@Component({
  selector: "app-series-new",
  templateUrl: "./series-new.component.html",
  styleUrls: ["./series-new.component.scss"],
})
export class SeriesNewComponent implements OnInit {
  public imageSrc: any;
  public color: any;
  public touchUi: any;
  public receiptTypes: Array<object>;
  public logoFile: any;

  public seriesForm = new FormGroup({
    tipo_comprobante: new FormControl("", Validators.required),
    serie: new FormControl("", Validators.required),
    folio: new FormControl("", Validators.required),
    color: new FormControl(""),
  });

  public imageForm = new FormGroup({
    file: new FormControl(""),
  });

  private isEditing: boolean = false;

  constructor(
    public matDialogRef: MatDialogRef<SeriesNewComponent>,
    private apiRestService: AuthService,
    @Inject(MAT_DIALOG_DATA) public seriesData,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.isEditing = Object.keys(this.seriesData).length > 1;
    if (this.isEditing) this.seriesForm.controls["folio"].disable();
    if (this.seriesData) {
      this.seriesForm.patchValue(this.seriesData);
      if (this.seriesData.logo) {
        this.imageSrc = this.seriesData.logo;
      }
    }
    this.getReceiptTypes();
  }

  public closeModal() {
    this.matDialogRef.close({
      success: true,
      message: "",
    });
  }

  public onFileSelected(event) {
    const inputNode = event.target;
    this.logoFile = inputNode.files[0];

    if (typeof FileReader !== "undefined") {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
      };

      reader.readAsDataURL(this.logoFile);
    }
  }

  public async save() {
    const formData = new FormData();
    const type = this.isEditing ? "update" : "create";
    formData.append("emisor", this.seriesData.emisor);
    formData.append("serie", this.seriesForm.get("serie").value);
    formData.append(
      "tipo_comprobante",
      this.seriesForm.get("tipo_comprobante").value
    );
    if (!this.isEditing)
      formData.append("folio", this.seriesForm.get("folio").value);
    formData.append("color", this.seriesForm.get("color").value);
    if (this.logoFile) {
      formData.append("logo", this.logoFile);
    }
    if (this.isEditing) formData.append("_id", this.seriesData._id);

    (
      await this.apiRestService.uploadFilesSerivce(
        formData,
        "invoice/series/" + type,
        {}
      )
    ).subscribe(
      (res) => {
        this.matDialogRef.close({
          success: true,
          message: this.translateService.instant(
            "invoice.serie-new.close-" + type + "-success"
          ),
          data: {
            _id: res.result?._id,
          },
        });
      },
      (err) => {
        this.matDialogRef.close({
          success: false,
          message: this.translateService.instant(
            "invoice.serie-new.close-error"
          ),
        });
      }
    );
  }

  public async getReceiptTypes() {
    (
      await this.apiRestService.apiRestGet(
        "invoice/catalogs/tipos-de-comprobante"
      )
    ).subscribe(
      (res) => {
        this.receiptTypes = res.result.filter((result) => result.enabled);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
