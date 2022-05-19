export interface Step {
    /**
     * The text to be shown inside stepper
     */
    text: string,
    /**
     * Indicates if step is finished and has all of the required info
     */
    validated?: boolean ,
    /**
     * The text to be put on the back btn
     */
    backBtnTxt?: string,
    /**
     * The text to be put on the next btn
     */
    nextBtnTxt?:string,
    /**	
     * The step name
     */
     step?: string,
}