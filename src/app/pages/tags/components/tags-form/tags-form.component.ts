import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Action, Column, Lang, Page, SearchQuery, SelectedRow, StatusOptions, Tag, TagDriver, TagFormParams } from '../../interfaces';
import { AuthService } from 'src/app/shared/services/auth.service';

import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tags-form',
  templateUrl: './tags-form.component.html',
  styleUrls: ['./tags-form.component.scss']
})
export class TagsFormComponent implements OnInit {
  public tag_id: string;
  public selectedRow: SelectedRow;
  public loadingTableData: boolean;
  public lang: Lang;
  public columns: Column[];
  public statusOptions: StatusOptions[];
  public actions: Action[];
  public page: Page;
  public searchQuery: SearchQuery;

  // TODO type tag
  public tag: Tag = { name: '', carriers: [] };
  // TODO type driver
  public drivers: TagDriver[];

  // Form fields

  public tagsForm: FormGroup;

  // manager tags
  // titulo mensaje sms o push

  public name: string;

  constructor(
    private readonly apiService: AuthService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.loadingTableData = true;
    this.drivers = [];

    // prettier-ignore
    this.checkRouteParams()
    .configureTableColumns()
    .configureTableActions()
    .configurePagination()
    .configureSelectedRow()
    .setLang()
    .setDefaultFormValues()
    .fetchDrivers();

    this.setLang();
  }

