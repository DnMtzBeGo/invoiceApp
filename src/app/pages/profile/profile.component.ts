import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BegoAlertHandler } from 'src/app/shared/components/bego-alert/BegoAlertHandlerInterface';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfileInfoService } from './services/profile-info.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public id?: string;
  public profileImg?: string;
  public noProfilePic: boolean = false;
  profileInfo!: any;
  ordersCount?: number;
  showCamera: boolean = false;
  stream: any;
  showUploadFileMenu: boolean = false;
  selectePicBiggerThan5MB: boolean = false;

  public showDeleteProfilePicModal: boolean = false;

  public orderTabs: any = [];
  public currentTabIndex: number = 0;
  public currentTabKey: string = 'account';

  public deleteProfilepicHandlers: BegoAlertHandler[] = [];

  Object = Object;
  @ViewChild('profilePicInput') profilePicInput!: ElementRef;
  @ViewChild('video') videoTag!: ElementRef;
  @ViewChild('canvas') pictureCanvas!: ElementRef;

  constructor(
    private webService: AuthService,
    private profileInfoService: ProfileInfoService,
    public translateService: TranslateService,
    private router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id') || null;

    this.orderTabs = {
      account: {
        text: 'profile.account.account',
        url: '/profile/personal-info',
        key: 'account',
        enabled: true,
        sidebar: true,
        whenActive: (): any => {
          this.profileInfoService.getProfileInfo(this.id);
        }
      },
      satCertificate: {
        text: 'sat-certification.order_tab_label',
        url: '/profile/sat-certificate',
        key: 'satCertificate',
        enabled: this.id == void 0,
        sidebar: true,
      },
      documentation: {
        text: 'fiscal-documents.upload-files.documentation',
        url: '/profile/fiscal-documents',
        key: 'documentation',
        enabled: true,
        sidebar: true,
      },
      history: {
        text: 'profile.history.txt_history',
        url: '/profile/history',
        key: 'history',
        enabled: this.id != void 0,
        sidebar: false,
      }
    };

    this.deleteProfilepicHandlers = [
      {
        text: this.translateService.instant('profile.account.cancel-deletion-btn'),
        action: () => {
          this.showDeleteProfilePicModal = false;
        }
      },
      {
        text: this.translateService.instant('profile.account.delete-profile-pic-btn'),
        color: '#FFE000',
        action: async () => {
          await this.removeProfilePic();
          this.showDeleteProfilePicModal = false;
        }
      }
    ];

    Object.values(this.orderTabs).find((e: any, index: number) => {
      if (this.router.url.startsWith(e.url)) {
        this.currentTabIndex = index;
        this.currentTabKey = Object.keys(this.orderTabs)[index];
        return true;
      }
      return false;
    });

    // this.profileInfoService.getProfileInfo(this.id);

    // this.profileInfoService.profilePicUrl.subscribe((profilePicUrl: string) => {
    //   this.profileImg = profilePicUrl;
    // });

    this.profileInfoService.data.subscribe((profileInfo: any) => {
      //console.log(profileInfo);
      this.profileInfo = profileInfo;
      this.profileImg = profileInfo?.thumbnail;
      this.noProfilePic = !profileInfo?.thumbnail;
    });

    this.getOrderCount(this.id);
    this.profileInfoService.getProfileInfo(this.id);
  }

  refreshProfilePic() {
    return this.profileInfoService.getProfilePic().then((profilePicUrl: string) => {
      console.log('New profile pic: ', profilePicUrl)
      this.profileImg = profilePicUrl;
      this.noProfilePic = false;
    });
  }

  async getOrderCount(carrier_id) {
    if (carrier_id == void 0) {
      (await this.webService.apiRest("", 'orders/get')).subscribe(
        async (res) => {
          this.ordersCount = res.result.length;
        },
        async (err) => {
          this.ordersCount = 0;
        }
      );
    }
    else {
      (await this.webService.apiRest(JSON.stringify({ carrier_id }), 'orders/total_orders')).subscribe(
        async (res) => {
          this.ordersCount = res.result.total;
        },
        async (err) => {
          this.ordersCount = 0;
        }
      );
    }
  }

  selectTab(index: number): void {
    this.currentTabIndex = index;
    const currentTabKey = this.currentTabKey = Object.keys(this.orderTabs)[index];
    const currentTab = this.orderTabs[currentTabKey];
    if (currentTab && currentTab.whenActive) {
      currentTab.whenActive();
    }
  }

  profilePicError() {
    this.profileImg = '/assets/images/user-outline.svg';
    this.noProfilePic = true;
  }

  async getBase64(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          console.log('Reader result: ', reader.result);
          resolve(reader.result);
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Count the size of file in utf-6
   * @param s The file in base64
   * @returns the size in bytes of the file
   */
  byteCount(s: string): number {
    return encodeURI(s).split(/%..|./).length - 1;
  }

  async uploadProfilePic(newProfilePic: any) {
    //if image size greater than 5mb
    //MUST CHANGE TO 5 MG
    if (this.byteCount(newProfilePic) > 2000000) {
      this.selectePicBiggerThan5MB = true;
      setTimeout(() => {
        this.selectePicBiggerThan5MB = false;
      }, 5000);

      return;
    }
    const formData = new FormData();
    formData.append('picture', newProfilePic);

    (await this.webService.uploadFilesSerivce(formData, 'profile/change_picture')).subscribe(
      () => {
        this.refreshProfilePic();
      },
      (error) => {
        console.error('Error uploading profile picture', error.message);
      }
    );
  }

  async uploadProfilepicFromComputer() {
    const { files } = this.profilePicInput.nativeElement;
    const newProfilePicFile = files[0];

    console.log('New file: ', newProfilePicFile);

    const newProfilePic = await this.getBase64(newProfilePicFile);

    this.uploadProfilePic(newProfilePic);
  }

  async removeProfilePic() {
    (await this.webService.apiRest('', 'profile/remove_picture')).subscribe(
      (res) => {
        console.log('Profile pic was removed  successfully', res);
        // this.profileInfoService.getProfileInfo(this.id);
        this.refreshProfilePic();
      },
      (err) => {
        console.log('remove profile pic error: ', err);
      }
    );
  }

  async showTakePicOverlay() {
    this.showCamera = true;
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    this.videoTag.nativeElement.srcObject = this.stream;
  }

  takePic() {
    console.log('Taking pic here');
    const canvas = this.pictureCanvas.nativeElement;
    const video = this.videoTag.nativeElement;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const pictureDataUrl = canvas.toDataURL('image/jpeg');

    this.uploadProfilePic(pictureDataUrl).then(() => {
      this.closePicShoot();
    });
  }

  closePicShoot() {
    this.showCamera = false;
    this.refreshProfilePic();
    this.stream.getTracks().forEach((track: any) => {
      track.stop();
    });
  }
}
