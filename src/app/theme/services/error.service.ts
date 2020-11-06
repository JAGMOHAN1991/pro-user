import { LoginService } from './../../authentication/login/login.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BoAlertError } from './../utils/error';
import { Subject } from 'rxjs';
import { Injectable, Output } from '@angular/core';
import { BoErrorType } from '../enums/bo-error-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  responseErrors = [];
  showErrorsList = [];
  private static COMMON_NETWORK_ERROR = 'Some network error occured. Please try after sometime';

  private labelList: {} = {
    username: 'Username',
    password: 'Password',
    distributor_id: 'API Associate',
    service: 'Service',
    fromdate: 'From Date',
    todate: 'To Date',
    mobileno: 'Mobile Number',
    otp: 'OTP',
    newpassword: 'New Password',
    confirmpassword: 'Confirm Password',
    txn_from_date: 'from date',
    txn_to_date: 'to date'
  };

  @Output()
  flashMessage: Subject<BoAlertError> = new Subject<BoAlertError>();

  constructor(private route: Router,
    private loginService: LoginService) {

  }

  /**
   * Parse Http Error and return proper message
   * @param errorRespose HttpErrorResponse
   */
  parseHttpErrorServiceMessage(errorRespose: HttpErrorResponse): string {
    if (!errorRespose.error) {
      return !!errorRespose.statusText ? errorRespose.statusText : ErrorService.COMMON_NETWORK_ERROR;
    }

    if (errorRespose.error.error_message) {
      return errorRespose.error.error_message;
    }


    if (errorRespose.error.message) {
      return errorRespose.error.message;
    }

    if (errorRespose.error.responseMessage) {
      return errorRespose.error.responseMessage;
    }

    return ErrorService.COMMON_NETWORK_ERROR;
  }

  /**
   * Flash error message
   */
  error(errorRespose: any) {
    let message: any = typeof (errorRespose) === 'string' ? errorRespose : ErrorService.COMMON_NETWORK_ERROR;

    if (errorRespose instanceof HttpErrorResponse) {
      message = this.parseHttpErrorServiceMessage(errorRespose);
      if (errorRespose.status === 401 && this.loginService.isLogggedIn()) {
        this.route.navigate(['logout']);
      }

      if (errorRespose.status >= 500) {
        message = (!!errorRespose.error.error_code && errorRespose.error.error_code != '') ?
          message :
          ErrorService.COMMON_NETWORK_ERROR;
      }

      if (errorRespose.error.validation_errors instanceof Array && errorRespose.error.validation_errors.length != 0 ||
        (errorRespose.error.validation_errors !== {} &&
          errorRespose.error.validation_errors.length !== 0)) {
        this.responseErrors = [];
        this.responseErrors.push(errorRespose.error.validation_errors);
        for (let i = 0; i < this.responseErrors.length; i++) {
          this.showErrorsList = [];
          for (let key in this.responseErrors[i]) {
            let value = this.responseErrors[i][key];
            // this.showErrorsList.push(value[0]);
            for (let j = 0; j < value.length; j++) {
              this.showErrorsList.push(value[j]);
            }
          }
        }
        message = this.showErrorsList.toString().replace(/,/g, '\n ');;
      } else if (errorRespose.error.error_message) {
        message = errorRespose.error.error_message;
      }
    }

    if (errorRespose instanceof String) {
      message = errorRespose.toString();
    }

    if (typeof (errorRespose) === 'string') {
      message = errorRespose;
    }



    this.flashMessage.next(new BoAlertError(BoErrorType.DANGER, message));
    return false;
  }

  /**
   * Check if form data is valid or not
   * return error mesage
   */
  isFormValid(formRef: FormGroup) {
    if (formRef.valid) {
      return true;
    }
    Object.keys(formRef.controls).every((fieldName: any, key: number, actualArray: any[]) => {
      return (formRef.controls[fieldName].errors) ?
        this.error(this.parseFormGroupErrors(formRef.controls[fieldName].errors, fieldName)) :
        true;
    });
  }

  parseFormGroupErrors(errors: any, fieldName: string): string {
    if (errors.required) {
      return `Please enter ${this.labelList[fieldName] ? this.labelList[fieldName] : fieldName}`;
    }
    if (errors.minlength) {
      return `${this.labelList[fieldName] ? this.labelList[fieldName] : fieldName} minimum length should be 
      ${errors.minlength.requiredLength}`;
    }
    if (errors.maxlength) {
      return `${this.labelList[fieldName] ? this.labelList[fieldName] : fieldName} maximum length should be 
      ${errors.maxlength.requiredLength}`;
    }
    if (errors.pattern) {
      if (errors.pattern.requiredPattern == "^\d*$") {
        return `${this.labelList[fieldName] ? this.labelList[fieldName] : fieldName} should be numeric`;
      }
    }
    return `Please enter valid ${this.labelList[fieldName] ? this.labelList[fieldName] : fieldName}`;
  }

  /* isToAfterFrom(one: NgbDateStruct, two: NgbDateStruct) {
    if (!one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year) {
      this.error('To Date Cannot Be Less Than From Date');
      return false;
    }
    return true;
  } */

  /**
   * Flash success message
   * @param message any
   */
  success(message: any) {
    this.flashMessage.next(new BoAlertError(BoErrorType.SUCCESS, message));
  }

  /**
   * Clear flash message
   */
  clear() {
    this.flashMessage.next(new BoAlertError(BoErrorType.SUCCESS, ''));
  }
}
