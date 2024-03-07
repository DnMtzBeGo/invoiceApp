import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Action, Column, Lang, Page, SearchQuery, SelectedRow, StatusOptions } from '../../interfaces';
import { AuthService } from 'src/app/shared/services/auth.service';

interface Params {
  tag_id?: string;
}

@Component({
  selector: 'app-tags-form',
  templateUrl: './tags-form.component.html',
  styleUrls: ['./tags-form.component.scss']
})
export class TagsFormComponent implements OnInit {
  public tag_id: string;
  public selectedRow: SelectedRow;
  public loadingData: boolean;
  public lang: Lang;
  public columns: Column[];
  public statusOptions: StatusOptions[];
  public actions: Action[];
  public page: Page;
  // TODO type driver
  public drivers: any[];
  public searchQuery: SearchQuery;

  // Form fields
  public name: string;

  constructor(
    private readonly apiService: AuthService,
    private readonly translateService: TranslateService,
    private readonly route: ActivatedRoute
  ) {
    this.loadingData = true;

    this.checkRouteParams();
    this.setDriversTableConfig();
    this.name = 'Hey!';
    this.setLang();
  }

  checkRouteParams() {
    this.route.params.subscribe({
      next: (params: Params) => {
        const { tag_id } = params;

        if (tag_id) this.tag_id = tag_id;

        this.drivers = [];
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  ngOnInit() {}

  setDriversTableConfig() {
    this.columns = [
      { id: 'columns.name', label: '', filter: 'input', sort: true },
      { id: 'columns.email', label: '', filter: 'input' },
      { id: 'columns.phone', label: '', input: 'style', sort: true },
      { id: 'columns.verified', label: '', filter: 'input', sort: true }
    ];

    this.actions = [
      // {
      //   label: this.translate('view_vouchers', 'actions'),
      //   id: 'view_vouchers',
      //   icon: 'eye'
      // }
    ];

    this.page = { size: 0, index: 0, total: 0 };

    this.searchQuery = {
      limit: 10,
      page: 1,
      sort: JSON.stringify({ date_created: -1 }),
      match: ''
    };

    this.selectedRow = {
      showColumnSelection: false,
      selectionLimit: 0,
      keyPrimaryRow: 'concept'
    };
  }

  setLang() {
    this.lang = {
      selected: 'en',
      paginator: {
        total: '',
        totalOf: '',
        nextPage: '',
        prevPage: '',
        itemsPerPage: ''
      },
      filter: {
        input: '',
        selector: ''
      }
    };

    this.lang.paginator = {
      total: this.translate('total', 'paginator'),
      totalOf: this.translate('of', 'paginator'),
      nextPage: this.translate('nextPage', 'paginator'),
      prevPage: this.translate('prevPage', 'paginator'),
      itemsPerPage: this.translate('itemsPerPage', 'paginator')
    };

    this.translate('tag_name', 'form');

    this.columns.forEach((column) => (column.label = this.translate(column.id, `drivers_table`)));
    this.actions.forEach((action) => (action.label = this.translate(action.id, 'actions')));
  }

  translate(word: string, type: string) {
    return this.translateService.instant(type === 'paginator' ? `${type}.${word}` : `tags.${type}.${word}`);
  }

  // #region Table methods
  filterData({ active, search, type }) {
    if (active) {
      if (type === 'status') this.searchQuery.match = JSON.stringify({ status: this.searchStatus(search) });
      else this.searchQuery.match = JSON.stringify({ [type]: search });
    } else this.searchQuery.match = '';
    this.page.index = 1;
    this.searchQuery.page = 1;
    this.fetchTag();
  }

  selectingAction({ type, data }: any) {
    switch (type) {
    }
  }

  handleReload(event: any) {
    if (event === 'reloadTable') {
      this.fetchTag();
    }
  }

  clickReload() {
    this.fetchTag();
  }

  sortingTable({ type, asc }: any) {
    this.searchQuery.sort = JSON.stringify({ [type]: asc ? -1 : 1 });
    this.page.index = 1;
    this.searchQuery.page = 1;
    this.fetchTag();
  }

  changePage({ index, size }: any) {
    this.searchQuery.page = index;
    if (this.searchQuery.limit !== size) {
      this.page.index = 1;
      this.searchQuery.page = 1;
    }
    this.searchQuery.limit = size;
    this.fetchTag();
  }

  selectColumn($event) {
    console.log($event);
  }

  async fetchTag(translated: boolean = false) {
    this.loadingData = true;

    if (translated) this.drivers = [];

    const { match } = this.searchQuery;
    const queryParams = new URLSearchParams({
      limit: '1',
      page: '1',
      ...(match && { match })
    }).toString();

    // todo add tag id to query
    (await this.apiService.apiRestGet(`tags/?${queryParams}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, total } }) => {
        this.page.total = total;
        this.drivers = result.map((tag) => {
          let due_date: any = {
            value: '-',
            style: {
              color: '#FFFFFF',
              'font-weight': 700
            }
          };

          const actions = {
            enabled: false,
            options: {
              view_upfronts: tag?.upfront_vouchers,
              view_bank: tag?.bank,
              view_message: true
            }
          };

          actions.enabled = Object.values(actions.options).includes(true);

          return {
            ...tag,
            actions,
            due_date,
            status: this.translate(tag.status, 'status')
          };
        });
        this.loadingData = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loadingData = false;
      }
    });
  }

  async fetchDrivers(translated: boolean = false) {
    this.loadingData = true;

    if (translated) this.drivers = [];

    const { limit, page, sort, match } = this.searchQuery;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(sort && { sort }),
      ...(match && { match })
    }).toString();

    (await this.apiService.apiRestGet(`drivers/?${queryParams}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, total } }) => {
        this.page.total = total;
        this.drivers = result.map((tag) => {
          let due_date: any = {
            value: '-',
            style: {
              color: '#FFFFFF',
              'font-weight': 700
            }
          };

          const actions = {
            enabled: false,
            options: {
              view_upfronts: tag?.upfront_vouchers,
              view_bank: tag?.bank,
              view_message: true
            }
          };

          actions.enabled = Object.values(actions.options).includes(true);

          return {
            ...tag,
            actions,
            due_date,
            status: this.translate(tag.status, 'status')
          };
        });
        this.loadingData = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loadingData = false;
      }
    });
  }

  searchStatus(search: string) {
    return this.statusOptions.find((status) => status.value === search).id;
  }

  // #endregion Table methods
}
