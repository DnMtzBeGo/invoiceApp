import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CfdiService {

  url_es = '../assets/json/cfdi_es.json';
  url_en = '../assets/json/cfdi_en.json';

  constructor(private http: HttpClient) {}

  getCFDI_es(): Observable<any[]> {
    return this.http.get<any[]>(this.url_es);
  }

  getCFDI_en(): Observable<any[]> {
    return this.http.get<any[]>(this.url_en);
  }
}
