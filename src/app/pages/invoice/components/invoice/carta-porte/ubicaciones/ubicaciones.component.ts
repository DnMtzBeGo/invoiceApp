import { Component, Input, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';

import { CartaPorteInfoService, LocationIds } from '../services/carta-porte-info.service';
import { UbicacionComponent } from './components/ubicacion/ubicacion.component';

@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.component.html',
  styleUrls: ['./ubicaciones.component.scss'],
})
export class UbicacionesComponent implements OnInit {
  public locations: any[];
  public counter = 0;

  @ViewChildren(UbicacionComponent)
  public ubicacionesRef: QueryList<UbicacionComponent>;

  @Input() public info: any;

  constructor(private readonly cartaPorteInfoService: CartaPorteInfoService) {}

  public async ngOnInit(): Promise<void> {
    this.cartaPorteInfoService.infoRecolector.subscribe(() => {
      try {
        const ubicaciones = this.ubicacionesRef?.toArray().map((e) => {
          return e.getFormattedUbicacion();
        });
        this.cartaPorteInfoService.addRecolectedInfo({
          ubicaciones,
          isValid: this.checkIfUbicacionesValid(),
        });
        this.parseLocationIds(ubicaciones);
      } catch (e) {
        console.log('Error: ', e);
        this.cartaPorteInfoService.addRecolectedInfo({
          ubicaciones: [],
          isValid: false,
        });
        this.parseLocationIds([]);
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes)
    // console.log(changes.info)
    if (changes.info.currentValue) {
      this.locations = this.info;
    } else {
      this.locations = [this.counter];
    }

    this.parseLocationIds(this.locations);
  }

  public parseLocationIds(locations: any): void {
    const locationIds: LocationIds = { OR: [], DE: [] };

    if (Array.isArray(locations)) {
      for (const location of locations) {
        if (location.id_ubicacion.startsWith('OR') || location.id_ubicacion.startsWith('DE'))
          locationIds[location.id_ubicacion.substring(0, 2)].push(location.id_ubicacion);
      }
    }

    this.cartaPorteInfoService.syncLocationIds({ ...locationIds });
  }

  public syncLocations(): void {
    this.parseLocationIds(
      this.ubicacionesRef?.toArray().map((e) => {
        return e.getFormattedUbicacion();
      }),
    );
  }

  public addLocation(): void {
    this.locations.push(++this.counter);
  }

  public checkIfUbicacionesValid(): boolean {
    return !this.ubicacionesRef
      ?.toArray()
      .map((e) => {
        return e.checkIfFormValid();
      })
      .some((e) => e == false);
  }

  public delete(index: number): void {
    if (this.locations.length > 1) this.locations.splice(index, 1);
  }
}
