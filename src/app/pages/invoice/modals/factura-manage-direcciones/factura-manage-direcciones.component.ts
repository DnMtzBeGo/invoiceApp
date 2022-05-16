import {
  Component,
  OnInit,
  Inject,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  ComponentFactory,
  ViewContainerRef,
  ComponentRef,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  Observable,
  from,
  of,
  throwError,
  combineLatest,
  merge,
  Subject,
  NEVER,
} from "rxjs";
import {
  mergeAll,
  pluck,
  catchError,
  distinctUntilChanged,
  skip,
  debounceTime,
  share,
  switchMap,
  tap,
  map,
  mapTo,
  startWith,
} from "rxjs/operators";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, oof } from "src/app/shared/utils/operators.rx";
import { clone } from "src/app/shared/utils/object";
import { makeRequestStream } from "src/app/shared/utils/http.rx";
// import {
//   ApiRestService,
//   NotificationsService,
// } from "../../../../../core/services";
import { AuthService } from "src/app/shared/services/auth.service";
import { routes } from "../../consts";
import { FacturaDireccion } from "../../models";
import { validRFC } from "../../containers/factura-edit-page/factura.core";
import { FacturaDireccionInputComponent } from "../../components";

const models = {
  emisor: {
    title: "Sucursales emisor",
    subtitle: "Añade, edita, elimina sucursales",
    endpoints: {
      list: "invoice/expedition-places",
      create: "invoice/expedition-places/create",
      update: "invoice/expedition-places/update",
      delete: "invoice/expedition-places/delete",
    },
  },
  receptor: {
    title: "Direcciones receptor",
    subtitle: "Añade, edita, elimina direcciones",
    endpoints: {
      list: "invoice/branch-offices",
      create: "invoice/branch-offices/create",
      update: "invoice/branch-offices/update",
      delete: "invoice/branch-offices/delete",
    },
  },
};

interface Config {
  model: "emisor" | "receptor";
  rfc: string;
  afterSuccessDelay?: Function;
  openMode?: "create";
}

@Component({
  selector: "app-factura-manage-direcciones",
  templateUrl: "./factura-manage-direcciones.component.html",
  styleUrls: ["./factura-manage-direcciones.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturaManageDireccionesComponent implements OnInit {
  public routes: typeof routes = routes;
  public models = models;

  $rx = reactiveComponent(this);
  reloadFlag = false;

  vm: {
    direcciones?: FacturaDireccion[];
    form?: FacturaDireccion;
    formMode?: any;
    formLoading?: boolean;
    formError?: any;
    formSuccess?: any;
  };

  formEmitter = new Subject<
    ["direccion:select" | "refresh" | "submit", unknown]
  >();

  constructor(
    @Inject(MAT_DIALOG_DATA) public config: Config,
    private dialogRef: MatDialogRef<FacturaManageDireccionesComponent>,
    private container: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    // private notificationsService: NotificationsService,
    private apiRestService: AuthService
  ) {}

  ngOnInit(): void {
    // https://medium.com/masmovil-engineering/use-your-custom-component-inside-angular-material-dialog-a3314ebcdecc
    this.container.clear();

    const factory: ComponentFactory<any> =
      this.resolver.resolveComponentFactory(FacturaDireccionInputComponent);
    const componentRef: ComponentRef<any> =
      this.container.createComponent(factory);
    const hostedComponent = componentRef.instance;
    componentRef.location.nativeElement.style = `
      display: none;
      margin-top: 1.5rem;
    `;

    //DATA FETCHING
    const loadDataAction$ = merge(
      oof(""),
      this.formEmitter.pipe(ofType("refresh"))
    ).pipe(mapTo(this.config));

    const direcciones$ = loadDataAction$.pipe(switchMap(this.fetchDirecciones));

    //FORM
    const form$: Observable<FacturaDireccion> = merge(
      this.config.openMode === "create" ? oof(this.createForm()) : NEVER,
      this.formEmitter.pipe(ofType("direccion:select"))
    ).pipe(
      map(clone),
      tap((form) => {
        hostedComponent["direccion"] = form;
        componentRef.location.nativeElement.style = `
          display: ${form ? "block" : "none"};
          margin-top: 1.5rem;
        `;
      })
    );

    //FORM SUBMIT
    const formMode$ = this.formEmitter.pipe(ofType("submit"), pluck("1"));
    const {
      loading$: formLoading$,
      error$: formError$,
      success$: formSuccess$,
    } = makeRequestStream({
      fetch$: this.formEmitter.pipe(ofType("submit")),
      fetch: this.submitDireccion,
      afterSuccess: () => (this.reloadFlag = true),
      afterSuccessDelay: () => {
        this.config.afterSuccessDelay?.();
        this.formEmitter.next(["direccion:select", null]);
        this.formEmitter.next(["refresh", ""]);
      },
      afterError: (error) => {
        // this.notificationsService.showErrorToastr(this.showError(error));
      },
    });

    this.vm = this.$rx.connect({
      direcciones: direcciones$,
      form: form$,
      formMode: formMode$,
      formLoading: formLoading$,
      formError: formError$,
      formSuccess: formSuccess$,
    });
  }

  createForm() {
    return {
      nombre: "",
      rfc: this.config.rfc,
      calle: "",
      numero: "",
      interior: "",
      pais: "",
      estado: "",
      localidad: "",
      municipio: "",
      colonia: "",
      cp: "",
      email: "",
    };
  }

  closeModal() {
    this.dialogRef.close([this.config, this.reloadFlag]);
  }

  //API calls
  fetchDirecciones = (config: Config) => {
    return !validRFC(config.rfc)
      ? of([])
      : from(
          this.apiRestService.apiRest(
            JSON.stringify({
              rfc: config.rfc,
            }),
            models[config.model].endpoints.list,
            {
              loader: "false",
            }
          )
        ).pipe(
          mergeAll(),
          pluck("result"),
          // transform model receptor -> emisor
          tap((result) =>
            result?.map((direccion) => {
              if (this.config.model === "receptor") {
                const { identificador } = direccion;
                direccion.nombre = identificador;
              }
            })
          ),
          startWith(null)
        );
  };

  submitDireccion = ([config, mode, form]) => {
    // transform model receptor -> emisor
    if (config.model === "receptor") {
      const { nombre } = form;
      form.identificador = nombre;
    }

    return from(
      this.apiRestService.apiRest(
        JSON.stringify(form),
        models[config.model].endpoints[mode],
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

  compareId = (a, b) => {
    return a != void 0 && b != void 0 && a._id === b._id;
  };

  showError = (error: any) => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error).join(",\n") : error;
  };
}
