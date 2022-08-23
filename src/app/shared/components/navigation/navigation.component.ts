import { Component, Renderer2, OnInit, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { HeaderService } from "src/app/pages/home/services/header.service";
import { ProfileInfoService } from "src/app/pages/profile/services/profile-info.service";
import { LanguageService } from "src/app/shared/services/language.service";
import { NotificationsBarService } from "src/app/services/notifications-bar.service";
@Component({
  selector: "bego-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
})
export class NavigationComponent implements OnInit {
  private open: boolean = true;
  public profilePic?: string | null = "";
  public nofitficationsPic?: string | null = "";
  public headerTransparent: boolean = false;
  menuOpened: boolean = false;
  removeDelay: boolean = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    public profileInfoService: ProfileInfoService,
    public translateService: TranslateService,
    public languageService: LanguageService,
    public headerService: HeaderService,
    public notificationsBarService: NotificationsBarService
  ) {}

  ngOnInit(): void {
    this.profilePic = localStorage.getItem("profilePicture");
    this.profileInfoService.profilePicUrl.subscribe((profilePicUrl: string) => {
      this.profilePic = profilePicUrl;
    });

    this.headerService.styleHeader.subscribe((data: boolean) => {
      this.headerTransparent = data;
    });
  }

  toggleMenu() {
    this.menuOpened = this.menuOpened ? false : true;
    if (this.menuOpened) this.renderer.addClass(document.body, "menu-open");
    else this.renderer.removeClass(document.body, "menu-open");

    setTimeout(() => {
      this.removeDelay = this.removeDelay ? false : true;
    }, 550);
  }

  toggleNotificationBar() {
    this.notificationsBarService.toggleBar();
  }

  emittedValue() {
    this.menuOpened = false;
    this.renderer.removeClass(document.body, "menu-open");
  }

  // menu() {
  //   let parent = this.renderer.parentNode(this.el.nativeElement);
  //   console.log(parent)
  //   let menu = this.renderer
  //     .parentNode(parent)
  //     .querySelector('#menu')
  //     .querySelector('.menu');
  //   if (this.open) {
  //     this.renderer.addClass(parent, 'open');
  //     this.renderer.addClass(menu, 'open');
  //     this.open = false;
  //   } else {
  //     this.renderer.removeClass(parent, 'open');
  //     this.renderer.removeClass(menu, 'open');
  //     this.open = true;
  //   }
  // }

  profilePicError() {
    this.profilePic = "../../../../assets/images/user-outline.svg";
  }
}
