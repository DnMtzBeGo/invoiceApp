/**
 * Describes attributes for the buttons in bego-alert
 */
export interface BegoAlertHandler  {
    /**
     * The text that the button will have
     */
    text: string,
    /**
     * The action to be executed when the button is called
     */
    action: Function,
    /**
     * The font color the button will have
     */
    color?: string,
}