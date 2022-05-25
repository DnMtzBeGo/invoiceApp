import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../environments/environment";

const isInvoice = (method: string) =>
  // ^invoice(\/\w+)?/.test(method);
  0;

const getURLBASE = (method: string) =>
  isInvoice(method) ? environment.URL_DASHBOARD : environment.URL_BASE;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private translateService: TranslateService
  ) {}

  async getOptions(options: object) {
    const defaultValues: object = {
      loader: "true",
      timeout: "30000",
      retry: "0",
      route: "",
      lang: this.translateService.currentLang,
    };

    return new HttpParams({
      fromObject: {
        ...defaultValues,
        ...options,
      },
    });
  }

  public async uploadFilesSerivce(
    formData: FormData,
    method: string,
    requestOptions?: Object,
    appBehaviourOptions: object = {}
  ): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      "Acceontrol-Allow-Headers": "Content-Type, Accept",
      "Access-Css-Control-Allow-Methods": "POST,GET,OPTIONS",
      Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
    });
    const URL_BASE = getURLBASE(method);
    const params = await this.getOptions(appBehaviourOptions);
    // return this.http.post<any>(environment.URL_BASE + method, formData, { headers, params: params });
    return this.http.post<any>(URL_BASE + method, formData, {
      headers,
      params,
      ...requestOptions,
    });
  }

  public async apiRest(
    requestJson: string,
    method: string,
    options: any = {}
  ): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Acceontrol-Allow-Headers": "Content-Type, Accept",
      "Access-Css-Control-Allow-Methods": "POST,GET,OPTIONS",
      Authorization: `Bearer ${
        isInvoice(method)
          ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYxODMxMGU4NmMxNTFmZTI0ZGVhZGQxNyIsImVtYWlsIjoibWFyY29wb2xvQGJlZ28uYWkifSwiaWF0IjoxNjUwOTk1MDQ4fQ.jrvfFLuPlClABGEwKoZdpvtiHwDkTWeBBpPAUDDt49M"
          : localStorage.getItem("token") ?? ""
      }`,
    });

    const URL_BASE = getURLBASE(method);
    const params = await this.getOptions(options);
    let splitUrl, url;

    if(options && options["apiVersion"]) {
      splitUrl = environment.URL_BASE.split("/");
      splitUrl[splitUrl.length - 2] = options["apiVersion"];
      url = splitUrl.join("/");
    } else {
      url = environment.URL_BASE;
    }
    return this.http.post<any>(url + method, requestJson, {
      headers,
      params,
    });
  }

  public async apiRestGet(
    method: string,
    options: object = {}
  ): Promise<Observable<any>> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Acceontrol-Allow-Headers": "Content-Type, Accept",
      "Access-Css-Control-Allow-Methods": "POST,GET,OPTIONS",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    });
    const URL_BASE = getURLBASE(method);
    const params = await this.getOptions(options);
    let splitUrl, url;

    if(options && options["apiVersion"]) {
      splitUrl = environment.URL_BASE.split("/");
      splitUrl[splitUrl.length - 2] = options["apiVersion"];
      url = splitUrl.join("/");
    } else {
      url = environment.URL_BASE;
    }

    return this.http.post<any>(url + method, {
      headers,
      params,
    });
  }
}
