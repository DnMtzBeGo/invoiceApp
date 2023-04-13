import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { ApiRestService } from "src/app/core/services";
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CataloguesListService {
  public catalogues: any = {};
  public countriesSubject = new BehaviorSubject(null);
  public consignmentNoteSubject = new BehaviorSubject([]);
  constructor(private apiRestService: AuthService) {
    //Getting countries list
    this.apiRestService.apiRestGet('invoice/catalogs/countries').then((observable) => {
      observable.subscribe((res: any) => {
        this.countriesSubject.next(res.result);
      });
    });
    //getting consignment note catalogues
    this.apiRestService.apiRestGet('invoice/catalogs/consignment-note').then((observable) => {
      observable.subscribe(
        (res: any) => {
          this.consignmentNoteSubject.next(res.result);
        },
        (error) => {
          console.log('Error getting catalogue: ', error);
        }
      );
    });
  }

  /**
   * Returns the requested catalogue, if the haven't called the endpoint,
   * we first call it and then we store the value
   * @param endpoint the endpoint where the values are stored
   * @param key if the enpoints returns multiple objects but
   * we only care about one file
   * @returns a promise with the values that we want
   */
  async getCatalogue(endpoint: string, payload?: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.catalogues[endpoint] || payload) {
        (
          await (payload
            ? ['states', 'locations', 'municipalities', 'suburbs'].includes(endpoint)
              ? this.apiRestService.apiRestGet(`invoice/catalogs/${endpoint}`, payload)
              : this.apiRestService.apiRest(payload, `invoice/catalogs/${endpoint}`)
            : this.apiRestService.apiRestGet(`invoice/catalogs/${endpoint}`))
        ).subscribe(
          (res) => {
            this.catalogues[endpoint] = res.result;
            resolve(this.catalogues[endpoint]);
          },
          (err) => {
            reject(err);
          }
        );
      } else {
        resolve(this.catalogues[endpoint]);
      }
    });
  }
}
