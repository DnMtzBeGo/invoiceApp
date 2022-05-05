import { ENTER, COMMA } from "@angular/cdk/keycodes";
import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { from, of, throwError, Subject } from "rxjs";
import { mergeAll, pluck, catchError } from "rxjs/operators";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, oof } from "src/app/shared/utils/operators.rx";
import { makeRequestStream } from "src/app/shared/utils/http.rx";

// import {
//   ApiRestService,
//   NotificationsService,
// } from "../../../../../core/services";
import { AuthService } from "src/app/shared/services/auth.service";
import { routes } from "../../consts";

@Component({
  selector: "app-action-send-email-factura",
  templateUrl: "./action-send-email-factura.component.html",
  styleUrls: ["./action-send-email-factura.component.scss"],
})
export class ActionSendEmailFacturaComponent implements OnInit {
  public routes: typeof routes = routes;

  $rx = reactiveComponent(this);

  vm!: {
    form?: {
      invoice: string;
      subject: string;
      to: string[];
      cc: string;
      message: string;
      reply_to: string;
    };
    formLoading?: boolean;
    formError?: any;
    formSuccess?: any;
  };

  formEmitter = new Subject<["submit", unknown]>();

  separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ActionSendEmailFacturaComponent>,
    // private notificationsService: NotificationsService,
    private apiRestService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    //FORM
    const form$ = oof({
      invoice: this.data._id,
      subject: this.translateService.instant(
        "invoice.email-factura.asunto-initial"
      ),
      to: this.data.to || [],
      cc: "",
      message: "",
      reply_to: this.data.reply_to || "",
    });

    //FORM SUBMIT
    const {
      loading$: formLoading$,
      error$: formError$,
      success$: formSuccess$,
    } = makeRequestStream({
      fetch$: this.formEmitter.pipe(ofType("submit")),
      fetch: this.submitForm,
      afterSuccessDelay: () => {
        this.dialogRef.close();
        this.data.afterSuccessDelay?.();
      },
      afterError: (error) => {
        // this.notificationsService.showErrorToastr(this.showError(error));
      },
    });

    this.vm = this.$rx.connect({
      form: form$,
      formLoading: formLoading$,
      formError: formError$,
      formSuccess: formSuccess$,
    });
  }

  //API calls
  submitForm = (form) => {
    return from(
      this.apiRestService.apiRest(
        JSON.stringify(form),
        "invoice/email/create",
        {
          loader: "false",
        }
      )
    ).pipe(mergeAll());
  };

  // UTILS
  log = (...args) => {
    console.log(...args);
  };

  showError = (error: any) => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error).join(",\n") : error;
  };
}
