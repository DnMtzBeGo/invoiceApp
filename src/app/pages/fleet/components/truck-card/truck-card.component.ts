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
  selector: 'app-truck-card',
  templateUrl: './truck-card.component.html',
  styleUrls: ['./truck-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TruckCardComponent implements OnInit, OnChanges, AfterViewInit {
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
    this.fleetService.delete(['trucks', this.data.id_fleet, this.data._id]).subscribe(() => this.deleted.emit(this.data._id));
  }
}
