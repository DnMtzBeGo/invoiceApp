import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Observable, from, of, merge, Subject } from 'rxjs';
import { mergeAll, pluck, distinctUntilChanged, share, switchMap, tap, map, startWith } from 'rxjs/operators';

import { reactiveComponent } from 'src/app/shared/utils/decorators';
import { ofType, oof } from 'src/app/shared/utils/operators.rx';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FacturaDireccion, FacturaPais, FacturaEstado, FacturaMunicipio, FacturaColonia } from '../../models';
import { searchInList } from '../../containers/factura-edit-page/factura.core';

export type FetchedZipCode = { estado?: string; municipio?: string; localidad?: string };

@Component({
  selector: 'app-factura-direccion-input',
  templateUrl: './factura-direccion-input.component.html',
  styleUrls: ['./factura-direccion-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FacturaDireccionInputComponent implements OnInit {
  private $rx = reactiveComponent(this);

  private _direccion: FacturaDireccion | null = null;

  @Input()
  public set direccion(d: FacturaDireccion | null) {
    // console.log('changes.direccion ', d || null);

    this._direccion = d;
    this.direccionEmitter.next(['direccion:set', d || null]);
  }

  public get direccion() {
    return this._direccion;
  }

  @Input() public readonly? = false;

  @Output() public direccionChange = new EventEmitter<string>();

  private _lastZipCodeFetched: FetchedZipCode = null;
  public filteredCountries: any[] = [];
  public filteredStates: any[] = [];
  public filteredLocations: any[] = [];
  public filteredSuburbs: any[] = [];
  public filteredMunicipalities: any[] = [];

  public vm: {
    direccion?: FacturaDireccion;
    paises?: FacturaPais[];
    estados?: FacturaEstado[];
    municipios?: FacturaMunicipio[];
    colonias?: FacturaColonia[];
  };

  public direccionEmitter = new Subject<
    ['direccion:set' | 'pais:select' | 'estado:select' | 'cp:input' | 'refresh' | 'submit', unknown]
  >();

  constructor(private apiRestService: AuthService) {}

  public ngOnInit(): void {
    //DATA FETCHING
    const direccion$: Observable<FacturaDireccion | null> = this.direccionEmitter.pipe(
      ofType('direccion:set'),
      tap((direccion) => null),
      map((direccion: FacturaDireccion | null) => direccion),
      share(),
    );

    const paises$ = this.fetchPaises();

    const estados$ = merge(
      oof(''),
      direccion$.pipe(
        map((direccion?) => direccion?.pais),
        distinctUntilChanged(),
      ),
      this.direccionEmitter.pipe(
        ofType('pais:select'),
        tap(() => {
          this.vm.direccion.estado = '';
          this.vm.direccion.municipio = '';
          this.vm.municipios = [];
          this.vm.direccion.cp = '';
          this.vm.direccion.colonia = '';
          this.vm.colonias = [];
        }),
      ),
    ).pipe(switchMap(this.fetchEstados));

    const municipios$ = merge(
      oof(''),
      direccion$.pipe(
        map((direccion?) => direccion?.estado),
        distinctUntilChanged(),
      ),
      this.direccionEmitter.pipe(
        ofType('estado:select'),
        tap(() => {
          this.vm.direccion.municipio = '';

          if (this.vm.direccion.estado !== this._lastZipCodeFetched?.estado) this.vm.direccion.cp = '';

          this.vm.direccion.colonia = '';
          this.vm.colonias = [];
        }),
      ),
    ).pipe(switchMap(this.fetchMunicipios));

    const colonias$ = merge(
      oof(''),
      direccion$.pipe(
        map((direccion?) => direccion?.cp),
        distinctUntilChanged(),
      ),
      this.direccionEmitter.pipe(
        ofType('cp:input'),
        tap(() => {
          this.vm.direccion.colonia = '';
        }),
      ),
    ).pipe(switchMap(this.fetchColonias));

    const zipcode$ = merge(
      oof(''),
      direccion$.pipe(
        map((direccion?) => direccion?.cp),
        distinctUntilChanged(),
      ),
      this.direccionEmitter.pipe(
        ofType('cp:input'),
        tap(() => {
          if (this.vm.direccion.cp.length === 5)
            this._fetchZipCode(this.vm.direccion.cp).subscribe((zipcode: any) => {
              this._lastZipCodeFetched = zipcode || {};

              if (zipcode?.estado) {
                this.direccionEmitter.next(['estado:select', (this.vm.direccion.estado = zipcode.estado)]);
                this.vm.direccion.municipio = zipcode.municipio;
                this.vm.direccion.localidad = zipcode.localidad;
              }
            });
          else {
            this.vm.direccion.estado = '';
            this.vm.direccion.colonia = '';
            this.vm.direccion.municipio = '';
          }
        }),
      ),
    );

    this.vm = this.$rx.connect({
      direccion: direccion$,
      paises: paises$,
      estados: estados$,
      municipios: municipios$,
      colonias: colonias$,
      zipcode: zipcode$,
    });
  }

  //API calls
  private fetchPaises() {
    return from(
      this.apiRestService.apiRestGet('invoice/catalogs/countries', {
        loader: 'false',
      }),
    ).pipe(
      mergeAll(),
      tap((d) => {
        this.filteredCountries = d?.result || [];
      }),
      pluck('result'),
      startWith(null),
    );
  }

  private fetchEstados = (pais?: string) => {
    return pais == void 0 || pais === ''
      ? of([])
      : from(
          this.apiRestService.apiRestGet('invoice/catalogs/states', {
            loader: 'false',
            pais,
          }),
        ).pipe(
          mergeAll(),
          tap((d) => {
            this.filteredStates = d?.result || [];
          }),
          pluck('result'),
          startWith(null),
        );
  };

  private fetchMunicipios = (estado?: string) => {
    return estado == void 0 || estado === ''
      ? of([])
      : from(
          this.apiRestService.apiRestGet('invoice/catalogs/municipalities', {
            loader: 'false',
            estado,
          }),
        ).pipe(
          mergeAll(),
          tap((d) => {
            this.filteredMunicipalities = d?.result || [];
          }),
          pluck('result'),
          startWith(null),
        );
  };

  private fetchColonias = (cp?: string) => {
    return cp == void 0 || cp.trim() === '' || cp.length < 5
      ? of([])
      : from(
          this.apiRestService.apiRestGet('invoice/catalogs/suburbs', {
            loader: 'false',
            cp,
          }),
        ).pipe(
          mergeAll(),
          tap((d) => {
            this.filteredSuburbs = d?.result || [];
          }),
          pluck('result'),
          startWith(null),
        );
  };

  public searchCountries(code: string): void {
    searchInList(this, ['vm', 'paises'], 'filteredCountries', code);
  }

  public searchStates(code: string): void {
    searchInList(this, ['vm', 'estados'], 'filteredStates', code, 'clave', 'nombre');
  }

  public searchMunicipalities(code: string): void {
    searchInList(this, ['vm', 'municipios'], 'filteredMunicipalities', code, 'clave', 'nombre');
  }

  public searchSuburbs(code: string): void {
    searchInList(this, ['vm', 'colonias'], 'filteredSuburbs', code, 'clave', 'nombre');
  }

  private _fetchZipCode = (cp?: string): Observable<[]> => {
    return cp == void 0 || cp.trim() === '' || cp.length < 5 || this.vm.direccion.pais !== 'MEX'
      ? of([])
      : from(
          this.apiRestService.apiRestGet(`invoice/zip-codes/${cp}`, {
            loader: 'false',
            cp,
          }),
        ).pipe(mergeAll(), pluck('result'), startWith(null));
  };
}
