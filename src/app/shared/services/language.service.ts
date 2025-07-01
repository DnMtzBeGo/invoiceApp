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
  defaultLanguage: string = 'es';

  constructor(private translateService: TranslateService) {}

  async setInitialLanguage() {
    const lang = localStorage.getItem('lang') ?? 
                 this.navigatorLanguague() ?? 
                 this.defaultLanguage;
    
    console.log('Setting language to:', lang);
    await this.changeLanguage(lang);
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

  async changeLanguage(lang: string) {
    localStorage.setItem('lang', lang);
    
    try {
      const translation = await this.translateService.use(lang).toPromise();
      console.log('Translation loaded for:', lang, translation ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.error('Failed to load translation:', error);
    }
    
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
