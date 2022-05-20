import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-edit-cn-btn',
  templateUrl: './edit-cn-btn.component.html',
  styleUrls: ['./edit-cn-btn.component.scss']
})
export class EditCnBtnComponent implements OnInit {
  @Input() progress: number;
  @Input() orderId: string;

  public showComponent: boolean = false;

  constructor(
    private webService: AuthService,
    // private alertController: AlertController,
    private translateService: TranslateService,
    private router: Router,
    private alertService: AlertService
  ) {}

  @ViewChild('bar') barRef: ElementRef;

  ngOnInit() {}

  ngAfterViewInit() {
    this.updateProgress();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.progress) {
      this.updateProgress();
    }

    if (changes.orderId && this.orderId) {
      const requestFile = JSON.stringify({ orderId: this.orderId });
      this.webService.apiRest(requestFile, 'invoice/get_pdf_xml').then((subscriber) => {
        subscriber.subscribe(({ result }) => {
          //if pdf doesn't exist yet, it means that invoice has not been created
          if (result.pdf.length == 0) {
            this.showComponent = true;
          }
          setTimeout(() => {
            this.updateProgress();
          });
        });
      });
    }
  }

  async editConsignmentNote() {
    const payload = {
      order_id: this.orderId
    };
    (await this.webService.apiRest(JSON.stringify(payload), 'carriers/can_edit_order')).subscribe(async ({ result }) => {
      if (!result.can_edit) {
        const errors = result.errors.join('<br>');
        this.alertService.create({
          title: this.translateService.instant('history.consignment_note.cannot_edit'),
          body: errors,
          handlers: [
            {
              text: this.translateService.instant('Ok'),
              color: '#ffbe00',
              action: async () => {
                this.alertService.close();
              }
            }
          ]
        });

      } else {
        this.router.navigate(['/invoice/new'], {
          state: {
            order_id: this.orderId,
            prevUrl: this.router.url
          }
        });
      }
    });
  }

  updateProgress(): void {
    if (this.barRef) {
      this.barRef.nativeElement.style.transform = 'rotate(' + (45 + this.progress * 1.8) + 'deg)';
    }
  }
}
