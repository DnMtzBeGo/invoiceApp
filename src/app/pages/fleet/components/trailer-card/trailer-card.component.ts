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
import { routes } from '../../consts';

@Component({
  selector: 'app-trailer-card',
  templateUrl: './trailer-card.component.html',
  styleUrls: ['./trailer-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TrailerCardComponent implements OnInit, OnChanges, AfterViewInit {
  public routes: typeof routes = routes;

  @Input()
  data: any;

  constructor(private translateService: TranslateService) {}

  ngOnInit() {}

  ngOnChanges() {}

  ngAfterViewInit() {}
}
