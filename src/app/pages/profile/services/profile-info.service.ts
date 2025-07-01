import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileInfoService {
  public profilePicUrl = new BehaviorSubject<string>('');
  
  constructor() { }
  
  getProfilePic() {
    // Método vacío para compatibilidad
  }
}