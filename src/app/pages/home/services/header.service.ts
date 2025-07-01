import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  public styleHeader = new BehaviorSubject<boolean>(false);
  
  constructor() { }
}