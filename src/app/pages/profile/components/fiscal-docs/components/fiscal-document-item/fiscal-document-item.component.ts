import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { FileInfo } from '../../interfaces/FileInfo';
import { FiscalDocumentsService } from '../../services/fiscal-documents.service';
import { HttpEventType } from '@angular/common/http';
import { FiscalBaseComponent } from '../fiscal-base/fiscal-base.component';

@Component({
  selector: 'app-fiscal-document-item',
  templateUrl: './fiscal-document-item.component.html',
  styleUrls: ['./fiscal-document-item.component.scss']
})

export class FiscalDocumentItemComponent extends FiscalBaseComponent implements OnInit {

  @Input() file!: FileInfo;
  @Output() onFileDeleted = new EventEmitter<void>();


  constructor(
    public injector: Injector
  ) { 

      super(injector);
  }

  ngOnInit(): void {
  }


}
