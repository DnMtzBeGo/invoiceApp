import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnimationOptions } from 'ngx-lottie';


@Component({
  selector: 'app-small-resolution-modal',
  templateUrl: './small-resolution-modal.component.html',
  styleUrls: ['./small-resolution-modal.component.scss']
})
export class SmallResolutionModalComponent implements OnInit {

  public lottieOptions: AnimationOptions = {
    path: '../../../../assets/lottie/wifi.json',
  };

  currentLang: string = 'en';
  langListener;

  constructor(
    translateService: TranslateService,
  ) {
    this.langListener = translateService.onLangChange.subscribe((lang: any)=>{
      this.currentLang = lang.lang;
    })
   }

  ngOnInit(): void {
  }

  /**
   * Opens in a new tab the app store language
   */
  downloadAppleApp(): void{
    const lang = localStorage.getItem('lang') || 'en';
    let urlLang: string;
    if(lang == 'es')
      urlLang= 'us';
    else
      urlLang= 'mx';

    window.open(`https://apps.apple.com/${urlLang}/app/bego-tu-transporte-de-carga/id1530859160`);

  }

  /**
   * Opens in a new tab the play store language
   */
  downloadAndroidApp():void{
    const lang = localStorage.getItem('lang') || 'en';
    let urlLang: string;
    if(lang == 'es')
      urlLang= 'es_MX';
    else
      urlLang= 'en_US';

    window.open(`https://play.google.com/store/apps/details?id=com.begomx.bego&hl=${urlLang}`);
  }

  ngOnDestroy(): void{
    this.langListener.unsubscribe();
  }

}
