import { Component, Input, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { CartaPorteInfoService } from '../services/carta-porte-info.service';
import { CataloguesListService } from '../services/catalogues-list.service';
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

  constructor(
    public cataloguesListService: CataloguesListService,
    public cartaPorteInfoService: CartaPorteInfoService,
  ) {}

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
      } catch (e) {
        console.log('Error: ', e);
        this.cartaPorteInfoService.addRecolectedInfo({
          ubicaciones: [],
          isValid: false,
        });
      }
    });
  }

  public publicngOnChanges(changes: SimpleChanges): void {
    // console.log(changes)
    // console.log(changes.info)
    if (changes.info.currentValue) {
      this.locations = this.info;
    } else {
      this.locations = [this.counter];
    }
  }

  public addLocation() {
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

  public delete(index) {
    if (this.locations.length > 1) this.locations.splice(index, 1);
  }
}
