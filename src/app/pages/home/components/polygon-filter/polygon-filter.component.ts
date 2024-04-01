import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ShareReportModalComponent } from '../share-report-modal/share-report-modal.component';

interface Option {
  id: string;
  name: string;
  selected?: boolean;
  avatar?: string;
}

interface Column {
  loading: boolean;
  scrolleable: boolean;
  options: Option[];
}

interface ShareData {
  drivers: string[];
  polygons: string[];
  tags: string[];
  start_date?: string;
  end_date?: string;
  date?: string;
  type?: string;
}

@Component({
  selector: 'app-polygon-filter',
  templateUrl: './polygon-filter.component.html',
  styleUrls: ['./polygon-filter.component.scss']
})
export class PolygonFilter implements OnInit {
  @Output() getCoordinates = new EventEmitter<any>();
  @Output() clearedFilter = new EventEmitter<any>();

  activeFilter: boolean = false;
  heatmap: boolean = false;

  drivers = {
    loading: false,
    options: [],
    scrolleable: true
  };
  polygons = {
    loading: false,
    options: [],
    scrolleable: true
  };
  tags = {
    loading: false,
    options: [],
    scrolleable: true
  };

  options: ShareData = {
    drivers: [],
    tags: [],
    polygons: [],
    start_date: null,
    end_date: null,
    date: null
  };

  pages = {
    drivers: { actual: 0, total: 0 },
    polygons: { actual: 0, total: 0 },
    tags: { actual: 0, total: 0 }
  };

  activeDrivers: boolean = false;

  constructor(private apiRestService: AuthService, private matDialog: MatDialog) {}

  async ngOnInit() {
    this.drivers.loading = true;
    this.polygons.loading = true;
    this.tags.loading = true;

    await this.getDrivers();
    await this.getPolygons();
    await this.getTags();
  }

  async getDrivers(page: number = 1) {
    (await this.apiRestService.apiRestGet(`carriers/get_drivers?page=${page}&limit=10`, { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result: { result } }) => {
        result = result.map((driver) => ({ ...driver, avatar: driver.thumbnail, name: driver.nickname }));
        this.drivers = { loading: false, options: result, scrolleable: false };
      }
    });
  }

  async getTags(page: number = 1) {
    (await this.apiRestService.apiRestGet(`managers_tags?page=${page}&limit=10`, { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result: { result } }) => {
        this.tags = { loading: false, options: result, scrolleable: false };
      }
    });
  }

  async getPolygons(page: number = 1) {
    if (this.pages.polygons.total === page) return;
    (await this.apiRestService.apiRestGet(`polygons?page=${page}&limit=10`, { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result: { result, pages } }) => {
        if (page === 1) this.pages.polygons = pages;
        this.polygons = { loading: false, options: result, scrolleable: false };
      }
    });
  }

  loadMoreData(column: string) {
    console.log(`Cargar más datos para ${column}`);
    this[column].loading = true;
    if (column === 'polygon') this.getPolygons();
  }

  async selectedAction(event: any) {
    const { action, heatmap } = event;

    switch (action) {
      case 'apply':
        this.heatmap = heatmap;
        if (heatmap) await this.getHeatmap(event);
        else await this.getDispersion(event);
        break;

      case 'cancel':
        this.activeFilter = false;
        break;

      case 'clear':
        this.options = {
          drivers: [],
          tags: [],
          polygons: [],
          start_date: null,
          end_date: null,
          date: null
        };
        this.activeDrivers = false;

        this.clearedFilter.emit();
        break;

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
        this.saveOptions(options, 'heatmap');
        this.getCoordinates.emit({ type: 'heatmap', ...result });
        this.activeFilter = false;
      }
    });
  }

  async getDispersion(options: any) {
    // console.log('options: ', options);
    const queryParams = new URLSearchParams({
      drivers: JSON.stringify(options.drivers.map(({ _id }) => _id)),
      tags: JSON.stringify(options.tags.map(({ _id }) => _id)),
      polygons: JSON.stringify(options.polygons.map(({ _id }) => _id)),
      date: options.start_date,
      include_older_locations: JSON.stringify(this.activeDrivers)
    }).toString();

    (
      await this.apiRestService.apiRestGet(`polygons/dispersion?${queryParams}`, {
        apiVersion: 'v1.1'
      })
    ).subscribe({
      next: ({ result }) => {
        this.saveOptions(options, 'dispersion');
        this.getCoordinates.emit({ type: 'dispersion', ...result });
        this.activeFilter = false;
      }
    });
  }

  saveOptions(options, type: 'heatmap' | 'dispersion') {
    this.options = {
      drivers: options.drivers.map(({ _id }) => _id),
      polygons: options.polygons.map(({ _id }) => _id),
      tags: options.tags.map(({ _id }) => _id),
      ...(type === 'heatmap'
        ? {
            start_date: options.start_date,
            end_date: options.end_date
          }
        : {
            date: options.start_date
          })
    };
  }

  openShareModal() {
    if (this.heatmap ? !this.options.start_date : !this.options.date) return;

    const dialogRef = this.matDialog.open(ShareReportModalComponent, {
      data: {
        options: this.options,
        heatmap: this.heatmap
      },
      restoreFocus: false,
      backdropClass: ['brand-ui-dialog-2']
    });

    dialogRef.afterClosed().subscribe((res?) => {});
  }

  checkedActive({ checked }: any) {
    this.activeDrivers = checked;
    // if (this.heatmap) this.getHeatmap(this.options);
    // else this.getDispersion(this.options);
  }
}
