import { Component, OnInit } from "@angular/core";
import { io } from "socket.io-client";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-notification-bar",
  templateUrl: "./notification-bar.component.html",
  styleUrls: ["./notification-bar.component.scss"],
})
export class NotificationBarComponent implements OnInit {
  constructor() {}

  isVisible: string = "";
  socket = null;
  notifications = [];
  counter = 1;

  ngOnInit(): void {
    const token = localStorage.getItem("token");

    this.socket = io(`${environment.SOCKET_URI}`, {
      reconnectionDelayMax: 1000,
      auth: {
        token,
      },
    });
    this.socket.on(
      "notifications:carriers:61e050d21893960040fab605",
      (data) => {
        data.image = "ico_package.png";
        this.addNewNotification(data);
      }
    );
  }

  addNewNotification(notification) {
    console.log("nuevo notificacion", notification);
    this.notifications.unshift(notification);
  }

  toggleBar() {
    console.log("toggle");
    this.isVisible = this.isVisible == "hide" ? "" : "hide";
  }
}
