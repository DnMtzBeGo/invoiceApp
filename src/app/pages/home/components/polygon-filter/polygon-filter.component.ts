import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ShareReportModalComponent } from '../share-report-modal/share-report-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { PrimeService } from 'src/app/shared/services/prime.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { BegoPolygonFilter } from '@begomx/ui-components';

const LIMIT = 6;

@Component({
  selector: 'app-polygon-filter',
  templateUrl: './polygon-filter.component.html',
  styleUrls: ['./polygon-filter.component.scss']
})
export class PolygonFilter implements OnInit {
  @Output() getCoordinates = new EventEmitter<any>();
  @Output() clearedFilter = new EventEmitter<any>();
  @ViewChild('polygonFilter') polygonFilter: BegoPolygonFilter;
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

  options = {
    drivers: [],
    tags: [],
    polygons: [],
    start_date: null,
    end_date: null,
    date: null,
    heatmap: false
  };

  pages = {
    drivers: { actual: 0, total: 0 },
    polygons: { actual: 0, total: 0 },
    tags: { actual: 0, total: 0 }
  };

  activeDrivers: boolean = false;
  saveActiveDrivers: boolean = false;

  activeLang: string = 'en';

  filterLang = {
    title: '',
    column: {
      drivers: '',
      polygons: '',
      tags: '',
      empty: ''
    },
    date: '',
    heatmap: {
      title: '',
      yes: '',
      no: ''
    },
    actions: {
      clear: '',
      cancel: '',
      apply: ''
    }
  };

  loading: boolean = false;

  constructor(
    private apiRestService: AuthService,
    private matDialog: MatDialog,
    private translateService: TranslateService,
    public readonly primeService: PrimeService,
    private notificationsService: NotificationsService
  ) {}

  async ngOnInit() {
    this.setFilterLang();
    this.translateService.onLangChange.subscribe(async () => {
      this.setFilterLang();
    });

    await this.getDrivers();
    await this.getPolygons();
    await this.getTags();
  }

  isPrime(): boolean {
    return this.primeService.isPrime;
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
        if (page === 1) {
          this.pages.tags.total = pages;
          this.pages.tags.actual = 1;
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
        if (this.loading) break;
        this.loading = true;

        this.heatmap = heatmap;
        if (heatmap) await this.getHeatmap(event);
        else await this.getDispersion(event);
        break;

      case 'cancel':
        this.activeFilter = false;
        this.activeDrivers = this.saveActiveDrivers;
        if (this.options.start_date) {
          this.heatmap = this.options.heatmap;
        }
        break;

      case 'clear':
        this.clearFilters();
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
        apiVersion: 'v1.1',
        getLoader: 'true',
        timeout: '60000'
      })
    ).subscribe({
      next: ({ result }) => {
        this.options = options;
        this.activeDrivers = false;
        this.activeFilter = false;
        this.getCoordinates.emit({ type: 'heatmap', ...result });
        if (!result?.locations.length) {
          this.notificationsService.showErrorToastr(
            this.translateService.instant('home.polygon-filter.filter.no-results.heatmap'),
            5000,
            'brand-snackbar-2'
          );
        }
        this.loading = false;
      },
      error: ({ error }) => {
        console.error(error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  async getDispersion(options: any) {
    const newOptions = {
      drivers: JSON.stringify(options.drivers.map(({ _id }) => _id)),
      tags: JSON.stringify(options.tags.map(({ _id }) => _id)),
      polygons: JSON.stringify(options.polygons.map(({ _id }) => _id)),
      date: options.start_date,
      include_older_locations: JSON.stringify(!this.activeDrivers)
    };
    const queryParams = new URLSearchParams(newOptions).toString();

    (
      await this.apiRestService.apiRestGet(`polygons/dispersion?${queryParams}`, {
        apiVersion: 'v1.1',
        getLoader: 'true',
        timeout: '60000'
      })
    ).subscribe({
      next: ({ result }) => {
        this.options = options;
        this.activeFilter = false;
        this.saveActiveDrivers = this.activeDrivers;
        this.getCoordinates.emit({ type: 'dispersion', ...result });
        if (!result?.members.length) {
          this.notificationsService.showErrorToastr(
            this.translateService.instant('home.polygon-filter.filter.no-results.dispersion'),
            5000,
            'brand-snackbar-2'
          );
        }
        this.loading = false;
      },
      error: ({ error }) => {
        console.error(error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  openShareModal() {
    if (!this.options.start_date) return;

    const options = {
      ...this.options,
      drivers: this.options.drivers.map(({ _id }) => _id),
      polygons: this.options.polygons.map(({ _id }) => _id),
      tags: this.options.tags.map(({ _id }) => _id)
    };

    const dialogRef = this.matDialog.open(ShareReportModalComponent, {
      data: {
        options,
        heatmap: this.heatmap
      },
      restoreFocus: false,
      backdropClass: ['brand-ui-dialog-2']
    });

    dialogRef.afterClosed().subscribe((res?) => {});
  }

  checkedActive() {
    if (this.activeFilter || !this.options?.start_date) return;

    this.getDispersion(this.options);
  }

  clearFilters() {
    this.options = {
      drivers: [],
      tags: [],
      polygons: [],
      start_date: null,
      end_date: null,
      date: null,
      heatmap: false
    };
    this.activeDrivers = false;
    this.saveActiveDrivers = false;

    this.clearedFilter.emit();
  }

  setFilterLang() {
    const path = 'home.polygon-filter.filter.';
    this.filterLang = {
      title: this.translateService.instant(path + 'title'),
      column: {
        drivers: this.translateService.instant(path + 'column.drivers'),
        polygons: this.translateService.instant(path + 'column.polygons'),
        tags: this.translateService.instant(path + 'column.tags'),
        empty: this.translateService.instant(path + 'column.empty')
      },
      date: this.translateService.instant(path + 'date'),
      heatmap: {
        title: this.translateService.instant(path + 'heatmap.title'),
        yes: this.translateService.instant(path + 'heatmap.yes'),
        no: this.translateService.instant(path + 'heatmap.no')
      },
      actions: {
        clear: this.translateService.instant(path + 'actions.clear'),
        cancel: this.translateService.instant(path + 'actions.cancel'),
        apply: this.translateService.instant(path + 'actions.apply')
      }
    };
  }

  heatmapSelection(status: boolean) {
    this.heatmap = status;
  }

  openFilter() {
    this.activeFilter = !this.activeFilter;

    if (!this.activeFilter) {
      this.polygonFilter?.loadState();
      this.heatmap = this.options.heatmap;
      this.activeDrivers = this.saveActiveDrivers;
    }
  }
}
