import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Observable, from, of, merge, Subject } from 'rxjs';
import { mergeAll, pluck, distinctUntilChanged, share, switchMap, tap, map, startWith } from 'rxjs/operators';
import { reactiveComponent } from 'src/app/shared/utils/decorators';
import { ofType, oof } from 'src/app/shared/utils/operators.rx';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FacturaDireccion, FacturaPais, FacturaEstado, FacturaMunicipio, FacturaColonia } from '../../models';

@Component({
  selector: 'app-factura-direccion-input',
  templateUrl: './factura-direccion-input.component.html',
  styleUrls: ['./factura-direccion-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class FacturaDireccionInputComponent implements OnInit {
  $rx = reactiveComponent(this);

  private _direccion: FacturaDireccion | null = null;

  @Input()
  set direccion(d: FacturaDireccion | null) {
    // console.log('changes.direccion ', d || null);

    this._direccion = d;
    this.direccionEmitter.next(['direccion:set', d || null]);
  }

  get direccion() {
    return this._direccion;
  }

  @Input() readonly? = false;

  @Output() direccionChange = new EventEmitter<string>();

  vm: {
    direccion?: FacturaDireccion;
    paises?: FacturaPais[];
    estados?: FacturaEstado[];
    municipios?: FacturaMunicipio[];
    colonias?: FacturaColonia[];
  };

  direccionEmitter = new Subject<['direccion:set' | 'pais:select' | 'estado:select' | 'cp:input' | 'refresh' | 'submit', unknown]>();

  constructor(private apiRestService: AuthService) {}

  ngOnInit(): void {
    //DATA FETCHING
    const direccion$: Observable<FacturaDireccion | null> = this.direccionEmitter.pipe(
      ofType('direccion:set'),
      tap((direccion) => null),
      map((direccion: FacturaDireccion | null) => direccion),
      share()
    );

    const paises$ = this.fetchPaises();

    const estados$ = merge(
      oof(''),
      direccion$.pipe(
        map((direccion?) => direccion?.pais),
        distinctUntilChanged()
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
        })
      )
    ).pipe(switchMap(this.fetchEstados));

    const municipios$ = merge(
      oof(''),
      direccion$.pipe(
        map((direccion?) => direccion?.estado),
        distinctUntilChanged()
      ),
      this.direccionEmitter.pipe(
        ofType('estado:select'),
        tap(() => {
          this.vm.direccion.municipio = '';
          this.vm.direccion.cp = '';
          this.vm.direccion.colonia = '';
          this.vm.colonias = [];
        })
      )
    ).pipe(switchMap(this.fetchMunicipios));

    const colonias$ = merge(
      oof(''),
      direccion$.pipe(
        map((direccion?) => direccion?.cp),
        distinctUntilChanged()
      ),
      this.direccionEmitter.pipe(
        ofType('cp:input'),
        tap(() => {
          this.vm.direccion.colonia = '';
        })
      )
    ).pipe(switchMap(this.fetchColonias));

    this.vm = this.$rx.connect({
      direccion: direccion$,
      paises: paises$,
      estados: estados$,
      municipios: municipios$,
      colonias: colonias$
    });
  }

  //API calls
  fetchPaises() {
    return from(
      this.apiRestService.apiRestGet('invoice/catalogs/countries', {
        loader: 'false'
      })
    ).pipe(mergeAll(), pluck('result'), startWith(null));
  }

  fetchEstados = (pais?: string) => {
    return pais == void 0 || pais === ''
      ? of([])
      : from(
          this.apiRestService.apiRestGet('invoice/catalogs/states', {
            loader: 'false',
            pais
          })
        ).pipe(mergeAll(), pluck('result'), startWith(null));
  };

  fetchMunicipios = (estado?: string) => {
    return estado == void 0 || estado === ''
      ? of([])
      : from(
          this.apiRestService.apiRestGet('invoice/catalogs/municipalities', {
            loader: 'false',
            estado
          })
        ).pipe(mergeAll(), pluck('result'), startWith(null));
  };

  fetchColonias = (cp?: string) => {
    return cp == void 0 || cp.trim() === '' || cp.length < 5
      ? of([])
      : from(
          this.apiRestService.apiRestGet('invoice/catalogs/suburbs', {
            loader: 'false',
            cp
          })
        ).pipe(mergeAll(), pluck('result'), startWith(null));
  };

  // UTILS
  log = (...args) => {
    console.log(...args);
  };

  showError = (error: any) => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error).join(',\n') : error;
  };
}
