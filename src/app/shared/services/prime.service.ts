import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PrimeService {
  loaded = new Subject();
  isPrime = false;

  constructor(private webService: AuthService) {
    this.loadData();
  }

  async loadData() {
    const { result } = await (await this.webService.apiRest('', 'carriers/home')).toPromise();
    this.isPrime = Boolean(result.subscription);
    this.loaded.next();
    this.loaded.complete();
  }
}
