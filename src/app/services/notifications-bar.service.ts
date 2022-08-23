import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class NotificationsBarService {
  hasNewNotifications: boolean = false;
  isVisible: string = "";

  constructor() {}

  toggleBar() {
    this.isVisible = this.isVisible == "hide" ? "" : "hide";
  }

  toggleNewNotifications(forceTo: boolean = true) {
    if (undefined != forceTo) this.hasNewNotifications = forceTo;
    else this.hasNewNotifications = !this.hasNewNotifications;
  }
}
