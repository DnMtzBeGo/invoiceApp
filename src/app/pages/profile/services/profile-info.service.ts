import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { AuthService } from "src/app/shared/services/auth.service";

@Injectable({
  providedIn: "root",
})
export class ProfileInfoService {
  constructor(private webService: AuthService) {}

  public profileInfo: any;
  private profileInfoSubject: Subject<any> = new BehaviorSubject<any>({});
  private profilePicSubject: Subject<string> = new BehaviorSubject<string>(
    "/assets/images/user-outline.svg"
  );
  data = this.profileInfoSubject.asObservable();
  profilePicUrl = this.profilePicSubject.asObservable();

  updateDataSelection(data: any) {
    this.profileInfoSubject.next(data);
  }

  async getProfileInfo(carrier_id?: string) {
    (await this.webService.apiRest(carrier_id ? JSON.stringify({ carrier_id }) :  "", "carriers/select_attributes")).subscribe(
      (res) => {
        console.log("select attributes : ", res.result);
        this.profileInfo = res.result;
        this.updateDataSelection(this.profileInfo);
      },
      (err) => {}
    );
  }

  async getProfilePic(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      (await this.webService.apiRest("", "profile/get_picture")).subscribe(
        async ({ result }) => {
          if (result?.url) {
            localStorage.setItem("profilePicture", result.url);
            localStorage.setItem("profileId", result._id);
            localStorage.setItem("profileName", result.name);

            this.profilePicSubject.next(result.url);
            console.log("Profile pic: ", result.url);
            resolve(result.url);
          } else {
            localStorage.setItem("profilePicture", '');
            this.profilePicSubject.next('');
            resolve('');
          }
        },
        (error) => {
          console.error("Error loading profile pic : ", error.message);
          reject(error.message);
        }
      );
    });
  }
}
