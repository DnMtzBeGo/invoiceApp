import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Action, Column, Lang, Page, SearchQuery, SelectedRow, StatusOptions, Tag, TagDriver, TagFormParams } from '../../interfaces';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

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

  public addDriverToast: string = '';
  public deleteDriverToast: string = '';
  public errorTagToast: string = '';

  constructor(
    private readonly apiService: AuthService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly notificationService: NotificationsService
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
  }

  public changePage({ index, size }: any) {
    this.searchQuery.page = index;
    if (this.searchQuery.limit !== size) {
      this.page.index = 1;
      this.searchQuery.page = 1;
    }
    this.searchQuery.limit = size;
  }

  public selectColumn($event) {
    console.log($event);
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
  
    (await this.apiService.apiRestGet(`managers_tags/members?${queryParams}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, size = '10', page = '1' } }) => {
        this.page = { total: +size * +page, index: page, size: limit };
  
        const activeTagId = this.tag_id;
  
        this.drivers = result.map((driver: TagDriver) => {
          const hasActiveTag = driver.tags.some(tagId => tagId === activeTagId);
  
          return {
            ...driver,
            selection_check: hasActiveTag
          };
        });
  
        // Aquí llamamos a rowSelected con los drivers ya seleccionados para inicializar correctamente
        const initiallySelectedDrivers = this.drivers.filter(driver => driver.selection_check);
        this.rowSelected(initiallySelectedDrivers, true);
      },
      error: (err: any) => {
        console.error('fetching drivers', err);
      },
      complete: () => {
        this.loadingTableData = false;
      }
    });
  }  

  public async rowSelected($event: any[], isInitialLoad: boolean = false) {
    const timestamp = Date.now();
    const selectedDrivers = $event;
  
    // Identificar los drivers que se han agregado o eliminado
    const newSelectedDrivers = selectedDrivers.filter(driver => driver.selection_check);
    const removedDrivers = this.tag.carriers.filter(carrierId => 
      !selectedDrivers.some(driver => driver._id === carrierId && driver.selection_check)
    );
  
    // Eliminar drivers deseleccionados
    for (const carrierId of removedDrivers) {
      (await this.apiService.apiRestPut(
        JSON.stringify({
          carrier_id: carrierId,
          activate: false,
          timestamp: timestamp,
        }),
        `managers_tags/tag_member/${this.tag_id}`,
        { apiVersion: 'v1.1' }
      )).subscribe({
        next: () => {
          const indexToRemove = this.tag.carriers.indexOf(carrierId);
          if (indexToRemove !== -1) {
            this.tag.carriers.splice(indexToRemove, 1);
          }
          if (!isInitialLoad) {
            this.notificationService.showSuccessToastr(this.translateService.instant('tags.form.delete_driver_toast'));
          }
        },
        error: (error) => {
          console.error('Error removing driver:', error);
          this.notificationService.showErrorToastr(this.translateService.instant('tags.form.error_tag_toast'));
        }
      });
    }
  
    // Agregar nuevos drivers seleccionados
    for (const driver of newSelectedDrivers) {
      const carrierId = driver._id;
      if (!this.tag.carriers.includes(carrierId)) {
        (await this.apiService.apiRestPut(
          JSON.stringify({
            carrier_id: carrierId,
            activate: true,
            timestamp: timestamp,
          }),
          `managers_tags/tag_member/${this.tag_id}`,
          { apiVersion: 'v1.1' }
        )).subscribe({
          next: () => {
            this.tag.carriers.push(carrierId);
            if (!isInitialLoad) {
              this.notificationService.showSuccessToastr(this.translateService.instant('tags.form.add_driver_toast'));
            }
          },
          error: (error) => {
            console.error('Error adding driver:', error);
            this.notificationService.showErrorToastr(this.translateService.instant('tags.form.error_tag_toast'));
          }
        });
      }
    }
  }   
  
  // #endregion Table methods
  
  finish() {
    this.router.navigate(['/tags']);
  }
  
}
