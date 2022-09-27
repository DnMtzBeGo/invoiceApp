import { Subscription } from "rxjs";

export interface UploadFileStatus  {
    /*
    *Indicates the time the file starter to upload
    */
    firstTime?: number,
    /**
     * Indicates the current time
     * Used to know time elpased since upload started
     */
    currentTime?: number,
    /**
     * Percentage before updating to the current percentage
     */
    lastPercentage?: number,
    /**
     * Value set once the subscription returns a vlue
     */
    currentPercentage?: number,
    /**
     * Used to store the number of seconds left to finish uploading file
     */
    missingSecs?: number,
    /**
     * Indicates if file is currently being uploaded to our server
     */
    documentIsBeingUploaded?: boolean,
    /**
     * Observable that return the upload progress
     */
    uploadRequest?: Subscription,
}