import { Injectable } from '@angular/core';
import { Observable, Subject, of, concat, timer, from, merge } from 'rxjs';
import {
  mapTo,
  mergeAll,
  map,
  tap,
  pluck,
  debounceTime,
  switchMap,
  filter
} from 'rxjs/operators';
import { ofType } from 'src/app/shared/utils/operators.rx';
import { AuthService } from './auth.service';

type ID = string;
type PlaceId = string;

interface GetPlacesDTO {
  result: { _id: ID; places: PlaceId }[] | null;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  public emitter = new Subject<['add' | 'delete', PlaceId]>();
  public places$: Observable<Set<PlaceId>>;
  private placesIds: Map<PlaceId, ID> = new Map();

  constructor(private authService: AuthService) {
    const addAction$ = this.emitter.pipe(ofType('add'));
    const deleteAction$ = this.emitter.pipe(ofType('delete'));

    this.places$ = merge(
      this.getPlaces().pipe(
        tap((items) => {
          this.placesIds = new Map(
            items
              .filter((item) => item.places)
              .map((item) => [item.places, item._id])
          );
        })
      ),
      this.emitter.pipe(
        debounceTime(0),
        tap(([method, placeId]) => {
          if (method === 'add') this.placesIds.set(placeId, '');
          else if (method === 'delete') this.placesIds.delete(placeId);
        })
      ),
      addAction$.pipe(
        debounceTime(250),
        switchMap((placeId: any) => {
          return from(
            this.authService.apiRest(
              { place: placeId } as any,
              'places/add_place',
              { loader: 'false' }
            )
          ).pipe(
            mergeAll(),
            tap((responseData) => {
              this.placesIds.set(placeId, responseData.result._id);
            })
          );
        })
      ),
      deleteAction$.pipe(
        map((placeId: any) => [placeId, this.placesIds.get(placeId)]),
        filter(([placeId, id_place]) => Boolean(id_place)),
        debounceTime(250),
        switchMap(([placeId, id_place]) => {
          return from(
            this.authService.apiRest(
              { id_place } as any,
              'places/remove_place',
              { loader: 'false' }
            )
          ).pipe(mergeAll());
        })
      )
    ).pipe(map(() => new Set(this.placesIds.keys())));
  }

  private getPlaces() {
    return from(this.authService.apiRest('', 'places/get_places')).pipe(
      mergeAll(),
      map((responseData: GetPlacesDTO) => responseData.result ?? [])
    );
  }

  add(placeId: PlaceId) {
    this.emitter.next(['add', placeId]);
  }

  delete(placeId: PlaceId) {
    this.emitter.next(['delete', placeId]);
  }
}
