import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { interval, merge, timer, from, Subject, combineLatest, asapScheduler, of, identity, Subscription, Observable } from 'rxjs';
import {
  mapTo,
  mergeAll,
  pluck,
  debounceTime,
  share,
  repeatWhen,
  switchMap,
  map,
  withLatestFrom,
  tap,
  distinctUntilChanged,
  filter,
  takeUntil,
  startWith,
  finalize,
} from 'rxjs/operators';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { routes } from '../../consts';
import { Paginator } from '../../../invoice/models';
import { FacturaFiltersComponent, ActionConfirmationComponent } from '../../../invoice/modals';
import { FacturaEmitterComponent } from '../../../invoice/components/factura-emitter/factura-emitter.component';
import { reactiveComponent } from 'src/app/shared/utils/decorators';
import { ofType, oof } from 'src/app/shared/utils/operators.rx';
import { arrayToObject, object_compare, clone } from 'src/app/shared/utils/object';
import { AuthService } from 'src/app/shared/services/auth.service';

const filterParams = new Set(['search']);

const resolvers = {
  members: {
    endpoint: 'fleets/:fleetId/members',
    pluck: 'data',
    lang: 'members',
    sortBy: ['member_meta.date_created', 'member.nickname'],
    sortInit: ['member_meta.date_created', 'desc'],
    withFleetId: true,
  },
  trucks: {
    endpoint: 'fleets/:fleetId/trucks',
    pluck: 'result',
    lang: 'trucks',
    sortBy: ['date_created', 'attributes.brand'],
    sortInit: ['date_created', 'desc'],
    withFleetId: false,
  },
  trailers: {
    endpoint: 'fleets/:fleetId/trailers',
    pluck: 'result',
    lang: 'trailers',
    sortBy: ['date_created', 'trailer_number'],
    sortInit: ['date_created', 'desc'],
    withFleetId: false,
  },
  primeList: {
    endpoint: 'orders/vehicles',
    lang: 'prime',
    // type instead name because in backend `type` is the real keyname of `name`
    sortBy: ['type', '_id'],
    sortInit: ['_id', 'desc'],
  },
  prime: {
    endpoint: 'orders/vehicles/:id',
    newUrl: routes.NEW_PRIME,
    lang: 'prime',
    sortBy: ['date_created', 'attributes.vehicle_number'],
    sortInit: ['date_created', 'desc'],
    withFleetId: true,
  },
};

