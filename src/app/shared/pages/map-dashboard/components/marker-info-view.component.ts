import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateTime } from 'luxon';

import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

@Component({
  selector: 'app-marker-info-window',
  templateUrl: './marker-info-view.component.html',
  styleUrls: ['../map-dashboard.component.scss'],
})
export class MarkerInfoWindowComponent implements OnInit {
  @Input() public memberId: string;
  public username: string;
  public email: string;
  public lastDate: string;
  public location: string;
  public loading: boolean = false;
  public speed: number;
  public battery = { width: '', color: '', percentage: 0 };
  public fleetName: string;

  @Output() public errorLoadData = new EventEmitter<void>();

  constructor(public apiRestService: AuthService, private notificationsService: NotificationsService) {}

  public ngOnInit(): void {
    this.getMemberData();
  }

  private async getMemberData() {
    this.loading = true;

    (await this.apiRestService.apiRestGet(`carriers/information?user_id=${this.memberId}`)).subscribe({
      next: ({ result }) => {
        let { raw_nickname, email, location_updated_at, location, speed_kms_ph, device_battery, original_fleet } =
          result;
        this.username = raw_nickname;
        this.email = email;
        this.location = location;
        this.speed = speed_kms_ph;
        this.fleetName = original_fleet.name;

        if (location_updated_at) {
          const date = DateTime.fromMillis(location_updated_at);
          location_updated_at = date.toFormat('dd/MM/yyyy HH:mm:ss');
        }

        this.calculateBatteryWidth(device_battery);

        this.lastDate = location_updated_at;
        this.loading = false;
      },
      error: (err) => {
        this.notificationsService.showErrorToastr('There was an error, try again later');
        console.error(err);
        this.loading = false;
        this.errorLoadData.emit();
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private calculateBatteryWidth(percentage: number) {
    if (percentage === -1) return;

    percentage = Math.round(percentage * 100);

    let width: string;
    let color: string;

    color = percentage <= 20 ? '#EA2929' : '#7AFF59';
    width = percentage + '%';

    this.battery = { width, color, percentage };
  }
}
