import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private translateService: TranslateService
  ) {}

  async getOptions(options: object) {
    const defaultValues: object = {
      loader: 'true',
      timeout: '30000',
      retry: '0',
      route: '',
      lang: this.translateService.currentLang
    };

    return new HttpParams({
      fromObject: {
        ...defaultValues,
        ...Object.fromEntries(
          Object.entries(options).filter(([key]) => key in defaultValues)
        )
      }
    });
  }

  public async uploadFilesSerivce(
    formData: FormData,
    method: string,
    requestOptions?: Object,
    appBehaviourOptions: object = {}
  ): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Acceontrol-Allow-Headers': 'Content-Type, Accept',
      'Access-Css-Control-Allow-Methods': 'POST,GET,OPTIONS',
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
    });
    const params = await this.getOptions(appBehaviourOptions);
    // return this.http.post<any>(environment.URL_BASE + method, formData, { headers, params: params });
    return this.http.post<any>(environment.URL_BASE + method, formData, {
      headers,
      params,
      ...requestOptions
    });
  }

  public async apiRest(
    requestJson: string,
    method: string,
    options: object = {}
  ): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Acceontrol-Allow-Headers': 'Content-Type, Accept',
      'Access-Css-Control-Allow-Methods': 'POST,GET,OPTIONS',
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
    });

    const params = await this.getOptions(options);
    return this.http.post<any>(environment.URL_BASE + method, requestJson, {
      headers,
      params
    });
  }
}
