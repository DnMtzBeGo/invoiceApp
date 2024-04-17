import { Injectable } from '@angular/core';
import { Observable, Subject, of, concat, timer, from, merge } from 'rxjs';
import { mapTo, mergeAll, map, tap, pluck, debounceTime, switchMap, filter } from 'rxjs/operators';
import { ofType } from 'src/app/shared/utils/operators.rx';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { AlertService } from 'src/app/shared/services/alert.service';

type PlaceId = string;

type Model = 'members' | 'trucks' | 'trailers' | 'primeList' | 'prime';
type FleetId = string;
type ID = string;

type DeleteValue = [Model, FleetId, ID];
type DeleteAction = ['delete', DeleteValue];

type Action = DeleteAction;

@Injectable({
  providedIn: 'root'
})
export class FleetService {
  public emitter = new Subject<Action>();

  constructor(private translateService: TranslateService, private authService: AuthService, private alertService: AlertService) {}

  resolvers = {
    members: {
      delete: (id_fleet, id) =>
        from(
          this.authService.apiRest(
            JSON.stringify({
              id_fleet,
              id_member: id
            }),
            'fleet/remove_member'
          )
        ).pipe(mergeAll())
    },
    trucks: {
      delete: (id_fleet, id) =>
        from(
          this.authService.apiRest(
            JSON.stringify({
              id_truck: id
            }),
            'trucks/delete'
          )
        ).pipe(mergeAll())
    },
    trailers: {
      delete: (id_fleet, id) =>
        from(
          this.authService.apiRest(
            JSON.stringify({
              id_trailer: id
            }),
            'trailers/delete'
          )
        ).pipe(mergeAll())
    },
    primeList: {
      delete: (_, id) => from(this.authService.apiRestDel(`api/vehicle_types/${id}`, { apiVersion: 'vehicle-service' })).pipe(mergeAll())
    },
    prime: {
      delete: (_, id) => from(this.authService.apiRestDel(`api/vehicle/${id}`, { apiVersion: 'vehicle-service' })).pipe(mergeAll())
    }
  };

  delete(value: DeleteValue) {
    console.log(value);

    const [model, id_fleet, id] = value;

    const resolver = this.resolvers[model];

    return resolver.delete(id_fleet, id).pipe(
      tap({
        error: (error) => {
          // console.log(error);
          this.alertService.create({
            title: 'Error',
            body: error?.error?.error?.[this.translateService.currentLang] || error?.error?.error,
            handlers: [
              {
                text: 'ok',
                color: '#FFE000',
                action: () => {
                  this.alertService.close();
                }
              }
            ]
          });
        }
      })
    );
  }

  dispatch(action: Action) {
    console.log(action);
    this.emitter.next(action);
  }
}
