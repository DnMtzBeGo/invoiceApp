import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';

export interface Option {
  id: string;
  name: string;
  selected?: boolean;
  avatar?: string;
}

export interface Column {
  loading: boolean;
  scrolleable: boolean;
  options: Option[];
}

@Component({
  selector: 'app-polygon-filter',
  templateUrl: './polygon-filter.component.html',
  styleUrls: ['./polygon-filter.component.scss']
})
export class PolygonFilter implements OnInit {
  @Output() getCoordinates = new EventEmitter<any>();

  drivers = { loading: false, options: [], scrolleable: true };
  polygons = { loading: false, options: [], scrolleable: true };
  tags = { loading: false, options: [], scrolleable: true };

  activeFilter: boolean = false;
  constructor(private apiRestService: AuthService) {}

  async ngOnInit() {
    await this.getInitData();
  }

  async getInitData() {
    this.drivers.loading = true;
    this.polygons.loading = true;
    this.tags.loading = true;

    (await this.apiRestService.apiRestGet('carriers/get_drivers?page=1', { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result: { result } }) => {
        (result = result.map((driver) => ({ ...driver, avatar: driver.thumbnail, name: driver.nickname }))),
          (this.drivers = { loading: false, options: result, scrolleable: false });
      }
    });

    (await this.apiRestService.apiRestGet('managers_tags', { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result: { result } }) => {
        this.tags = { loading: false, options: result, scrolleable: false };
      }
    });

    (await this.apiRestService.apiRestGet('polygons?page=1&limit=2', { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result: { result } }) => {
        this.polygons = { loading: false, options: result, scrolleable: false };
      }
    });
  }

  loadMoreData(column: string) {
    console.log(`Cargar más datos para ${column}`);
    this[column].loading = true;
  }

  async selectedAction(event: any) {
    const { action, heatmap } = event;

    switch (action) {
      case 'apply':
        if (heatmap) await this.getHeatmap(event);
        else await this.getDispersion(event);
        break;

      case 'cancel':
        this.activeFilter = false;

      default:
        break;
    }
  }

  async getHeatmap(options: any) {
    const queryParams = new URLSearchParams({
      drivers: JSON.stringify(options.drivers.map(({ _id }) => _id)),
      tags: JSON.stringify(options.tags.map(({ _id }) => _id)),
      polygons: JSON.stringify(options.polygons.map(({ _id }) => _id)),
      start_date: options.start_date,
      end_date: options.end_date
    }).toString();
    (
      await this.apiRestService.apiRestGet(`polygons/heatmaps?${queryParams}`, {
        apiVersion: 'v1.1'
      })
    ).subscribe({
      next: ({ result }) => {
        console.log('heatmap: ', result);
        this.getCoordinates.emit({ type: 'heatmap', ...result });
        this.activeFilter = false;
      }
    });
  }

  async getDispersion(options: any) {
    const queryParams = new URLSearchParams({
      drivers: JSON.stringify(options.drivers.map(({ _id }) => _id)),
      tags: JSON.stringify(options.tags.map(({ _id }) => _id)),
      polygons: JSON.stringify(options.polygons.map(({ _id }) => _id)),
      date: options.start_date
    }).toString();

    (
      await this.apiRestService.apiRestGet(`polygons/dispersion?${queryParams}`, {
        apiVersion: 'v1.1'
      })
    ).subscribe({
      next: ({ result }) => {
        console.log('dispersion: ', result);
        this.getCoordinates.emit({ type: 'dispersion', ...result });
        this.activeFilter = false;
      }
    });
  }

  presentShareModal(){}
}
