import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private translateService: TranslateService) {}

  async getOptions(options: object) {
    const defaultValues: object = {
      getLoader: 'false',
      loader: 'true',
      timeout: '30000',
      retry: '0',
      route: '',
      lang: this.translateService.currentLang
    };

    return new HttpParams({
      fromObject: {
        ...defaultValues,
        ...options
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

    let splitUrl, url;
    if (requestOptions && requestOptions['apiVersion']) {
      splitUrl = environment.URL_BASE.split('/');
      splitUrl[splitUrl.length - 2] = requestOptions['apiVersion'];
      url = splitUrl.join('/');
    } else {
      url = environment.URL_BASE;
    }
    const result = this.http.post<any>(url + method, formData, {
      headers,
      params,
      ...requestOptions
    });

    return result;
  }

  public async apiRest(requestJson: string, method: string, options: any = {}): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Acceontrol-Allow-Headers': 'Content-Type, Accept',
      'Access-Css-Control-Allow-Methods': 'POST,GET,OPTIONS',
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
    });

    const URL_BASE = environment.URL_BASE;
    const params = await this.getOptions(options);
    let splitUrl, url;

    if (options && options['apiVersion']) {
      splitUrl = URL_BASE.split('/');
      splitUrl[splitUrl.length - 2] = options['apiVersion'];
      url = splitUrl.join('/');
    } else {
      url = URL_BASE;
    }
    return this.http.post<any>(url + method, requestJson, {
      headers,
      params
    });
  }

  public async apiRestGet(method: string, options: object = {}): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Acceontrol-Allow-Headers': 'Content-Type, Accept',
      'Access-Css-Control-Allow-Methods': 'POST,GET,OPTIONS',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    const params = await this.getOptions(options);
    let splitUrl, url;

    if (options && options['apiVersion']) {
      splitUrl = environment.URL_BASE.split('/');
      splitUrl[splitUrl.length - 2] = options['apiVersion'];
      url = splitUrl.join('/');
    } else {
      url = environment.URL_BASE;
    }

    return this.http.get<any>(url + method, {
      headers,
      params
    });
  }

  public async apiRestDelete(method: string, options: object = {}): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Acceontrol-Allow-Headers': 'Content-Type, Accept',
      'Access-Css-Control-Allow-Methods': 'POST,GET,OPTIONS',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    const { URL_BASE } = environment;
    const params = await this.getOptions(options);
    let splitUrl, url;

    if (options && options['apiVersion']) {
      splitUrl = environment.URL_BASE.split('/');
      splitUrl[splitUrl.length - 2] = options['apiVersion'];
      url = splitUrl.join('/');
    } else {
      url = environment.URL_BASE;
    }

    // console.log('route', params.get('route'));
    // if (!params.get('route')) {
    //   params.delete('route');
    // }

    return this.http.delete<any>(url + method, {
      headers,
      params
    });
  }

  public async apiRestPut(requestJson: string, method: string, options: { [key: string]: any } = {}): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Acceontrol-Allow-Headers': 'Content-Type, Accept',
      'Access-Css-Control-Allow-Methods': 'PUT',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    const params = await this.getOptions(options);

    let url: string;
    if (options && options['apiVersion']) {
      const splitUrl = environment.URL_BASE.split('/');
      splitUrl[splitUrl.length - 2] = options['apiVersion'];
      url = splitUrl.join('/');
    } else {
      url = environment.URL_BASE;
    }
    return this.http.put<any>(url + method, requestJson, { headers, params });
  }

  public async apiRestDel(method: string, options: { [key: string]: any } = {}): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Acceontrol-Allow-Headers': 'Content-Type, Accept',
      'Access-Css-Control-Allow-Methods': 'PUT',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    const params = await this.getOptions(options);

    let url: string;
    if (options && options['apiVersion']) {
      const splitUrl = environment.URL_BASE.split('/');
      splitUrl[splitUrl.length - 2] = options['apiVersion'];
      url = splitUrl.join('/');
    } else {
      url = environment.URL_BASE;
    }

    return this.http.delete(url + method, { headers, params });
  }

  // for uploading files with a put request *******************

  public async uploadFilesServicePut(
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

    let splitUrl, url;
    if (requestOptions && requestOptions['apiVersion']) {
      splitUrl = environment.URL_BASE.split('/');
      splitUrl[splitUrl.length - 2] = requestOptions['apiVersion'];
      url = splitUrl.join('/');
    } else {
      url = environment.URL_BASE;
    }
    const result = this.http.put<any>(url + method, formData, {
      headers,
      params,
      ...requestOptions
    });

    return result;
  }
}
