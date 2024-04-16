import { Injectable } from '@angular/core';
import { FileInfo } from '../interfaces/FileInfo';
import { AuthService } from '../../../../../shared/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class FiscalDocumentsService {
  public fileInfo: FileInfo[];
  filesToUploadCarriersAndShippers: FileInfo[];
  filesToUploadShippersOnly!: FileInfo[];

  formData = new FormData();
  fileInputs: any = [];

  constructor(private http: HttpClient, private webService: AuthService, private translateService: TranslateService) {
    this.initFileTypes();
  }

  initFileTypes() {
    const certfile: FileInfo = {
      text: this.translateService.instant('sat-certification.label_cer'),
      key: 'archivo_cer'
    };

    const keyfile: FileInfo = {
      text: this.translateService.instant('sat-certification.label_key'),
      key: 'archivo_key'
    };

    this.filesToUploadCarriersAndShippers = [certfile, keyfile];
  }

  getDocumentTypes() {
    return this.filesToUploadCarriersAndShippers;
  }

  async getFilesList(userType: string, prevList: FileInfo[]): Promise<FileInfo[]> {
    let result;

    const bodyJson = JSON.stringify({ type: userType });

    return new Promise(async (resolve, reject) => {
      (await this.webService.apiRest(bodyJson, 'profile/get_files', { loader: false })).subscribe(
        async (response) => {
          console.log('response : ', response.result);
          // result =  this.mergeResult(response.result,bareCarriersList,prevList);
          resolve(result);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  /**
   *
   * @param result Array of the description of the imgs already uploaded in th server
   * @param list The list of files the user has upload
   * @param prevList The list that is about to be replaced after new value
   * @returns The list of files that have to be uploaded merged with the files gotten from the server
   */
  mergeResult(result: Array<any>, list: FileInfo[], prevList?: FileInfo[]): FileInfo[] {
    let formattedResult = result.map((e) => {
      let fileName = e.url.substring(e.url.lastIndexOf('/') + 1);
      let fileNameBrokenDown = fileName.split('.');
      let key = fileNameBrokenDown.slice(0, -1).join('.');
      let extension = fileNameBrokenDown[fileNameBrokenDown.length - 1];

      return {
        key,
        src: e.url,
        extension,
        fileName,
        fileIsSelected: true,
        formattedSize: this.formatFileSize(e.Size)
      };
    });

    list = list.map((e) => {
      e.uploadFileStatus = {};
      return e;
    });

    return list.map((e) => {
      const resultItem = formattedResult.find((f) => f.key == e.key);
      const prevValueItem = prevList?.find((f) => f.key == e.key);
      if (!resultItem) {
        return e;
      }
      return Object.assign(prevValueItem || {}, Object.assign(e, resultItem));
    });
  }

  async deleteFile(key: string): Promise<void> {
    console.log('deleting file', key);
    this.formData.delete(key);
    // return new Promise(async (resolve, reject) => {
    //   const requestJson = JSON.stringify({ file_name });
    //   (await this.webService.apiRest(requestJson, 'profile/remove_file')).subscribe(
    //     (result) => {
    //       resolve(result);
    //     },
    //     (err: Error) => {
    //       reject(err);
    //     }
    //   );
    // });
  }

  emptyFiles() {
    this.fileInfo[0].fileIsSelected = false;
    this.fileInfo[1].fileIsSelected = false;
    this.formData.set('archivo_cer', null);
    this.formData.set('archivo_key', null);
    this.fileInputs.forEach((el) => {
      el.value = '';
    });
  }

  updateAttribute(attr, value) {
    this.formData.set(attr, value);
  }

  addFile(fileInfo: FileInfo) {
    console.log('addFile', fileInfo);
    if (fileInfo.file) {
      this.formData.set(fileInfo.key, fileInfo.file, fileInfo.fileName);
    }
  }

  async sendFiles() {
    const requestOptions = {
      reportProgress: true,
      observe: 'events'
    };

    const appBehaviourOptions = {
      loader: 'false'
    };

    const result = await this.webService.uploadFilesSerivce(this.formData, 'profile/validate_emitter', requestOptions, appBehaviourOptions);

    console.log('sendFiles', result);
    return result;
  }

  formatFileSize(size: number): string {
    if (size < 1000000) return `${(size / 1000).toFixed(1)}KB`;
    return `${(size / 1000000).toFixed(1)}MB`;
  }

  async requestVerification(userType: string) {
    //console.log('CALLING REQUEST VERIFICATION endpoint: ', `${userType}/request_verification`);
    (await this.webService.apiRest('', `${userType}/request_verification`)).subscribe(
      (response: any) => {
        console.log(' request verification : ', response);
      },
      (err: Error) => {
        console.log('err', err);
      }
    );
  }
}
