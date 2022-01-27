import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileInfoService {

  constructor(
    private webService: AuthService,
  ) { }

  public profileInfo: any;
  private profileInfoSubject: Subject<any> = new BehaviorSubject<any>({});
  private profilePicSubject: Subject<string> = new BehaviorSubject<string>('/assets/images/user-outline.svg');
  data = this.profileInfoSubject.asObservable();
  profilePicUrl = this.profilePicSubject.asObservable();


  updateDataSelection(data: any){
    this.profileInfoSubject.next(data);
  }

  async getProfileInfo(){
    (await this.webService.apiRest('', 'shippers/select_attributes'))
    .subscribe(
      (res) => {
        console.log('select attributes : ', res.result);
        this.profileInfo = res.result;
        this.updateDataSelection(this.profileInfo);
      },
      ( err ) => {
      }
    )
  }

  async getProfilePic(): Promise<string> {

    console.log('New profile pic: ');
    return new Promise(async ( resolve, reject) => {
      (await this.webService.apiRest('', 'profile/get_picture')).subscribe(
        async ({ result }) => {
          console.log('New profile pic result: ', result);
          if (result.url || result.url == '') {
            localStorage.setItem('profilePicture', result.url);
            this.profilePicSubject.next(result.url)
            console.log('Profile pic: ', result.url);
            resolve(result.url)
  
          } 
        },
        (error) => {
          console.error('Error loading profile pic : ', error.message);
          reject(error.message);
        }
      );
    });
  }

  
}
