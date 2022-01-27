import { Observable, from, interval, of, merge } from 'rxjs'
import { mergeAll, mergeMap, map, switchMap } from 'rxjs/operators'
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  faqs$ = merge(
    of({ lang: this.translateService.currentLang }),
    this.translateService.onLangChange,
  )
    .pipe(
      switchMap(({ lang }) => {
        return this.auth.apiRest(JSON.stringify({ language: lang }), 'faq/shippers/get_questions')
      }),
      mergeAll(),
      map(res => {
        const allQuestions = res
          .result
          .flatMap(({ type, questions }: any) =>
            questions.map((question: any) => ({ ...question, type }))
          )

        return {
          [this.translateService.instant('faqs.general questions')]: {
            label: this.translateService.instant('faqs.you will find answers'),
            questions: allQuestions.filter(({ type }: any) => type === 'general'),
          },
          [this.translateService.instant('faqs.more questions')]: {
            label: this.translateService.instant('faqs.about the order process'),
            questions: allQuestions.filter(({ type }: any) => type === 'other'),
          },
        }
      }),
    )

  constructor(
    private auth: AuthService,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
  }
}
