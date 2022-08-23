import { Component, OnInit } from "@angular/core";
import { io } from "socket.io-client";
import { environment } from "src/environments/environment";
import { NotificationsBarService } from "src/app/services/notifications-bar.service";
import { ProfileInfoService } from "src/app/pages/profile/services/profile-info.service";
@Component({
  selector: "app-notification-bar",
  templateUrl: "./notification-bar.component.html",
  styleUrls: ["./notification-bar.component.scss"],
})
export class NotificationBarComponent implements OnInit {
  constructor(
    public notificationsBarService: NotificationsBarService,
    private profileInfoService: ProfileInfoService
  ) {}

  isVisible: string = this.notificationsBarService.isVisible ? "" : "hide";
  socket: any = null;
  profilePic: string = "";
  profileName: string = "";

  notifications = [
    {
      title: "mi notificacion",
      body: "contenido de la notificacion y mas contenido para poder probar una notificacion grande.",
      image: "ico_package.png",
      opened: false,
    },
    {
      title: "mi notificacion",
      body: "contenido de la notificacion y mas contenido para poder probar una notificacion grande.",
      image: "ico_package.png",
      opened: false,
    },
    {
      title: "mi notificacion",
      body: "contenido de la notificacion y mas contenido para poder probar una notificacion grande.",
      image: "ico_package.png",
      opened: false,
    },
  ];
  counter = 1;

  ngOnInit(): void {
    const token = localStorage.getItem("token");
    this.getProfilePic();
    this.getUsername();

    this.socket = io(`${environment.SOCKET_URI}`, {
      reconnectionDelayMax: 1000,
      auth: {
        token,
      },
    });
    this.socket.on(
      `notifications:carriers:${localStorage.getItem("profileId")}`,
      (data) => {
        data.image = "ico_package.png";
        data.opened = false;
        this.addNewNotification(data);
      }
    );
  }

  getUsername() {
    this.profileName = localStorage.getItem("profileName");
  }
  getProfilePic() {
    this.profilePic = localStorage.getItem("profilePicture");
    this.profileInfoService.profilePicUrl.subscribe((profilePicUrl: string) => {
      this.profilePic = profilePicUrl;
    });
  }

  profilePicError() {
    this.profilePic = "../../../../assets/images/user-outline.svg";
  }

  addNewNotification(notification) {
    this.notifications.unshift(notification);
    this.notificationsBarService.toggleNewNotifications(true);

    console.log(JSON.stringify(this.notifications));
  }

  toggleBar() {
    this.notificationsBarService.toggleBar();
    this.notificationsBarService.toggleNewNotifications(false);
  }

  toggleNotification(index: number) {
    this.notifications[index].opened = !this.notifications[index].opened;
  }
}
