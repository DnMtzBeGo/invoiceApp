import { _fixedSizeVirtualScrollStrategyFactory } from "@angular/cdk/scrolling";
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  ViewChild,
  Output,
  Input,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { Subject } from "rxjs";
import { FileInfo } from "src/app/pages/profile/components/fiscal-docs/interfaces/FileInfo";
import * as moment from "moment";

@Component({
  selector: "bego-drag-file-bar",
  templateUrl: "./drag-file-bar.component.html",
  styleUrls: ["./drag-file-bar.component.scss"],
})
export class DragFileBarComponent implements OnInit {
  @ViewChild("fileInput", { read: ElementRef, static: false }) fileInput!: ElementRef;
  @ViewChild("uploadFilesBar", { read: ElementRef, static: false })
  uploadFilesBar!: ElementRef;

  @Output() fileOutput = new EventEmitter<void>();
  @Output() deleteFile = new EventEmitter<void>();

  @Input() disabled?: boolean;

  //used to know if to show loaded file once it's loaded
  @Input() displayFileLoaded: boolean = false;

  onChanges = new Subject<SimpleChanges>();
  file?: File;
  fileInfo?: FileInfo;
  formattedDateUpdated?: string;

  dragListeners = {
    dragOverEvent: this.dragOverEvent.bind(this),
    dragLeaveEvent: this.dragLeaveEvent.bind(this),
    dropListener: this.dropListener.bind(this),
  };

  constructor() {}

  ngOnInit(): void {
    console.log(this.fileInput);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.onChanges.next(changes);
  }

  clickFileInputElement() {
    console.log("clickFileInputElement");
    this.fileInput.nativeElement.click();
  }

  dragOverEvent(event: any) {
    event.preventDefault();
    event.target.classList.add("dragging-file");
  }

  dragLeaveEvent(event: any) {
    event.preventDefault();
    event.target.classList.remove("dragging-file");
  }

  dropListener(event: any) {
    event.preventDefault();
    this.fileInput.nativeElement.files = event.dataTransfer.files;
    event.target.classList.remove("dragging-file");
    this.selectFile();
  }

  addDragListeners() {
    const uploadFilesBar = this.uploadFilesBar?.nativeElement;

    if (uploadFilesBar) {
      uploadFilesBar.addEventListener("dragover", this.dragListeners.dragOverEvent);
      uploadFilesBar.addEventListener("dragleave", this.dragListeners.dragLeaveEvent);
      uploadFilesBar.addEventListener("drop", this.dragListeners.dropListener);
    }
  }

  removeDragListeners() {
    const uploadFilesBar = this.uploadFilesBar.nativeElement;

    uploadFilesBar.removeEventListener("dragover", this.dragListeners.dragOverEvent);
    uploadFilesBar.removeEventListener("dragleave", this.dragListeners.dragLeaveEvent);
    uploadFilesBar.removeEventListener("drop", this.dragListeners.dropListener);
  }

  ngAfterViewInit(): void {
    //Listening when the disabled flag changes
    this.onChanges.subscribe((change) => {
      if (change.disabled) {
        if (this.disabled) {
          this.removeDragListeners();
        } else {
          this.addDragListeners();
        }
      }
    });

    this.addDragListeners();
  }

  /**
   * Arranges information to be displayed in component if required
   * Emits 'fileOutput'
   */
  selectFile(): void {
    const file = this.fileInput.nativeElement.files[0];
    this.fileInput.nativeElement.value = null;
    const splitted = file.name.split(".");
    const extension = splitted.pop();
    const text = splitted.join(".");

    this.fileInfo = {
      text,
      extension,
      key: file.name,
      file,
      formattedSize: `${file.size / 1000} kb`,
    };

    file.size;

    this.formattedDateUpdated = moment(file.lastModified).format("MMM dd YYYY");

    console.log("FileInfo: ", this.fileInfo, this.formattedDateUpdated);
    this.fileOutput.emit(file);
  }

  removeFile(): void {
    this.fileInfo = undefined;
    this.deleteFile.emit();
  }
}
