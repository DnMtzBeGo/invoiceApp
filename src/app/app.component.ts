import { Component } from '@angular/core';
import { ProfileInfoService } from './pages/profile/services/profile-info.service';
import { LanguageService } from './shared/services/language.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AlertService } from './shared/services/alert.service';
import * as AOS from 'aos';
import { uiComponentsConfig } from '@begomx/ui-components';
import { Router } from '@angular/router';

interface IncompatibleBrowserVersion {
  /**
   * The name of the navigator that is not compatible
   */
  navigator: String;
  /**
   * Min browser version accepted
   */
  minVersion?: number;
  /**
   * Max browser version accepted
   */
  maxVersion?: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'carriersDashboard';

  public alert$: Observable<any>;

  showSmallResolutionModal: boolean = false;
  incompatibleBrowsers: IncompatibleBrowserVersion[] = [
    {
      navigator: 'msie',
      minVersion: 11
    }
  ];
  showIncompatibleBrowserModal: boolean = false;

  minWidthResolution = 1024;

  constructor(
    private languageService: LanguageService, 
    private alertService: AlertService,
    profileInfoService: ProfileInfoService,
    public router: Router) {
    this.alert$ = this.alertService.alert$;

    languageService.setInitialLanguage();
    profileInfoService.getProfilePic();

    this.showSmallResolutionModal = window.innerWidth < this.minWidthResolution;
    window.addEventListener('resize', () => {
      this.showSmallResolutionModal = window.innerWidth < this.minWidthResolution;
    });

    // var ua=navigator.userAgent,tem;
    const webBrowserInfo = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    const browser = webBrowserInfo[1];
    const browserVersion = parseInt(webBrowserInfo[2]);

    this.incompatibleBrowsers.some((e: IncompatibleBrowserVersion) => {
      //if version not between accepted versions, then show modal
      if (
        e.navigator == browser &&
        (browserVersion < (e.minVersion || browserVersion) || browserVersion > (e.maxVersion || browserVersion))
      ) {
        this.showIncompatibleBrowserModal = true;
      }
      return this.showIncompatibleBrowserModal;
    });

    uiComponentsConfig.config = {
      urlBase: environment.URL_BASE,
      token: localStorage.getItem('token')
    };
  }

  ngOnInit(): void {
    AOS.init({
      duration: 1200
    });

    window.addEventListener('load', AOS.refresh);

    (window as any).placeholder = (img) => (img.src = '/assets/images/invoice/logo-placeholder.png');

    (window as any).blank = (img) => (img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
  }
}
