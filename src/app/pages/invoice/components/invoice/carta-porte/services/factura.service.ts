import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FacturaService {
  private emisores = new BehaviorSubject(null);
  private emisoresTable = new BehaviorSubject(null);

  constructor() {}

  observeEmisorData(): BehaviorSubject<any> {
    this.emisores.next(false);
    return this.emisores;
  }

  observeEmisorTableRender(): BehaviorSubject<any> {
    this.emisoresTable.next(false);
    return this.emisoresTable;
  }
}
