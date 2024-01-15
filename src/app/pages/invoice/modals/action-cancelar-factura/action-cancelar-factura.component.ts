import { Component, OnInit, Inject } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { from, of, throwError, Subject } from 'rxjs';
import { mergeAll, pluck, catchError } from 'rxjs/operators';
import { reactiveComponent } from 'src/app/shared/utils/decorators';
import { ofType, oof } from 'src/app/shared/utils/operators.rx';
import { makeRequestStream } from 'src/app/shared/utils/http.rx';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { routes } from '../../consts';

@Component({
  selector: 'app-action-cancelar-factura-confirmation',
  templateUrl: './action-cancelar-factura.component.html',
  styleUrls: ['./action-cancelar-factura.component.scss']
})
export class ActionCancelarFacturaComponent implements OnInit {
  public routes: typeof routes = routes;

  $rx = reactiveComponent(this);

  vm: {
    form?: {
      invoice: string;
      motivo_cancelacion: string;
      uuid_relacion: string;
    };
    motivos?: unknown[];
    formLoading?: boolean;
    formError?: any;
    formSuccess?: any;
  };

  formEmitter = new Subject<['submit', unknown]>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ActionCancelarFacturaComponent>,
    private notificationsService: NotificationsService,
    private apiRestService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //FORM
    const form$ = oof({
      invoice: this.data._id,
      motivo_cancelacion: '',
      uuid_relacion: ''
    });

    //CATALOGOS
    const motivos$ = this.fetchMotivos();

    //FORM SUBMIT
    const {
      loading$: formLoading$,
      error$: formError$,
      success$: formSuccess$
    } = makeRequestStream({
      fetch$: this.formEmitter.pipe(ofType('submit')),
      fetch: this.submitForm,
      afterSuccessDelay: () => {
        this.dialogRef.close();
        this.data.afterSuccessDelay?.();
      },
      afterError: (error) => {
        this.notificationsService.showErrorToastr(this.showError(error));
      }
    });

    this.vm = this.$rx.connect({
      form: form$,
      motivos: motivos$,
      formLoading: formLoading$,
      formError: formError$,
      formSuccess: formSuccess$
    });
  }

  //API calls
  fetchMotivos() {
    return from(this.apiRestService.apiRestGet('invoice/cancelation-reasons')).pipe(mergeAll(), pluck('result'));
  }

  submitForm = (form) => {
    return from(
      this.apiRestService.apiRest(JSON.stringify(form), 'invoice/cancel', {
        loader: 'false'
      })
    ).pipe(mergeAll());
  };

  // UTILS
  showError = (error: any) => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error).join(',\n') : error;
  };
}
