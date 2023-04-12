import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { NotificationsBarService } from 'src/app/services/notifications-bar.service';
import { ProfileInfoService } from 'src/app/pages/profile/services/profile-info.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import moment from 'moment';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router } from '@angular/router';
type CustomNotification = {
  _id: string;
  title: string;
  body: string;
  image?: string;
  opened?: boolean;
  hidden?: boolean;
  date_created?: number;
};
@Component({
  selector: 'app-notification-bar',
  templateUrl: './notification-bar.component.html',
  styleUrls: ['./notification-bar.component.scss']
})
export class NotificationBarComponent implements OnInit {
  constructor(
    private auth: AuthService,
    public notificationsBarService: NotificationsBarService,
    private profileInfoService: ProfileInfoService,
    private alertService: AlertService,
    private router: Router
  ) {}

  isVisible: string = this.notificationsBarService.isVisible ? '' : 'hide';
  socket: any = null;
  profilePic: string = '';
  profileName: string = '';
  now = 0;

  notifications: CustomNotification[] = [];
  counter = 1;

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.getProfilePic();
    this.getUsername();

    this.getPreviousNotifications();

    this.socket = io(`${environment.SOCKET_URI}`, {
      reconnectionDelayMax: 1000,
      auth: {
        token
      }
    });

    this.socket.on(`notifications:carriers:${localStorage.getItem('profileId')}`, (data) => {
      const n: CustomNotification = data;
      n.image = 'ico_package.png';
      n.opened = false;
      console.log(n);
      this.addNewNotification(n);
    });

    this.updateTimeElapsed();
  }

  getUsername() {
    this.profileName = localStorage.getItem('profileName');
  }
  getProfilePic() {
    this.profilePic = localStorage.getItem('profilePicture');
    this.profileInfoService.profilePicUrl.subscribe((profilePicUrl: string) => {
      this.profilePic = profilePicUrl;
    });
  }

  profilePicError() {
    this.profilePic = '../../../../assets/images/user-outline.svg';
  }

  addNewNotification(notification: CustomNotification) {
    this.notifications.unshift(notification);
    this.notificationsBarService.toggleNewNotifications(true);
    this.notificationsBarService.setRingBell();
  }

  toggleBar() {
    this.notificationsBarService.toggleBar();
    this.notificationsBarService.toggleNewNotifications(false);
  }

  toggleNotification(index: number) {
    this.notifications[index].opened = !this.notifications[index].opened;
  }

  async hideNotification(index: number) {
    const { _id } = this.notifications[index];
    (await this.auth.apiRest('', `notifications/hide/${_id}`)).subscribe(async (res) => {
      console.log('hide', res);
      this.notifications.splice(index, 1);
    });
  }

  async getPreviousNotifications() {
    const request = {
      pagination: {
        date_sort: 1
      }
    };

    (await this.auth.apiRest(JSON.stringify(request), 'notifications/get_all')).subscribe(async (res) => {
      if (res.result.length > 0) {
        res.result.forEach((n: CustomNotification) => {
          n.image = 'ico_package.png';
          n.opened = false;
          this.notifications.unshift(n);
        });
      }
    });
  }

  getTimeElapsed(date_created: number, now: any) {
    now = moment(now);
    return 'Hace ' + moment.duration(now.diff(date_created)).humanize();
  }

  private updateTimeElapsed() {
    this.now = Date.now();
    setTimeout(() => {
      this.updateTimeElapsed();
    }, 1000);
  }

  private async hideAll() {
    console.log('ocultando todas');
    (await this.auth.apiRest('', 'notifications/hide_all')).subscribe(async (res) => {
      console.log(res);
      this.notifications = [];
    });
  }

  openDialog(): void {
    this.alertService.create({
      body: '¿Quiere ocultar todas las notificaciones?',
      handlers: [
        {
          text: 'No',
          color: '#FFE000',
          action: async () => {
            this.alertService.close();
          }
        },
        {
          text: 'Si',
          color: '#FFE000',
          action: async () => {
            this.hideAll();
            this.alertService.close();
          }
        }
      ]
    });
  }

  goToProfile() {
    this.router.navigate(['/', 'profile']);
  }
}
