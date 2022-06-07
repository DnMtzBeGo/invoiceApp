import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-continue-modal",
  templateUrl: "./continue-modal.component.html",
  styleUrls: ["./continue-modal.component.scss"],
})
export class ContinueModalComponent implements OnInit {
  public title;
  public items: string[] = [];

  public fieldNames = {
    pickupRFC: "RFC del origen",
    cargo_goods: "tipo de mercancía",
    packaging: "tipo de embalaje",
    hazardous_material: "tipo de carga peligrosa",
    dropoffRFC: "RFC del destino",
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit(): void {
    this.title = this.data.title;
    if (this.data.list.length > 0) {
      for (const field of this.data.list) {
        this.items.push(this.fieldNames[field]);
      }
    }
  }
}
