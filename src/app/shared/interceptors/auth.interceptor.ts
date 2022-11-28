import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {
    // Julio
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYxMTJiMTJlYzM5ZDk5MDA0MTM5OWRiZCIsImVtYWlsIjoianVsaW9jZXNhckBiZWdvbXguY29tIiwidGVsZXBob25lIjoiKzUyNTUyNzY1MzY5NiJ9LCJpYXQiOjE2MzM0NDk4MzR9.QFxceTiU2rNTNlX_BP85uUcQzi5pedcMXzRJKUTlRJA

    // Charly
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYxMTE2ZWZjNmQyM2I4MDA0MWFiNzI5MiIsImVtYWlsIjoiY2FybG9zQGJlZ29teC5jb20iLCJ0ZWxlcGhvbmUiOiIrNTI1NTQ4MDA4NTIzIn0sImlhdCI6MTYzNDE0OTQzMn0.pUB0R8BEjxIeKM7wYUoxOoAq3VB4d4Nn4dbfmATIDHM

    const token =
      new URLSearchParams(window.location.search).get("token") ??
      window.localStorage.getItem("token") ??
      "";

    if (!token)
      window.setTimeout(
        () => (window.location.href = environment.website_url),
        1000
      );

    window.localStorage.setItem("token", token);
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // TODO: show alert service and the redirect?
          /* window.setTimeout(() => {
            window.location.href = environment.website_url;
          }, 1000);
          throw new Error('Invalid token'); */
        }

        throw err;
      }),
      tap(() => {
        const storageToken =
          new URLSearchParams(window.location.search).get("token") ??
          window.localStorage.getItem("token");

        const isValid = storageToken != void 0;

        if (isValid) return;

        // TODO: show alert service and the redirect?
        /* window.setTimeout(() => {
          window.location.href = environment.website_url;
        }, 1000); */

        throw new Error("Invalid token");
      })
    );
  }
}
