import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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

  public profileImg?: string ;
  public noProfilePic: boolean = false;
  profileInfo!: any;
  ordersCount?: number;
  showCamera: boolean = false;
  stream: any;
  showUploadFileMenu: boolean = false;
  selectePicBiggerThan5MB: boolean = false;

  public showDeleteProfilePicModal: boolean= false;

  public orderTabs: any = [];
  public currentTabIndex: number = 0;

  public deleteProfilepicHandlers: BegoAlertHandler[] = []


  Object = Object;
  @ViewChild('profilePicInput') profilePicInput!: ElementRef;
  @ViewChild('video') videoTag!: ElementRef;
  @ViewChild('canvas') pictureCanvas!: ElementRef;

  constructor(
    private webService: AuthService,
    private profileInfoService: ProfileInfoService,
    public translateService: TranslateService,
    private router: Router,
  ) { 

    this.orderTabs  = {
      account : {
        text: 'profile.account.account',
        url: '/profile/personal-info',
        key: 'account',
        whenActive: (): any => {
          this.profileInfoService.getProfileInfo();
        }
      },
      satCertificate: {
        text: 'sat-certification.order_tab_label',
        url: '/profile/sat-certificate',
        key: 'satCertificate',
      },
      documentation: {
        text: 'fiscal-documents.upload-files.documentation',
        url: '/profile/fiscal-documents',
        key: 'documentation',
      },
    }

    this.deleteProfilepicHandlers = [
      {
        text : this.translateService.instant('profile.account.cancel-deletion-btn'),
        action: ()=> {
          this.showDeleteProfilePicModal = false;
        }
          
      },
      {
        text : this.translateService.instant('profile.account.delete-profile-pic-btn'),
        color: '#ffbe00',
        action: async ()=> {
          await this.removeProfilePic();
          this.showDeleteProfilePicModal = false;
        }
          
      },

    ]
  }

  ngOnInit(): void {

    Object.values(this.orderTabs).find((e: any, index: number)=>{
      if(e.url == this.router.url){
        this.currentTabIndex = index;
        return true;
      }
      return false;
    });

    this.profileInfoService.getProfileInfo();
    this.refreshProfilePic();
    this.profileInfoService.profilePicUrl.subscribe((profilePicUrl: string) => {
      this.profileImg = profilePicUrl;
    })


    this.profileInfoService.data.subscribe(
      ( profileInfo: any) => {
        this.profileInfo = profileInfo;
      });
    this.getOrderCount();
  } 

  refreshProfilePic(){
    this.profileInfoService.getProfilePic().then(
      ( profilePicUrl: string )=>{ 
        console.log('New profile pic: ', profilePicUrl)
        this.profileImg = profilePicUrl
        this.noProfilePic = false;
      }
    );
  }


  async getOrderCount() {
    (await this.webService.apiRest('', 'orders/get')).subscribe(
      async (res) => {
        this.ordersCount = res.result.length;
      },
      async (err) => {
        this.ordersCount = 0;
      }
    );
  }

  selectTab( index: number):void{
    this.currentTabIndex = index;
    const currentTabKey = Object.keys(this.orderTabs)[index];
    const currentTab = this.orderTabs[currentTabKey];
    if(currentTab && currentTab.whenActive){
      currentTab.whenActive();
    }
  }

  profilePicError(){
    this.profileImg = '/assets/images/user-outline.svg';
    this.noProfilePic = true;
  }

  async getBase64(file: File ): Promise<any> {
    return new Promise( (resolve, reject) => {
      try{
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload =  () =>  {
          console.log('Reader result: ', reader.result);
          resolve(reader.result);
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      }catch( err){
        reject(err);
      }
    })

 }

 /**
  * Count the size of file in utf-6
  * @param s The file in base64
  * @returns the size in bytes of the file
  */
 byteCount(s: string): number {
  return encodeURI(s).split(/%..|./).length - 1;
}

 async uploadProfilePic( newProfilePic : any ){
   //if image size greater than 5mb
   //MUST CHANGE TO 5 MG 
   if(this.byteCount(newProfilePic) > 2000000){
    this.selectePicBiggerThan5MB = true;
    setTimeout(()=>{
      this.selectePicBiggerThan5MB = false;
    },5000);
    
    return;
   }
  const formData = new FormData();
  formData.append('picture', newProfilePic);

  (await this.webService.uploadFilesSerivce(formData, 'profile/change_picture')).subscribe(
    (  ) => {
      this.refreshProfilePic();
    },
    ( error )=>{
      console.error('Error uploading profile picture', error.message);
    }
  )

 }

  async uploadProfilepicFromComputer( ){
    const { files } = this.profilePicInput.nativeElement;
    const newProfilePicFile = files[0];

    console.log('New file: ', newProfilePicFile, );

    const newProfilePic = await this.getBase64(newProfilePicFile);

    this.uploadProfilePic(newProfilePic);

  }

  async removeProfilePic(){
    (await this.webService.apiRest('','profile/remove_picture')).subscribe(
      ( res ) => {
        console.log('Profile pic was removed  successfully', res);
        this.profileInfoService.getProfilePic();
      },
      ( err ) => {
        console.log('remove profile pic error: ', err);
      }
    )
  }

  async showTakePicOverlay(){
    this.showCamera = true;
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    this.videoTag.nativeElement.srcObject = this.stream;

  }

  takePic(){
    console.log('Taking pic here');
    const canvas = this.pictureCanvas.nativeElement;
    const video = this.videoTag.nativeElement;
    canvas.getContext('2d').drawImage(video,0, 0, canvas.width, canvas.height);
    const pictureDataUrl = canvas.toDataURL('image/jpeg');

    this.uploadProfilePic(pictureDataUrl).then(()=>{
      this.closePicShoot()
    });
  }

  closePicShoot(){
    this.showCamera = false;
    this.refreshProfilePic();
    this.stream.getTracks().forEach( (track: any) => {
      track.stop();
    });
  }
}
