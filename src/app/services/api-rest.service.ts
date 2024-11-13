import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

export type HttpMethod = 'POST' | 'GET' | 'DELETE' | 'PUT';

/**
 * HttpOptions interface for request wrapper parameter.
 * - body: The body of the request if any.
 * - headers: For changing headers config. Reference: https://angular.io/api/common/http/HttpHeaders
 * - params: For changing params config. Reference: https://angular.io/api/common/http/HttpParams
 * - context:
 *   For changing context config, used for internal options as timeout, retry and other defaults.
 *   Reference: https://angular.io/api/common/http/HttpContext
 * - specifics:
 *   For changing any other specific options config of the Angualr HttpRequest class.
 *   e.g: responseType: 'text'. Reference: https://angular.io/api/common/http/HttpRequest#properties
 */
export interface HttpOptions {
  body?: any;
  headers?: HttpHeaders | { [header: string]: string };
  params?: HttpParams | { [param: string]: string };
  context?: HttpContext;
  specifics?: { [specific: string]: string };
}

/**
 * ApiRestService class.
 * This service is a wrapper for Angular HttpClient.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiRestService {
  constructor(private httpClient: HttpClient) {}

  /**
   *  Parameters:
   *   - method: The HTTP method/verb
   *   - url: Endpoint
   *   - options: Where body, params, headers, etc. are set. Reference: https://angular.io/api/common/http/HttpRequest#properties
   */
  public request(method: HttpMethod, url: string, options: HttpOptions = { body: null }): Observable<any> {
    const reqUrl = environment.URL_BASE + url;
    const headers = this.setHeaders(options.headers);
    const params = this.setParams(options.params);
    const reqOptions = {
      body: options.body,
      headers: headers,
      context: options.context,
      params: params,
      ...options.specifics,
    };
    return this.httpClient.request(method, reqUrl, reqOptions);
  }

  private setHeaders(overrides: object | null = null): HttpHeaders {
    let headers = new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    for (const header in overrides) {
      headers = headers.set(header, overrides[header]);
    }

    return headers;
  }

  private setParams(overrides: object | null = null): HttpParams {
    const defaultValues: object = {}; // No default params at the moment.

    const params = new HttpParams({
      fromObject: {
        ...defaultValues,
        ...overrides,
      },
    });

    return params;
  }
}
