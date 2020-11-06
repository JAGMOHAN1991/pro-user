import { BoErrorType } from '../enums/bo-error-type.enum';
/**
 * Error class
 * It contains error type definition and related methods
 */
export class BoAlertError {
    type: BoErrorType;
    message: string;

    /**
     * Set flash message
     * @param type BoErrorType
     * @param message string
     */
    constructor(type: BoErrorType, message: string) {
        this.type = type;
        this.message = message;
    }
}