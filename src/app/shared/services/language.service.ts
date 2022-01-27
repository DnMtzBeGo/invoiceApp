import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeEnglish from '@angular/common/locales/en';
import localeSpanish from '@angular/common/locales/es';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  defaultLanguage: string = 'en';

  constructor(private translateService: TranslateService) {}

  async setInitialLanguage() {
    this.changeLanguage(
      localStorage.getItem('lang') ??
        this.navigatorLanguague() ??
        this.defaultLanguage
    );
  }

  navigatorLanguague(): string {
    const languageResult = navigator.language;

    let result = languageResult.split('-');
    if (result[0] === 'es' || result[0] === 'en') {
      return result[0];
    } else {
      result.splice(0, 1, 'en');
      return result[0];
    }
  }

  changeLanguage(lang: string) {
    localStorage.setItem('lang', lang);
    this.translateService.use(lang);
    moment.locale(lang);

    switch (lang) {
      case 'en': {
        registerLocaleData(localeEnglish);
        console.log('Locale English');
        break;
      }

      case 'es': {
        registerLocaleData(localeSpanish);
        console.log('Locale Spanish');
        break;
      }
    }
  }
}
