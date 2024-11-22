import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';

import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-select-fleet-modal',
  templateUrl: './select-fleet-modal.component.html',
  styleUrls: ['./select-fleet-modal.component.scss'],
})
export class SelectFleetModalComponent {
  public drivers: Array<object> = [];
  public vehicle: Array<object> = [];
  public trucks: Array<object>[];
  public trailers: Array<object> = [];

  //TODO: Must be updated to turn to true if info comes from driver
  public walkingData: boolean = false;

  //TODO: this won't work for things other than FTL
  public orderType = 'FTL';

  //TODO:  Fill this info properly given the order info
  public userWantCP: boolean = false;

  public selectMembersToAssign: any = {};

  public enableBtn: boolean = false;

  public lang = 'en';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private authService: AuthService,
    private alertservice: AlertService,
    private translateService: TranslateService,
  ) {
    this.getFleet(data).then((fleet) => {
      this.drivers = fleet.drivers;
      this.trucks = fleet.trucks;
      //TODO: allow fcl drafts;
      this.vehicle = [];
      this.trailers = fleet.trailers;
    });

    this.lang = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((ev) => (this.lang = ev.lang));
  }

  public async getFleet(data: any) {
    const payload = {
      fromDate: data.start_date,
      toDate: data.end_date,
    };
    return (await this.authService.apiRest(JSON.stringify(payload), '/orders/calendar', { apiVersion: 'v1.1' }))
      .toPromise()
      .then((e) => e.result);
  }

  public showAlert(message: string) {
    this.alertservice.create({
      body: message,
      handlers: [
        {
          text: 'Ok',
          color: '#FFE000',
          action: async () => {
            this.alertservice.close();
          },
        },
      ],
    });
  }

  public selectMembersForOrder(member: any, typeMember: keyof this) {
    if (this.userWantCP && !member.can_stamp) {
      return this.showAlert(this.translateService.instant(`home.alerts.cant-cp-${String(typeMember)}`));
    }

    if (!member.availability)
      this.showAlert(this.translateService.instant(`home.alerts.not-available-${String(typeMember)}`));

    if (this.selectMembersToAssign[typeMember]) {
      this.selectMembersToAssign[typeMember].isSelected = false;
    }

    member['isSelected'] = true;
    this.selectMembersToAssign[typeMember] = member;

    if (Object.keys(this.selectMembersToAssign).length === 3) {
      this.enableBtn = true;
    }
  }
}
