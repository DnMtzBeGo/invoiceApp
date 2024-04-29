import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Action, Column, Lang, Page, SearchQuery, SelectedRow, StatusOptions, Tag } from './interfaces';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SendMessageModalComponent } from './components/send-message-modal/send-message-modal.component';
import { PrimeService } from 'src/app/shared/services/prime.service';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  public sentMessageSuccessfullyDialogContent: string = '';
  public activeTagId: string;
  public selectedRow: SelectedRow;
  public loadingTableData: boolean;
  public lang: Lang;
  public columns: Column[];
  public actions: Action[];
  public page: Page;
  public tags: Tag[];
  public searchQuery: SearchQuery;
  public alertContent: string = '';

  public saveButtonEnabled: boolean = true;
  public tagsForm: FormGroup;

  private disableSaveButton(): void {
    this.saveButtonEnabled = false;
  }

  private enableSaveButton(): void {
    this.saveButtonEnabled = true;
  }

  public openDialog(message: string): void {

  }


  constructor(
    private readonly router: Router,
    private readonly apiService: AuthService,
    private readonly translateService: TranslateService,
    private readonly datePipe: DatePipe,
    private readonly matDialog: MatDialog,
    public readonly primeService: PrimeService
  ) {
    this.loadingTableData = true;

    // prettier-ignore
    this.configureTableColumns()
    .configureTableActions()
    .configurePagination()
    .configureSelectedRow()
    .setLang()
    .fetchTags();
  }

  ngOnInit() {
    this.translateService.onLangChange.subscribe(() => this.setLang());

    if (this.primeService.loaded.isStopped) {
      this.handleMustRedirect();
    } else {
      this.primeService.loaded.subscribe(() => this.handleMustRedirect())
    }
  }

  handleMustRedirect() {
    if (!this.primeService.isPrime) {
      this.router.navigate(['/home']);
    }
  }

  setLang(): TagsComponent {
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

    this.lang.filter = {
      input: this.translate('input', 'filter'),
      selector: this.translate('selector', 'filter')
    };

    this.columns.forEach((column) => (column.label = this.translate(`columns.${column.id}`, `table`)));
    this.actions.forEach((action) => (action.label = this.translate(action.id, 'actions')));

    return this;
  }

  public translate(word: string, type: string): string {
    return this.translateService.instant(type === 'paginator' ? `${type}.${word}` : `tags.${type ? type + '.' : ''}${word}`);
  }

  public openSendMessageModal(tag_id: string, tag_name: string) {
    const dialogRef = this.matDialog.open(SendMessageModalComponent, {
      data: { tag_id, tag_name },
      restoreFocus: false,
      autoFocus: true,
      disableClose: true,
      backdropClass: ['brand-dialog-1'],
      panelClass: 'rounded-panel'
    });

    dialogRef.afterClosed().subscribe((sent: boolean) => {
      if (sent) this.sentMessageSuccessfullyDialogContent = this.translate('sent_message', 'send_message');
    });
  }

  // #region Table methods

  private configureTableColumns(): TagsComponent {
    this.columns = [
      { id: '_id', label: ' ', input: 'style' },
      { id: 'name', label: '', filter: 'input', sort: true },
      { id: 'number_of_drivers', label: '', sort: true },
      { id: 'date_created', label: '', sort: true },
      { id: 'last_update', label: '', sort: true }
    ];

    return this;
  }

  private configureTableActions(): TagsComponent {
    this.actions = [
      {
        label: this.translate('edit', 'actions'),
        id: 'edit_tag_name',
        icon: 'edit'
      },
      {
        label: this.translate('edit', 'actions'),
        id: 'edit_drivers',
        icon: 'edit'
      },
      {
        label: this.translate('send_message', 'actions'),
        id: 'send_message',
        icon: 'email'
      },
      {
        label: this.translate('delete', 'actions'),
        id: 'delete',
        icon: 'trash'
      }
    ];

    return this;
  }

  private configurePagination(): TagsComponent {
    this.page = { size: 0, index: 0, total: 0 };

    this.searchQuery = {
      limit: 10,
      page: 1,
      sort: JSON.stringify({ date_created: -1 }),
      match: ''
    };

    return this;
  }

  private configureSelectedRow(): TagsComponent {
    this.selectedRow = {
      showColumnSelection: false,
      selectionLimit: 0,
      keyPrimaryRow: '_id'
    };

    return this;
  }

  public filterData({ active, search, type }) {
    if (active) this.searchQuery.match = JSON.stringify({ [type]: search });
    else this.searchQuery.match = '';

    this.page.index = 1;
    this.searchQuery.page = 1;
    this.fetchTags();
  }

  public selectingAction({ type, data }: any) {
    switch (type) {
      case 'edit_tag_name':
        this.showEditInput = true;
        this.editedTagName = data.name;
        this.activeTagId = data._id;
        break;
      case 'edit_drivers':
        this.router.navigate(['/tags/create']);
        break;
      case 'send_message':
        this.openSendMessageModal(data._id, data.name);
        break;
      case 'delete':
        console.log('action is not implemented yet!');
        this.openDeleteDialog(data.name, data._id);
        break;
      default:
        console.log(`Action '${type}' has no a handler`);
    }
  }

  public handleReload(event: any): void {
    if (event === 'reloadTable') {
      this.fetchTags();
    }
  }

  public clickReload(): void {
    this.fetchTags();
  }

  public sortingTable({ type, asc }: any): void {
    this.searchQuery.sort = JSON.stringify({ [type]: asc ? -1 : 1 });
    this.page.index = 1;
    this.searchQuery.page = 1;
    this.fetchTags();
  }

  public changePage({ index, size }: any): void {
    this.searchQuery.page = index;
    if (this.searchQuery.limit !== size) {
      this.page.index = 1;
      this.searchQuery.page = 1;
    }
    this.searchQuery.limit = size;
    this.fetchTags();
  }

  public selectColumn($event): void {
    console.log($event);
  }

  public async fetchTags(translated: boolean = false): Promise<void> {
    this.loadingTableData = true;

    if (translated) this.tags = [];

    const { limit = '10', page = '1', sort, match } = this.searchQuery;
    console.log(match);
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(sort && { sort }),
      ...(match && { search: JSON.parse(match)['name'] })
    }).toString();

    (await this.apiService.apiRestGet(`managers_tags/?${queryParams}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, page = '1', size = '10' } }) => {
        this.page.size = +limit;
        this.page.total = page * size;
        this.page.index = page;

        // setting result
        this.tags = result.map((tag: Tag) => {
          const actions = {
            enabled: true,
            options: {
              edit_tag_name: true,
              edit_drivers: true,
              delete: true,
              send_message: true
            }
          };

          return {
            ...tag,
            number_of_drivers: tag.carriers.length,
            date_created: this.datePipe.transform(tag.date_created, 'MM/dd/yyyy HH:mm', '', this.lang.selected),
            last_update: this.datePipe.transform(tag.last_update, 'MM/dd/yyyy HH:mm', '', this.lang.selected),
            actions
          };
        });
      },
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        this.loadingTableData = false;
      }
    });
  }

  public openDeleteDialog(tag_name: string, tag_id: string): void {
    this.alertContent = this.translate('confirm_delete_question', '') + `"${tag_name}"?`;
    this.activeTagId = tag_id;
  }

  public async closeSendMessageSuccessfullyDialog($event: string): Promise<void> {
    if ($event === 'ok') {
      this.sentMessageSuccessfullyDialogContent = '';
    }
  }

  public async closeDeleteDialog($event: string): Promise<void> {
    if ($event === 'ok') {
      console.log('se borra');
      (await this.apiService.apiRestDel(`managers_tags/${this.activeTagId}`, { apiVersion: 'v1.1' })).subscribe({
        next: (d) => {
          this.fetchTags();
        },
        error: (e) => {
          console.log('Deleting tag', e);
        }
      });
    }

    this.alertContent = '';
    this.activeTagId = '';
  }

  showTagInput: boolean = false;
  showEditInput: boolean = false;
  tagName: string = '';
  editedTagName: string = '';

  public async createTagName() {
    const tagName = this.tagName.trim();
    
    if (tagName && tagName.length >= 1) {
      console.log('create tag name', tagName, this.activeTagId)
      
        const tag = {
            name: tagName
        };

        try {
            const data = await (await this.apiService.apiRest(JSON.stringify(tag), `managers_tags`, { apiVersion: 'v1.1' })).toPromise();

            if (data && data.result && data.result._id) {
                this.openDialog(this.translate('created', 'tags'));
                this.router.navigate(['/tags/create'], { queryParams: { tagName: tagName, tagId: data.result._id } });
            }

        } catch (error) {
            console.log('Error creating tag:', error);
        }
      }
    }

  onModalClose(event: string) {
    try {
      if (event === 'cancel') {
        this.tagName = '';
        this.showTagInput = false;
      } else if (event === 'done') {
        this.createTagName();
      } else {
        console.error('Evento desconocido:', event);
      }
    } catch (error) {
      console.error('Error al manejar el evento:', error);
    }
  }

  public async editTagName(tagId: string, editedTagName: string) {
    try {
      const updatedTag = { name: editedTagName };

      (await this.apiService.apiRestPut(JSON.stringify(updatedTag), `managers_tags/rename/${tagId}`, { apiVersion: 'v1.1' })).subscribe({
        next: (data) => {
          if (data.result?._id) this.openDialog(this.translate('created', 'tags'));
        },
      })

      const tagToUpdate = this.tags.find(tag => tag._id === tagId); 
      if (tagToUpdate) {
        tagToUpdate.name = editedTagName;
      }
      this.showEditInput = false;
    } catch (error) {
      console.error('Error al actualizar el nombre de la etiqueta:', error);
    }
  }
  

  onEditClose(event: string, tagId: string, editedTagName: string) {
    try {
      if (event === 'cancel') {
          this.editedTagName = ''; // Restablece el campo de edición
          this.showEditInput = false; // Oculta el modal de edición
      } else if (event === 'done') {
          this.editTagName(tagId, editedTagName); // Llama a la función para actualizar el nombre de la etiqueta
      } else {
          console.error('Evento desconocido:', event);
      }
    } catch (error) {
      console.error('Error al manejar el evento:', error);
    }
  }
// #endregion Table methods
}