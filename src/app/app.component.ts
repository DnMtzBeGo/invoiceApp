import { Component } from '@angular/core';
import { ProfileInfoService } from './pages/profile/services/profile-info.service';
import { LanguageService } from './shared/services/language.service';
import { environment } from 'src/environments/environment';
import { Observable, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertService } from './shared/services/alert.service';
import * as AOS from 'aos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'carriersDashboard';

  alert$: Observable<any> = this.alertService.alert$;

  constructor(
    private languageService: LanguageService,
    private alertService: AlertService,
    profileInfoService: ProfileInfoService
  ) {
    languageService.setInitialLanguage();
    profileInfoService.getProfilePic();
  }

  ngOnInit(): void {
    AOS.init({
      duration: 1200
    });

    window.addEventListener('load', AOS.refresh);
  }
}
