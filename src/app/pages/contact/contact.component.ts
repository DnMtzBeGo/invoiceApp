import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';
import { HttpClient } from '@angular/common/http';
import { AlertService } from 'src/app/shared/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  mapOptions: AnimationOptions = {
    path: '/assets/lottie/animated-map.json'
  };

  name: string = '';
  telephone: string = '';
  email: string = '';
  type: string = '';
  message: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {}

  mapCreated(animationItem: AnimationItem): void {}

  submit() {
    const name = this.name;
    const telephone = this.telephone;
    const email = this.email;
    const type = this.type;
    const message = this.message;

    if (
      name != '' &&
      telephone != '' &&
      email != '' &&
      type != '' &&
      message != ''
    ) {
      this.http
        .post<any>('https://bego-prod.herokuapp.com/landing/register', {
          name,
          telephone,
          email,
          type,
          message
        })
        .subscribe((data) => {
          this.alertService.create({
            body: this.translateService.instant('alerts.contact.success-email'),
            handlers: [
              {
                text: 'ok',
                color: '#FFE000',
                action: async () => {
                  this.alertService.close();
                  this.router.navigate(['/home']);
                }
              }
            ]
          });
        });
    } else {
      this.alertService.create({
        body: this.translateService.instant('alerts.contact.fields-required'),
        handlers: [
          {
            text: 'ok',
            color: '#FFE000',
            action: async () => {
              this.alertService.close();
            }
          }
        ]
      });
    }
  }
}
