import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Action, Column, Lang, Page, SearchQuery, SelectedRow, StatusOptions, Tag, TagDriver, TagFormParams } from '../../interfaces';
import { AuthService } from 'src/app/shared/services/auth.service';

import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import {MatSnackBar } from '@angular/material/snack-bar';

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
  tagName: string;
  
  @ViewChild('firstInput', { static: false, read: ElementRef }) firstInput: ElementRef;

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
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar
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
    this.route.queryParams.subscribe(params => {
      this.tagName = params['tagName'];
      this.tag_id = params['tagId'];
    });

    this.tagsForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(1)]),
      carriers: new FormControl(' ', [Validators.required])
    });

    this.onChanges();
  }

  onChanges(): void {
    this.tagsForm.get('name').valueChanges.subscribe(() => {
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

        let hascheckedTags: boolean = false;
        this.drivers = result.map((driver: TagDriver) => {
          const actions = {
            enabled: true,
            options: {}
          };

          if (this.tag.carriers.includes(driver._id)) {
            hascheckedTags = true;
          }

          return {
            selection_check: this.tag.carriers.includes(driver._id),
            ...driver,
            actions
          };
        });

        ;
      },
      error: (err: any) => {
        console.error('fetching drivers', err);
      },
      complete: () => {
        this.loadingTableData = false;
      }
    });
  }

  public async rowSelected($event: any[]) {
    const selectedDriverIds: string[] = $event
      .filter((driver: TagDriver) => driver.selection_check)
      .map((driver: TagDriver) => driver._id);
  
    this.tag.carriers = selectedDriverIds;
  
    const putRequest = async () => {
      try {
        const response = (await this.apiService.apiRestPut(JSON.stringify(this.tag), `managers_tags/${this.tag_id}`, { apiVersion: 'v1.1' })).subscribe();
  
        if (response) {
          if (selectedDriverIds.length > 0) {
            this.showToast('Conductor(es) agregado(s) correctamente');
          } else {
            this.showToast('Conductor(es) eliminado(s) correctamente');
          }
        } else {
          throw new Error('Error');
        }
      } catch (error) {
        this.showToast('Error' + error.message);
      }
    };
  
    setTimeout(() => {
      putRequest();
    }, 3000);
  }
  
  // #endregion Table methods
  public showToast(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
  
  finish() {
    this.router.navigate(['/tags']);
  }
  
}
