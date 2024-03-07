import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Action, Column, Lang, Page, SearchQuery, SelectedRow, StatusOptions } from './interfaces';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  public selectedRow: SelectedRow;
  public loadingData: boolean;
  public lang: Lang;
  public columns: Column[];
  public statusOptions: StatusOptions[];
  public actions: Action[];
  public page: Page;
  public tags: any[];
  public searchQuery: SearchQuery;

  constructor(private apiService: AuthService, private translateService: TranslateService) {
    this.loadingData = true;

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

    //#region table contents and config
    this.columns = [
      { id: 'columns.name', label: '', filter: 'input', sort: true },
      { id: 'columns.number_of_drivers', label: '', filter: 'input' },
      { id: 'columns.creation_date', label: '', input: 'style', sort: true },
      { id: 'columns.modified_date', label: '', filter: 'input', sort: true }
    ];

    this.statusOptions = [{ label: 'Cancel', value: 'cancel', id: 1 }];

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

    // TODO fetchtags
    this.tags = [];

    //#endregion table contents and config
    this.setLang();
  }

  ngOnInit() {}

  setLang() {
    this.lang.paginator = {
      total: this.translate('total', 'paginator'),
      totalOf: this.translate('of', 'paginator'),
      nextPage: this.translate('nextPage', 'paginator'),
      prevPage: this.translate('prevPage', 'paginator'),
      itemsPerPage: this.translate('itemsPerPage', 'paginator')
    };

    this.lang.filter = {
      input: this.translate('input', 'filter'),
      selector: this.translate('selector', 'filter')
    };

    this.statusOptions.forEach((status) => (status.label = this.translate(status.value, 'status')));
    this.columns.forEach((column) => (column.label = this.translate(column.id, `table`)));
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
    this.fetchTags();
  }

  selectingAction({ type, data }: any) {
    switch (type) {
    }
  }

  handleReload(event: any) {
    if (event === 'reloadTable') {
      this.fetchTags();
    }
  }

  clickReload() {
    this.fetchTags();
  }

  sortingTable({ type, asc }: any) {
    this.searchQuery.sort = JSON.stringify({ [type]: asc ? -1 : 1 });
    this.page.index = 1;
    this.searchQuery.page = 1;
    this.fetchTags();
  }

  changePage({ index, size }: any) {
    this.searchQuery.page = index;
    if (this.searchQuery.limit !== size) {
      this.page.index = 1;
      this.searchQuery.page = 1;
    }
    this.searchQuery.limit = size;
    this.fetchTags();
  }

  selectColumn($event) {
    console.log($event);
  }

  async fetchTags(translated: boolean = false) {
    this.loadingData = true;

    if (translated) this.tags = [];

    const { limit, page, sort, match } = this.searchQuery;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(sort && { sort }),
      ...(match && { match })
    }).toString();

    (await this.apiService.apiRestGet(`tags/?${queryParams}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, total } }) => {
        this.page.total = total;
        this.tags = result.map((tag) => {
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
