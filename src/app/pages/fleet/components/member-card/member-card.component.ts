import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  AfterViewInit,
  Output,
  EventEmitter,
  ViewEncapsulation,
  SimpleChanges
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FleetService } from 'src/app/shared/services/fleet.service';
import { routes } from '../../consts';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MemberCardComponent implements OnInit, OnChanges, AfterViewInit {
  public routes: typeof routes = routes;

  @Input()
  data: any;

  @Output()
  deleted = new EventEmitter<string>();

  constructor(private translateService: TranslateService, public fleetService: FleetService) {}

  ngOnInit() {}

  ngOnChanges() {}

  ngAfterViewInit() {}

  delete() {
    this.fleetService
      .delete(['members', this.data.fleet_id, this.data.member_meta.id_member])
      .subscribe(() => this.deleted.emit(this.data.member_meta.id_member));
  }
}
