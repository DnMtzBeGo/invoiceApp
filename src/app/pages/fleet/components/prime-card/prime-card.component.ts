import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FleetService } from 'src/app/shared/services/fleet.service';
import { routes } from '../../consts';

@Component({
  selector: 'app-prime-card',
  templateUrl: './prime-card.component.html',
  styleUrls: ['./prime-card.component.scss']
})
export class PrimeCardComponent {
  @Input() data: any;
  @Output() deleted = new EventEmitter();

  routes = routes;
  lang = 'en';

  constructor(private translateService: TranslateService, private fleetService: FleetService) {
    this.lang = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe(({ lang }) => {
      this.lang = lang;
    });
  }

  ngOnInit() {}

  delete() {
    const id = this.data._id;
    this.fleetService.delete(['prime', null, id]).subscribe(() => this.deleted.emit(id));
  }
}
