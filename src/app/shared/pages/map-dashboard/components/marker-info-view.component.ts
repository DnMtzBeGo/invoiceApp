import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateTime } from 'luxon';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

@Component({
  selector: 'app-marker-info-window',
  templateUrl: './marker-info-view.component.html',
  styleUrls: ['../map-dashboard.component.scss']
})
export class MarkerInfoWindowComponent implements OnInit {
  @Input() memberId: string;
  username: string;
  email: string;
  lastDate: string;
  location: string;
  loading: boolean = false;
  @Output() errorLoadData = new EventEmitter<void>();

  constructor(public apiRestService: AuthService, private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.getMemberData();
  }

  async getMemberData() {
    this.loading = true;

    (await this.apiRestService.apiRestGet(`carriers/information?user_id=${this.memberId}`)).subscribe({
      next: ({ result }) => {
        let { raw_nickname, email, location_updated_at, location } = result;

        this.username = raw_nickname;
        this.email = email;
        this.location = location;

        if (location_updated_at) {
          const date = DateTime.fromMillis(location_updated_at);
          location_updated_at = date.toFormat('dd/MM/yyyy HH:mm:ss');
        }

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
      }
    });
  }
}