  ngOnInit() {
    this.tagsForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(1)]),
      carriers: new FormControl(' ', [Validators.required])
    });
  }

  public getError = (controlName: string, errorName: string) => {
    return this.tagsForm.controls[controlName].hasError(errorName);
  };

  private setDefaultFormValues(): TagsFormComponent {
    if (this.tag_id) {
      this.fetchTag();
    } else {
      this.tag = { name: '', carriers: [] };
    }
    return this;
  }

  private checkRouteParams(): TagsFormComponent {
    this.route.params.subscribe({
      next: (params: TagFormParams) => {
        const { tag_id } = params;

        if (tag_id) this.tag_id = tag_id;
      },
      error: (error: any) => {
        console.log(error);
      }
    });

    return this;
  }

  public async save() {
    this.tagsForm.controls['carriers'].setValue(this.tagsForm.controls['carriers'].value.trim());

    if (this.tagsForm.valid) {
      this.tag = {
        name: this.tagsForm.controls['name'].value,
        carriers: JSON.parse(this.tagsForm.controls['carriers'].value)
      };

      if (!this.tag_id) {
        (await this.apiService.apiRest(JSON.stringify(this.tag), `managers_tags`, { apiVersion: 'v1.1' })).subscribe({
          next: (data) => {
            if (data.result?._id) this.router.navigate(['/tags']);
          },
          error: (error: any) => {
            console.log('saving tag', error);
          }
        });
      } else {
        (await this.apiService.apiRestPut(JSON.stringify(this.tag), `managers_tags/${this.tag_id}`, { apiVersion: 'v1.1' })).subscribe({
          next: () => {
            this.router.navigate(['/tags']);
          },
          error: (error: any) => {
            console.log('updating tag', error);
          }
        });
      }
    }
  }

  private setLang(): TagsFormComponent {
    this.lang = {
      selected: 'en',
      selectRow: {
        selectAll: ''
      },
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

    this.columns.forEach((column) => (column.label = this.translate(`columns.${column.id}`, `drivers_table`)));
    this.actions.forEach((action) => (action.label = this.translate(action.id, 'actions')));

    return this;
  }

  public translate(word: string, type: string) {
    return this.translateService.instant(type === 'paginator' ? `${type}.${word}` : `tags.${type}.${word}`);
  }

  // #region Table methods
  private configureTableColumns(): TagsFormComponent {
    this.columns = [
      { id: '_id', label: '', input: 'style' },
      // { id: 'thumbnail', label: '', filter: 'input' },
      { id: 'nickname', label: '', filter: 'input', sort: true },
      { id: 'email', label: '', filter: 'input' },
      { id: 'telephone', label: '', filter: 'input', sort: true },
      { id: 'verified', label: '', sort: true }
    ];
    return this;
  }

  private configureTableActions(): TagsFormComponent {
    this.actions = [
      // {
      //   label: this.translate('alias', 'actions'),
      //   id: 'alias',
      //   icon: 'eye'
      // }
    ];

    return this;
  }

  private configurePagination(): TagsFormComponent {
    this.page = { size: 0, index: 0, total: 0 };

    this.searchQuery = {
      limit: 10,
      page: 1,
      sort: JSON.stringify({ date_created: -1 }),
      match: ''
    };

    return this;
  }

  private configureSelectedRow(): TagsFormComponent {
    this.selectedRow = {
      showColumnSelection: true,
      selectionLimit: 0,
      keyPrimaryRow: 'concept'
    };
    return this;
  }

  public filterData({ active, search, type }) {
    console.log(active);
    if (active) this.searchQuery.match = JSON.stringify({ [type]: search });
    else this.searchQuery.match = '';

    this.page.index = 1;
    this.searchQuery.page = 1;
    this.fetchDrivers();
  }

  public selectingAction({ type, data }: any) {
    switch (type) {
    }
  }

  public handleReload($event: any) {
    if ($event === 'reloadTable') this.fetchDrivers();
  }

  public clickReload() {
    this.fetchTag();
  }

  public sortingTable({ type, asc }: any) {
    this.searchQuery.sort = JSON.stringify({ [type]: asc ? -1 : 1 });
    this.page.index = 1;
    this.searchQuery.page = 1;

    if (this.tag_id) this.fetchTag();
  }

  public changePage({ index, size }: any) {
    this.searchQuery.page = index;
    if (this.searchQuery.limit !== size) {
      this.page.index = 1;
      this.searchQuery.page = 1;
    }
    this.searchQuery.limit = size;

    if (this.tag_id) this.fetchTag();
  }

  public selectColumn($event) {
    console.log($event);
  }

  private async fetchTag(translated: boolean = false) {
    this.loadingTableData = true;

    if (translated) this.drivers = [];

    (await this.apiService.apiRestGet(`managers_tags/${this.tag_id}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result }) => {
        this.tag = result;
        this.tagsForm.controls['name'].setValue(result.name);
        this.tagsForm.controls['carriers'].setValue(JSON.stringify(result.carriers).replace('[]', ''));
        this.loadingTableData = false;
      },
      error: (err: any) => {
        console.error('fetching tag', err);
        this.loadingTableData = false;
      }
    });
  }

  public async fetchDrivers(translated: boolean = false) {
    this.loadingTableData = true;

    if (translated) this.drivers = [];

    const { limit, page, sort, match } = this.searchQuery;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(sort && { sort }),
      ...(match && { search: match })
    }).toString();

    (await this.apiService.apiRestGet(`carriers/get_drivers?${queryParams}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, size = '10', page = '1' } }) => {
        this.page = { total: +size * +page, index: page, size: limit };

        this.drivers = result.map((driver: TagDriver) => {
          const actions = {
            enabled: true,
            options: {}
          };

          return {
            selection_check: this.tag.carriers.includes(driver._id),
            ...driver,
            actions
          };
        });
        this.loadingTableData = false;
      },
      error: (err: any) => {
        console.error('fetching drivers', err);
        this.loadingTableData = false;
      }
    });
  }

  searchStatus(search: string) {
    return this.statusOptions.find((status) => status.value === search).id;
  }

  public rowSelected($event) {
    this.tag.carriers = $event.map((driver: TagDriver) => (driver.selection_check ? driver._id : false));

    this.tagsForm.controls['carriers'].setValue(JSON.stringify(this.tag.carriers).replace('[]', ''));
  }
  // #endregion Table methods
}
