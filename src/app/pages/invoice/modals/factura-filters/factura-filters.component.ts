import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { from, of, throwError, Subject } from "rxjs";
import { mergeAll, pluck, catchError, tap } from "rxjs/operators";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, oof } from "src/app/shared/utils/operators.rx";
import { makeRequestStream } from "src/app/shared/utils/http.rx";
import { AuthService } from "src/app/shared/services/auth.service";
import { groupStatus } from "../../containers/factura-edit-page/factura.core";

const parseNumbers = (str?: string) => {
  str = str || "";
  if (str === "") return [];
  return str.split(",").map(Number);
};

@Component({
  selector: "app-factura-filters",
  templateUrl: "./factura-filters.component.html",
  styleUrls: ["./factura-filters.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FacturaFiltersComponent implements OnInit {
  $rx = reactiveComponent(this);

  vm: {
    form?: {
      invoice: string;
      motivo_cancelacion: string;
      uuid_relacion: string;
    };
    tiposComprobante?: unknown[];
    facturaStatus?: unknown[];
    params?: {
      uuid?: string;
      fec_inicial?: Date;
      fec_final?: Date;
      emisor?: string;
      receptor?: string;
      tipo_de_comprobante?: string;
      status?: string;
    };
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<FacturaFiltersComponent>,
    private apiRestService: AuthService,
    public router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    //FORM
    const form$ = oof({
      invoice: this.data._id,
      motivo_cancelacion: "",
      uuid_relacion: "",
    });

    //CATALOGOS
    const tiposComprobante$ = oof(this.data.tiposComprobante);
    const facturaStatus$ = oof(groupStatus(this.data.facturaStatus));

    //PARAMS
    const params$ = oof(this.data.params);

    this.vm = this.$rx.connect({
      form: form$,
      tiposComprobante: tiposComprobante$,
      facturaStatus: facturaStatus$,
      params: params$,
    });
  }

  //METHODS
  apply() {
    this.dialogRef.close(this.vm.params);
  }

  deselectRadio(event) {
    window.requestAnimationFrame(() => {
      const el = event.target
        ?.closest("mat-radio-group")
        ?.querySelector("mat-radio-button.empty-radio input");
      el?.click();
    });
  }

  // UTILS
  log = (...args: any[]) => {
    console.log(...args);
  };

  showError = (error: any) => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error).join(",\n") : error;
  };

  parseNumbers = parseNumbers;

  filterClave = (clave) => (item) => {
    return item !== clave;
  };
}
