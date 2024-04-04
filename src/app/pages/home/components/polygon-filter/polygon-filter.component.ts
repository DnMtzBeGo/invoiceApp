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

const LIMIT = 6;

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
    // this.polygons.loading = true;
    // this.tags.loading = true;

    await this.getDrivers();
    await this.getPolygons();
    await this.getTags();
  }

  async getDrivers(page: number = 1) {
    if (this.drivers.loading) return;

    this.drivers.loading = true;

    (
      await this.apiRestService.apiRestGet(`carriers/get_drivers?page=${page}&limit=${LIMIT}`, { apiVersion: 'v1.1', loader: false })
    ).subscribe({
      next: ({ result: { result, pages } }) => {
        if (page === 1) {
          this.pages.drivers.total = pages;
          this.pages.drivers.actual = 1;
          console.log('seteando drivers: ', pages, this.pages.drivers);
        }

        result = result.map((driver) => ({ ...driver, avatar: driver.thumbnail, name: driver.nickname }));

        this.drivers = {
          loading: false,
          options: [...this.drivers.options, ...result],
          scrolleable: page < pages
        };
      },
      error: (err) => console.error(err),
      complete: () => {
        this.drivers.loading = false;
      }
    });
  }

  async getPolygons(page: number = 1) {
    if (this.polygons.loading) return;

    this.polygons.loading = true;

    (await this.apiRestService.apiRestGet(`polygons?page=${page}&limit=${LIMIT}`, { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result: { result, pages } }) => {
        if (page === 1) {
          this.pages.polygons.total = pages;
          this.pages.polygons.actual = 1;
          console.log('seteando polygons: ', pages, this.pages.polygons);
        }

        this.polygons = {
          loading: false,
          options: [...this.polygons.options, ...result],
          scrolleable: page < pages
        };
      },
      error: (err) => console.error(err),
      complete: () => {
        this.polygons.loading = false;
      }
    });
  }

  async getTags(page: number = 1) {
    if (this.tags.loading) return;

    this.tags.loading = true;

    (await this.apiRestService.apiRestGet(`managers_tags?page=${page}&limit=${LIMIT}`, { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result: { result, pages } }) => {
        // this.tags = { loading: false, options: result, scrolleable: false };

        if (page === 1) {
          this.pages.tags.total = pages;
          this.pages.tags.actual = 1;
          console.log('seteando tags: ', pages, this.pages.tags);
        }

        this.tags = {
          loading: false,
          options: [...this.tags.options, ...result],
          scrolleable: page < pages
        };
      }
    });
  }

  loadMoreData(column: string) {
    this.pages[column].actual += 1;
    if (column === 'drivers') this.getDrivers(this.pages.drivers.actual);
    if (column === 'polygons') this.getPolygons(this.pages.polygons.actual);
    if (column === 'tags') this.getTags(this.pages.tags.actual);
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
        // this.saveOptions(options, 'heatmap');
        this.options = options;
        this.activeDrivers = false;
        this.activeFilter = false;
        this.getCoordinates.emit({ type: 'heatmap', ...result });
      }
    });
  }

  async getDispersion(options: any) {
    const newOptions = {
      drivers: JSON.stringify(options.drivers.map(({ _id }) => _id)),
      tags: JSON.stringify(options.tags.map(({ _id }) => _id)),
      polygons: JSON.stringify(options.polygons.map(({ _id }) => _id)),
      date: options.start_date,
      include_older_locations: JSON.stringify(this.activeDrivers)
    };
    const queryParams = new URLSearchParams(newOptions).toString();

    (
      await this.apiRestService.apiRestGet(`polygons/dispersion?${queryParams}`, {
        apiVersion: 'v1.1'
      })
    ).subscribe({
      next: ({ result }) => {
        this.options = options;
        this.activeFilter = false;
        this.getCoordinates.emit({ type: 'dispersion', ...result });
      }
    });
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

  checkedActive(event: any) {
    this.activeDrivers = event.checked;

    if (this.activeFilter || !this.options?.start_date) return;

    this.getDispersion(this.options);
  }
}
