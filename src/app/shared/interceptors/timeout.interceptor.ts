import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, EMPTY, TimeoutError } from 'rxjs';
import { catchError, delay, finalize, map, retryWhen, tap, timeout } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router } from '@angular/router';

/**
 * This interceptor handles all HTTPRequest from the app and its customized for controling the following features:
 *
 * • <b>Loader:</b> Its rendered with Javascript vanilla in "index.html" file from root folder and styled in "_loader.scss".
 *
 * • <b>Timeout:</b> default value "30000".
 *
 * • <b>Retry:</b> default value "0".
 *
 * • <b>Handle Error Timeout:</b> defalut value is empty, if defined, the alert button will redirect to the specified target.
 *
 * <b>Note:</b> All default values come from the api-rest.service.ts or authentication.service.ts from the HTTPRequest URL Parameters. The customized values come from each HTTPRequest. The language parameter its needed for translating the Timeout Alert.
 *
 */
@Injectable({
  providedIn: 'root'
})
export class TimeoutInterceptor implements HttpInterceptor {
  private alertDisplayed: boolean = false;
  loaderRequests = 0;

  constructor(private router: Router, private translateService: TranslateService, private alertService: AlertService) {}

  /**
   *
   *
   * @param {HttpRequest<any>} request
   * @param {HttpHandler} next
   * @return {*}  Note: setTimeout in the finalize pipe operator its defined for solving the flashes loader in some cases, the default value is 0. Still evaluating a better solution.
   * @memberof TimeoutInterceptor
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET' || (request.method === 'GET' && request.params.get('getLoader') === 'true')) {
      let showLoader = request.params.get('loader');
      if (showLoader === 'true') {
        this.loaderRequests += 1;
        document.getElementById('loader')?.classList?.add('show-loader');
      }
      return next.handle(request).pipe(
        timeout(parseInt(request.params.get('timeout') ?? '30000')),
        retryWhen((err) => {
          let retry = 0;
          return err.pipe(
            tap(() => {}),
            map((error) => {
              if (retry++ >= parseInt(request.params.get('retry') ?? '0')) {
                throw error;
              }
              return error;
            })
          );
        }),
        catchError((err) => {
          if (!this.alertDisplayed) {
            if (err instanceof TimeoutError) {
              this.timeoutAlert(request.params.get('route'));
              // NOTE: throw?
              // throw Error(this.translateService.instant('errors.timeout.title'));
            } else {
              throw err;
            }
          }
          return EMPTY;
        }),
        finalize(() => {
          if (showLoader === 'true') {
            this.loaderRequests -= 1;

            setTimeout(() => {
              if (!this.loaderRequests) {
                document.getElementById('loader')?.classList?.remove('show-loader');
              }
            }, 0);
          }
        })
      );
    } else {
      return next.handle(request);
    }
  }

  /**
   *
   *
   * @param {string} error Displays the error message
   * @memberof TimeoutInterceptor
   */
  async errorAlert(error: string) {
    this.alertService.create({
      title: 'Error',
      body: error,
      handlers: [
        {
          text: 'ok',
          color: '#FFE000',
          action: async () => {
            this.alertService.close();
          }
        }
      ]
    });
  }

  /**
   *
   *
   * @param {string} route if not empty, will redirect to antoher page
   * @memberof TimeoutInterceptor
   */
  async timeoutAlert(route: string | null) {
    this.alertService.create({
      title: this.translateService.instant('errors.timeout.title'),
      body: this.translateService.instant('errors.timeout.body'),
      handlers: [
        {
          text: this.translateService.instant('errors.timeout.ok'),
          color: '#FFE000',
          action: async () => {
            this.alertService.close();

            if (route) {
              this.router.navigate(['/', route]);
            } else {
              console.log('No route specified');
            }
          }
        }
      ]
    });
  }
}