@Component({
  selector: 'app-fleet-browser',
  templateUrl: './fleet-browser.component.html',
  styleUrls: ['./fleet-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FleetBrowserComponent implements OnInit {
  public routes: typeof routes = routes;

  private $rx = reactiveComponent(this);

  private filtersDialogRef: FacturaFiltersComponent | any;

  public showSelectPage: boolean = false;

  public vm!: {
    fleetId?: number;
    // list | grid
    view?: any;
    tiposComprobante?: unknown;
    facturaStatus?: unknown;
    params?: {
      uuid?: string;
      emisor?: string;
      receptor?: string;
      status?: string;
      search?: string;
      sort?: string;
    };
    facturas?: unknown[];
    facturasLoading?: boolean;
    defaultEmisor?: unknown[];
    template?: string;
    searchAction?: {
      type: 'template';
      search: string;
    };
    searchLoading?: boolean;
    receptorSearch?: {
      template?: unknown[];
    };
  };

  public facturasEmitter = new Subject<
    ['queryParams' | 'refresh' | 'template:search' | 'template:set' | 'refresh:defaultEmisor' | 'view:set', unknown?]
  >();

  public model: 'members' | 'trucks' | 'trailers' | 'primeList' | 'prime';

  public lang = 'en';

  private view = window.localStorage.getItem('app-fleet-browser-view') ?? 'grid';

  private _resolver;
  public resolver;

  public paginatorDefaults;

  public paginator: Paginator;

  private listeners: Subscription[] = [];

  public selectedCategory = '';
  public categoryModal = {
    show: false,
    mode: 'new',
    type: '',
    error: null,
  };

  public category = {
    name: '',
    translations: {},
  };

  refreshAction: Observable<void>;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private matDialog: MatDialog,
    private apiRestService: AuthService,
    public translateService: TranslateService,
    private location: Location,
    private cd: ChangeDetectorRef,
  ) {
    this.model = this.route.snapshot.data.model;

    this._resolver = resolvers[this.route.snapshot.data.model];
    this.resolver = {
      ...this._resolver,
      sortBy: this._resolver.sortBy.flatMap((key) =>
        ['desc', 'asc'].map((sort) => ({
          key,
          sort,
          value: [key, sort].join(':'),
        })),
      ),
    };

    this.paginatorDefaults = {
      grid: { sizeOptions: [6, 9, 12], default: 6 },
      list: { sizeOptions: [6, 9, 12, 50, 100], default: 6 },
      // list: { sizeOptions: [5, 10, 20, 50, 100], default: 5 }
    };

    this.paginator = {
      pageIndex: +this.route.snapshot.queryParams.page || 1,
      pageSize: +this.route.snapshot.queryParams.limit || this.paginatorDefaults[this.view].default || 10,
      pageTotal: 1,
      pageSearch: '',
      total: 0,
    };

    this.listeners.push(
      this.route.params.subscribe((ev) => {
        if (this.router.url.includes(routes.PRIME) && ev.id) {
          this.ngOnInit();
        }
      }),
    );

    this.listeners.push(
      this.translateService.onLangChange.subscribe((lang) => {
        this.lang = lang.lang;
      }),
    );
  }

  public ngOnInit(): void {
    const fleetId$ = this.fetchFleetId().pipe(share());

    const view$ = merge(
      oof(this.view),
      this.facturasEmitter.pipe(
        ofType('view:set'),
        tap((view: string) => window.localStorage.setItem('app-fleet-browser-view', view)),
      ),
    );

    const loadDataAction$ = merge(fleetId$, this.facturasEmitter.pipe(ofType('refresh')));

    const tiposComprobante$ = this.fetchTipoComprobante().pipe(share());

    const facturaStatus$ = this.fetchFacturaStatus().pipe(share());

    const params$ = merge(
      oof(this.route.snapshot.queryParams),
      this.facturasEmitter.pipe(ofType('queryParams'), debounceTime(500)),
    ).pipe(
      distinctUntilChanged(object_compare),
      map((params: any) => {
        {
          const p = {
            ...params,
            limit: +params.limit || this.paginator.pageSize,
            page: +params.page || this.paginator.pageIndex,
            sort: params.sort || this.resolver.sortInit?.join(':'),
          };

          if (p.sort === undefined) delete p.sort;

          return p;
        }
      }),
      tap((params) => {
        this.paginator.pageSize = Number(params.limit);
        this.paginator.pageIndex = Number(params.page);

        this.cd.markForCheck();
      }),
      share(),
    );

    const facturasRequest$ = combineLatest([loadDataAction$, params$]).pipe(pluck('1'), share());

    const facturas$ = combineLatest(
      tiposComprobante$.pipe(map(arrayToObject('clave', 'descripcion'))),
      facturaStatus$.pipe(map(arrayToObject('clave', 'nombre'))),
      facturasRequest$.pipe(switchMap(this.fetchFacturas)),
    ).pipe(
      map(([tiposComprobante, facturaStatus, facturas]: any) =>
        facturas.map((factura: any) => {
          if (this.model === 'members') {
            const newFactura = {
              ...factura,
              status: !factura.member.connected
                ? 'inactive'
                : factura.member.availability === 1
                ? 'available'
                : factura.member.availability === 2
                ? 'unavailable'
                : 'unavailable',
            };

            return newFactura;
          }

          return factura;
        }),
      ),
      tap(() => {
        this.cd.markForCheck();
      }),
      share(),
    );

    const facturasLoading$ = merge(facturasRequest$.pipe(mapTo(true)), facturas$.pipe(mapTo(false)));

    // EMISORES
    const defaultEmisor$ = this.fetchEmisores().pipe(
      repeatWhen(() => this.facturasEmitter.pipe(ofType('refresh:defaultEmisor'))),
    );

    //TEMPLATES
    const emptySearch = (search: any) => search.search === '';
    const validSearch = (search: any) => !emptySearch(search);

    const template$ = oof('');

    const searchAction$ = merge(
      this.facturasEmitter.pipe(
        ofType('template:search'),
        map((search: string) => ({ type: 'template' as const, search })),
      ),
    ).pipe(share());

    const cancelSearchAction$ = merge(
      searchAction$.pipe(filter(emptySearch)),
      this.facturasEmitter.pipe(ofType('template:set')),
    );

    const validSearch$ = searchAction$.pipe(
      filter(validSearch),
      switchMap((search) => timer(500).pipe(takeUntil(cancelSearchAction$), mapTo(search))),
    );

    const searchRequest$ = validSearch$.pipe(
      switchMap((search) => this.searchTemplate(search).pipe(takeUntil(cancelSearchAction$))),
      share(),
    );

    const searchLoading$ = merge(
      oof(false),
      validSearch$.pipe(mapTo(true)),
      searchRequest$.pipe(mapTo(false)),
      cancelSearchAction$.pipe(mapTo(false)),
    );

    const receptorSearch$ = merge(
      searchRequest$.pipe(
        withLatestFrom(searchAction$),
        map(([requestData, search]: any) => ({
          [search.type]: requestData,
        })),
      ),
      cancelSearchAction$.pipe(mapTo({})),
    );

    this.vm = this.$rx.connect({
      fleetId: fleetId$,
      view: view$,
      tiposComprobante: tiposComprobante$,
      facturaStatus: facturaStatus$,
      params: params$,
      facturas: facturas$,
      facturasLoading: facturasLoading$,
      defaultEmisor: defaultEmisor$,
      template: template$,
      searchAction: searchAction$,
      searchLoading: searchLoading$,
      receptorSearch: receptorSearch$,
    });

    this.refreshAction = loadDataAction$;
  }

  public ngOnDestroy() {
    this.listeners.forEach((l) => l.unsubscribe());
  }

  // API calls
  private fetchFleetId = () => {
    if (this.model === 'prime') {
      return of(this.route.snapshot.params.id);
    }

    return from(
      this.apiRestService.apiRest('', 'fleet/overview', {
        loader: 'false',
      }),
    ).pipe(mergeAll(), pluck('result', '_id'));
  };

  private fetchFacturas = (params: any) => {
    const payload = {
      ...params,
    };

    if (this.model === 'primeList') {
      return from(
        this.apiRestService.apiRestGet(this.resolver.endpoint, { apiVersion: 'v1.1', ...this.vm.params }),
      ).pipe(
        mergeAll(),
        pluck('result'),
        map((res) => {
          this.paginator.pageTotal = res.pagination?.pages || 1;
          this.paginator.total = res.pagination?.size ?? 0;
          return res.data;
        }),
        finalize(() => {
          this.cd.markForCheck();
        }),
      );
    }

    if (this.model === 'prime') {
      from(this.apiRestService.apiRestGet('orders/vehicles', { apiVersion: 'v1.1' }))
        .pipe(
          mergeAll(),
          pluck('result'),
          tap((res) => {
            const category = res.find((c) => c._id === this.route.snapshot.params.id);

            this.category = {
              name: category.name,
              translations: category.translations,
            };

            this.cd.markForCheck();
          }),
        )
        .subscribe();

      return from(
        this.apiRestService.apiRestGet(this.resolver.endpoint.replace(':id', this.route.snapshot.params.id), {
          apiVersion: 'v1.1',
          ...this.vm.params,
        }),
      ).pipe(
        mergeAll(),
        pluck('result'),
        map((res) => {
          this.paginator.pageTotal = res?.pagination?.pages || 1;
          this.paginator.total = res?.pagination?.size ?? 0;

          return res?.data || [];
        }),
        finalize(() => {
          this.cd.markForCheck();
        }),
      );
    }

    return from(
      this.apiRestService.apiRestGet(this.resolver.endpoint.replace(':fleetId', this.vm.fleetId), {
        loader: 'false',
        apiVersion: 'v1.1',
        ...payload,
      }),
    ).pipe(
      mergeAll(),
      pluck('result'),
      tap((result) => {
        this.paginator.pageTotal = result.pagination?.pages ?? result?.pages ?? 1;
        this.paginator.total = result.pagination?.size ?? result?.size ?? 0;
        this.paginator.pageIndex = Math.min(this.paginator.pageTotal, this.paginator.pageIndex);
      }),
      this.resolver.pluck ? pluck(this.resolver.pluck) : identity,
      tap(() => {
        this.cd.markForCheck();
      }),
    );
  };

  private fetchTipoComprobante() {
    return from(
      this.apiRestService.apiRestGet('invoice/catalogs/tipos-de-comprobante', {
        loader: 'false',
      }),
    ).pipe(mergeAll(), pluck('result'));
  }

  private fetchFacturaStatus = () => {
    return from(
      this.apiRestService.apiRestGet('invoice/catalogs/statuses', {
        loader: 'false',
      }),
    ).pipe(mergeAll(), pluck('result'));
  };

  private fetchEmisores() {
    return from(
      this.apiRestService.apiRestGet('invoice/emitters', {
        loader: 'false',
      }),
    ).pipe(
      mergeAll(),
      map((responseData) => {
        const emisores = responseData?.result?.documents;

        // return void 0;
        // return [];

        if (emisores == void 0) return void 0;

        return emisores.length === 0 ? [] : [emisores.pop()];
      }),
      startWith(null),
    );
  }

  private searchTemplate(search: { type: 'template'; search: string }) {
    const endpoints = {
      template: 'invoice/get_drafts',
    };
    const keys = {
      template: 'search',
    };

    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          pagination: {
            size: 10,
            page: 1,
          },
          [keys[search.type]]: search.search,
        }),
        endpoints[search.type],
        { loader: 'false' },
      ),
    ).pipe(mergeAll(), pluck('result'));
  }

  // MODALS
  private openFilters() {
    if (this.filtersDialogRef) return;

    this.filtersDialogRef = this.matDialog.open(FacturaFiltersComponent, {
      data: {
        tiposComprobante: this.vm.tiposComprobante,
        facturaStatus: this.vm.facturaStatus,
        params: clone(this.vm.params),
      },
      restoreFocus: false,
      autoFocus: false,
      // panelClass: [""],
      // hasBackdrop: true,
      backdropClass: ['brand-dialog-1', 'dialog-filters'],
      position: {
        top: '12.5rem',
      },
    });

    // TODO: false/positive when close event
    this.filtersDialogRef.afterClosed().subscribe((params) => {
      this.filtersDialogRef = void 0;

      if (!params) return;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          ...params,
          page: 1,
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  private noEmisorAlert() {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: this.translateService.instant('invoice.invoices.noemisor-title'),
        modalMessage: this.translateService.instant('invoice.invoices.noemisor-message'),
        confirm: this.translateService.instant('invoice.invoices.noemisor-confirm'),
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1'],
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((res?) => {
      res && this.createEditEmisor();
    });
  }

  private createEditEmisor(emisor?) {
    const dialogRef = this.matDialog.open(FacturaEmitterComponent, {
      data: emisor,
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1'],
    });

    dialogRef.afterClosed().subscribe((result?) => {
      if (result?.success === true) {
        this.facturasEmitter.next(['refresh:defaultEmisor']);
      }
    });
  }

  public navigate(newParams) {
    // Hacky solution

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: { ...this.vm?.params, ...newParams },
      queryParamsHandling: 'merge',
    });

    this.location.go(urlTree.toString());
    this.facturasEmitter.next(['queryParams', urlTree.queryParams]);

    // Original solution

    // this.router.navigate([], {
    //   relativeTo: this.route,
    //   queryParams,
    //   queryParamsHandling: 'merge',
    //   replaceUrl: true
    // })
  }

  public openCategoryModal(mode: 'new' | 'edit', data?: any) {
    if (data) {
      this.selectedCategory = data._id;
      this.categoryModal.type = data.name;
    }

    this.categoryModal.show = true;
    this.categoryModal.mode = mode;
  }

  public async handleCloseCategoryModal(type?: 'done' | string) {
    const status = this.categoryModal;

    if (type !== 'done') {
      this.resetCategoryModal();
      return;
    }

    if (!status.type) return;

    const payload = { type: status.type };

    const apiCall =
      status.mode === 'new'
        ? this.apiRestService.apiRest(JSON.stringify(payload), 'api/vehicle_types', { apiVersion: 'vehicle-service' })
        : this.apiRestService.apiRestPut(JSON.stringify(payload), `api/vehicle_types/${this.selectedCategory}`, {
            apiVersion: 'vehicle-service',
          });

    (await apiCall).subscribe({
      next: () => {
        this.resetCategoryModal();
        this.facturasEmitter.next(['refresh']);
      },
      error: ({ error }) => {
        status.error = error.error;
        this.cd.markForCheck();
      },
    });
  }

  private resetCategoryModal(show?: boolean) {
    this.categoryModal = {
      show,
      mode: 'new',
      type: '',
      error: null,
    };

    this.cd.markForCheck();
  }

  //UTILS
  private log = (...args: any[]) => {
    console.log(...args);
  };

  private makeTemplate = (template: object) => {
    return encodeURIComponent(JSON.stringify(template));
  };

  private filtersCount = (params = {}) =>
    Object.keys(params).filter((filterName) => filterParams.has(filterName) && params[filterName]).length || null;

  public range = (from, to) => {
    to = to + 1;
    return Array(to - from)
      .fill(0)
      .map((_, i) => from + i);
  };
}
