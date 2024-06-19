import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { PrimeService } from "../../services/prime.service";
import { BegoSliderDotsOpts } from 'src/app/shared/components/bego-slider-dots/bego-slider-dots.component';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "bego-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent implements OnInit {
  open: boolean = false;
  logo: string = "../assets/images/logo.svg";

  menuIsOpen: boolean = false;

  freeTrialButtonKey: string = 'menu.free-trial-btn';
  freeTrialModalTitleKey: string = 'menu.free-trial-title';
  successfulModalTextKey: string = 'menu.successful-long-text';
  successfulModalShortTextKey: string = 'menu.successful-short-text';

  showPrimeModal: boolean = false;
  showWaitingModal: boolean = false;
  showConfirmModal: boolean = false;
  showSuccessfulModal: boolean = false;
  showErrorModal: boolean = false;

  sliderDotsOpts: BegoSliderDotsOpts = {
    totalElements: 3,
    value: 0,
  };

  slides = [
    { 
      imageUrl: "/assets/images/slider-prime1.png", 
      descriptionKey: "menu.slide1"
    },
    { 
      imageUrl: "/assets/images/slider-prime2.png", 
      descriptionKey: "menu.slide2"
    },
    { 
      imageUrl: "/assets/images/slider-prime3.png", 
      descriptionKey: "menu.slide3"
    }
  ];

  constructor(public router: Router, public primeService: PrimeService, private translateService: TranslateService, private http: HttpClient, private webService: AuthService) {}

  ngOnInit(): void {}

  goTo(route: string) {
    //if current page is home then refresh the page regardless of anything
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["/" + route]);
  }

  terms() {
    if (localStorage.getItem("lang") === "es") {
      window.open(environment.website_url + "terminos-condiciones");
    } else {
      window.open(environment.website_url + "terms-and-conditions");
    }
  }

  async logout() {
    // await this.authService.logout();
    // this.router.navigateByUrl('bego.ai', { replaceUrl: true });
    localStorage.clear();

    window.setTimeout(
      () => (window.location.href = environment.website_url + "?logout"),
      1000
    );
  }

  toggleMenu() {
    this.menuIsOpen = !this.menuIsOpen;

    const appContainer = document.getElementById("container");
    console.log("container : ", appContainer);

    if (this.menuIsOpen) {
      appContainer?.classList.add("open");
    } else {
      appContainer?.classList.remove("open");
    }
  }

  handlePrimeModal(redirectRoute: string) {
    if (this.primeService.isPrime) {
      this.router.navigate([redirectRoute]);
    } else {
      this.checkUserPrimeStatus();
    }
  }  

  async checkUserPrimeStatus() {
    (await this.webService.apiRest('', 'carriers/home')).subscribe(
      (response) => {
        if (response && response.result.prime_requested === true) {
          this.showWaitingModal = true;
        } else {
          if (response && response.result.manager_had_trial === false) {
            // Mostrar la modal de Prime para prueba gratuita
            this.showPrimeModal = true;
          } else {
            // Mostrar la modal de Prime para suscripicion
            this.showPrimeModal = true;
            this.freeTrialButtonKey = 'menu.free-trial-btn-upgraded';
            this.freeTrialModalTitleKey = 'menu.free-trial-title-upgraded';
            this.successfulModalTextKey = 'menu.successful-text-upgraded';
            this.successfulModalShortTextKey = '';
          }
        }
      },
      (error) => {
        console.error("Error fetching manager_had_trial:", error);
      }
    );
  }  

  closeModal(event: string) {
    try {
      if (event === 'cancel') {
        this.showPrimeModal = false;
        this.showConfirmModal = false;
      } else if (event === 'done') {
        this.showWaitingModal = false;
      }
    } catch (error) {
      console.error('Error al manejar el evento:', error);
    }
  }

  getImageUrl(): string {
    return this.slides[this.sliderDotsOpts.value].imageUrl;
  }

  getDescription(): string {
    return this.translateService.instant(this.slides[this.sliderDotsOpts.value].descriptionKey);
  }

  onSlideChange(index: number) {
    this.sliderDotsOpts.value = index;
  }

  handleConfirmModal() {
    this.showConfirmModal = true;
    this.showPrimeModal = false;
  }  

  async confirmSuscription() {
    try {
      (await this.webService.apiRest('', 'carriers/home')).subscribe(
        (response) => {
          if (response && response.result.manager_had_trial === true) {
            this.requestPrime();
          } else {
            this.requestFreeTrial();
          }
        },
        (error) => {
          console.error("Error fetching manager_had_trial:", error);
        },
        () => {
          this.showConfirmModal = false;
        }
      );
    } catch (error) {
      this.showConfirmModal = false;
    }
  }  

  public async requestFreeTrial(): Promise<void> {
    (await this.webService.apiRest('', 'carriers/request_free_trial', {apiVersion: 'v1.1'})).subscribe(
      (response) => {
        this.showSuccessfulModal = true;
      },
      (error) => {
        this.showErrorModal = true;
        console.error('Error al realizar la solicitud de prueba gratuita:', error);
      }
    );
  }  

  public async requestPrime(): Promise<void> {
    (await this.webService.apiRest('', 'carriers/request_prime', {apiVersion: 'v1.1'})).subscribe(
      (response) => {
        this.showSuccessfulModal = true;
      },
      (error) => {
        this.showErrorModal = true;
      }
    );
  }   

  closeLastModal(event: string) {
    try {
      if (event === 'cancel') {
        this.showSuccessfulModal = false;
        this.showErrorModal = false;
      } else if (event === 'done') {
        this.showSuccessfulModal = false;
        this.showErrorModal = false;
      }
    } catch (error) {
      console.error('Error al manejar el evento:', error);
    }
  }

}
