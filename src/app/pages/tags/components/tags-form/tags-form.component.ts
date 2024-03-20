import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Action, Column, Lang, Page, SearchQuery, SelectedRow, StatusOptions, Tag, TagDriver, TagFormParams } from '../../interfaces';
import { AuthService } from 'src/app/shared/services/auth.service';

import { FormControl, FormGroup, Validators } from '@angular/forms';

interface AlerLang {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-tags-form',
  templateUrl: './tags-form.component.html',
  styleUrls: ['./tags-form.component.scss']
})
export class TagsFormComponent implements OnInit, AfterViewInit {
  @ViewChild('firstInput', { static: false, read: ElementRef }) firstInput: ElementRef;

  public saveButtonEnabled: boolean = false;
  public tablePrimaryKey: string = '_id';
  public alertContent: AlerLang;
  public tag_id: string;
  public selectedRow: SelectedRow;
  public loadingTableData: boolean;
  public lang: Lang;
  public columns: Column[];
  public statusOptions: StatusOptions[];
  public actions: Action[];
  public page: Page;
  public searchQuery: SearchQuery;

  public tag: Tag = { name: '', carriers: [] };
  public drivers: TagDriver[];

  public tagsForm: FormGroup;

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

  ngOnInit(): void {
    this.tagsForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(1)]),
      carriers: new FormControl(' ', [Validators.required])
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.firstInput.nativeElement.focus();
    }, 500);
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
    this.disableSaveButton();
    this.tagsForm.controls['carriers'].setValue(this.tagsForm.controls['carriers'].value.trim());

    if (this.tagsForm.valid) {
      this.tag = {
        name: this.tagsForm.controls['name'].value,
        carriers: JSON.parse(this.tagsForm.controls['carriers'].value)
      };

      if (!this.tag_id) {
        (await this.apiService.apiRest(JSON.stringify(this.tag), `managers_tags`, { apiVersion: 'v1.1' })).subscribe({
          next: (data) => {
            if (data.result?._id) this.openDialog(this.translate('created', 'tags'));
          },
          error: (error: any) => {
            console.log('saving tag', error);
          },
          complete: () => {
            this.enableSaveButton();
          }
        });
      } else {
        (await this.apiService.apiRestPut(JSON.stringify(this.tag), `managers_tags/${this.tag_id}`, { apiVersion: 'v1.1' })).subscribe({
          next: (d) => {
            this.openDialog(this.translate('updated', 'tags'));
          },
          error: (error: any) => {
            console.log('updating tag', error);
          },
          complete: () => {
            this.saveButtonEnabled = true;
          }
        });
      }
    } else this.saveButtonEnabled = true;
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
    if (type == 'tags') return this.translateService.instant(`${type}.${word}`);

    return this.translateService.instant(type === 'paginator' ? `${type}.${word}` : `tags.${type}.${word}`);
  }

  // #region Table methods
  private configureTableColumns(): TagsFormComponent {
    this.columns = [
      { id: '_id', label: '', hide: true },
      { id: 'thumbnail', label: '', input: 'thumbnail' },
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
      keyPrimaryRow: this.tablePrimaryKey
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
      },
      error: (err: any) => {
        console.error('fetching tag', err);
      },
      complete: () => {
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
      },
      error: (err: any) => {
        console.error('fetching drivers', err);
      },
      complete: () => {
        this.loadingTableData = false;
      }
    });
  }

  public rowSelected($event) {
    this.tag.carriers = $event.map((driver: TagDriver) => (driver.selection_check ? driver._id : false));

    const json = JSON.stringify(this.tag.carriers).replace('[]', '');
    this.tagsForm.controls['carriers'].setValue(json);

    if (json && this.tagsForm.controls['name'].value) this.enableSaveButton();
    else this.disableSaveButton();
  }
  // #endregion Table methods

  public openDialog(message: string): void {
    this.alertContent = {
      title: message,
      subtitle: ''
    };
  }

  public async closeDialog($event: string): Promise<void> {
    if ($event === 'ok') {
      this.alertContent = {
        title: null,
        subtitle: null
      };
      this.router.navigate(['/tags']);
    }
  }

  private disableSaveButton(): void {
    this.saveButtonEnabled = false;
  }
  private enableSaveButton(): void {
    this.saveButtonEnabled = true;
  }
}
