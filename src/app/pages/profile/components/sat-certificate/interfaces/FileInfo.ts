import { SafeUrl } from "@angular/platform-browser";
import { UploadFileStatus } from "./UploadFileStatus";

export interface FileInfo {
    /**
     *  An identifer to the file name. 
     * The file will be saved as {{ key }}.{{extension}} in server 
     */
    key: string,
    /** File description, use this value as description to show value */
    text: string,
    /** url of the file */
    src?: SafeUrl,
    /** file object of the one that was uploaded */
    file?: File,
    /** extension of the file, (jpg,pdf,png,xml, etc..) */
    extension?: string,
    /**  */
    fileName?: string,
    /**
     * Used to store previous src in case file was already uploaded
     */
    prevSrc?: SafeUrl
    /** 
     * Indicates if a file has been selected, it does not indicate 
     * if the file was uploaded before
     */
    fileIsSelected?: boolean,
    /**
     * Set value to true if file that was selected is an img
     */
    isFileImg?: boolean,
    /**
     * Set this value to true if value was changed & needs to be updated
     */
    fileNeedsUpdate?: boolean,
    /**
     * String to store the formatted size of the file
     */
    formattedSize?: string,
    /**
     * Observer used to see the progress of the file that is being updated
     */
    uploadFileStatus?: UploadFileStatus,
    /**
     * Used when FileInfo is contained within an array of FileInfos
     * Indicates the hierarchy in which the element should appear in the array
     */
    hierarchy?: number,
    /**
     * Indicates if file can be uploaded optionally
     */
    fileIsOptional?: boolean,

}
