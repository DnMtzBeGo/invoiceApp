import { Injectable } from '@angular/core';
import { FileInfo } from '../interfaces/FileInfo';
import { AuthService } from '../../../../../shared/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class FiscalDocumentsService {
  public id?: string;
  public filesToUploadCarriersAndShippers: FileInfo[];
  public filesToUploadCarriersOnly: FileInfo[];
  public filesToUploadShippersOnly!: FileInfo[];

  constructor(private webService: AuthService, private translateService: TranslateService) {
    this.filesToUploadCarriersAndShippers = [
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_certificate_inc'),
        key: 'certificate_inc'
      },
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_power'),
        key: 'power',
        fileIsOptional: true
      },
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_id'),
        key: 'id'
      },
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_address'),
        key: 'address'
      },
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_tax'),
        key: 'tax'
      },
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_compliance'),
        key: 'compliance'
      }
    ];

    this.filesToUploadCarriersOnly = [
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_sat_address'),
        key: 'sat_address'
      },
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_license'),
        key: 'license'
      },
      {
        text: this.translateService.instant('fiscal-documents.upload-files.txt_insurance'),
        key: 'insurance'
      }
    ];
  }

  async getFilesList(userType: string, prevList: FileInfo[]): Promise<FileInfo[]> {
    let result;

    const bareCarriersList = [
      ...this.filesToUploadCarriersAndShippers.map((e) => ({ ...e })),
      ...this.filesToUploadCarriersOnly.map((e) => ({ ...e }))
    ];
    const bodyJson = JSON.stringify({
      type: userType,
      ...(this.id ? { carrier_id: this.id } : {})
    });

    return new Promise(async (resolve, reject) => {
      (await this.webService.apiRest(bodyJson, 'profile/get_files', { loader: false })).subscribe(
        async (response) => {
          result = this.mergeResult(response.result, bareCarriersList, prevList);
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

  async deleteFile(file_name: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const requestJson = JSON.stringify({
        file_name,
        ...(this.id ? { carrier_id: this.id } : {})
      });
      (await this.webService.apiRest(requestJson, 'profile/remove_file')).subscribe(
        (result) => {
          resolve(result);
        },
        (err: Error) => {
          reject(err);
        }
      );
    });
  }

  async addFile(fileInfo: FileInfo) {
    const formData = new FormData();
    if (fileInfo.file) {
      formData.set('uploads', fileInfo.file, fileInfo.fileName);
    }

    if (this.id) formData.set('carrier_id', this.id);

    const requestOptions = {
      reportProgress: true,
      observe: 'events'
    };

    const appBehaviourOptions = {
      loader: 'false'
    };

    return await this.webService.uploadFilesSerivce(formData, 'profile/upload_files', requestOptions, appBehaviourOptions);
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
