import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'bego-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  open: boolean = false;
  logo: string = '../assets/images/logo.svg';

  menuIsOpen: boolean = false;

  constructor(public router: Router) {}

  ngOnInit(): void {}

  goTo(route: string) {
    //if current page is home then refresh the page regardless of anything
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/' + route ]);
  }

  terms() {
    if (localStorage.getItem('lang') === 'es') {
      window.open(environment.website_url + 'terminos-condiciones');
    } else {
      window.open(environment.website_url + 'terms-and-conditions');
    }
  }

  async logout() {
    // await this.authService.logout();
    // this.router.navigateByUrl('bego.ai', { replaceUrl: true });
    localStorage.clear();

    window.setTimeout(
      () => (window.location.href = environment.website_url + '?logout'),
      1000
    );
  }

  toggleMenu() {
    this.menuIsOpen = !this.menuIsOpen;

    const appContainer = document.getElementById('container');
    console.log('container : ', appContainer);

    if (this.menuIsOpen) {
      appContainer?.classList.add('open');
    } else {
      appContainer?.classList.remove('open');
    }
  }
}
