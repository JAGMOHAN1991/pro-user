import { environment } from './../../../environments/environment';
import { ApiUrls } from './../../theme/utils/api-urls';
import { LocalStorageService } from './../../theme/services/local-storage.service';
import { Injectable } from '@angular/core';
import { RequestService } from 'src/app/theme/services/request.service';
import { finalize, filter, concatMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


export class LoginToken {
  token_type?: string;
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  localStorageService: LocalStorageService

  /**
   * Get new instance of LoginToken class
   */
  static getInstance(): LoginToken {
    return new this;
  }

  /**
   * Get empty tokens
   */
  static getEmptyTokens(): any {
    return {
      token_type: '',
      expires_in: '',
      access_token: '',
      refresh_token: ''
    };
  }

  /**
   * Set login tokens
   * @param loginToken LoginToken
   */
  setTokens(loginToken: LoginToken) {
    this.access_token = loginToken.access_token;
    this.expires_in = loginToken.expires_in;
    this.refresh_token = loginToken.refresh_token;
    this.token_type = loginToken.token_type;
    return this;
  }

  /**
   * Get token details
   */
  getTokenDetails(): {} {
    return {
      token_type: this.token_type,
      expires_in: this.expires_in,
      access_token: this.access_token,
      refresh_token: this.refresh_token
    };
  }
}

@Injectable({
  providedIn: 'root'
})
/**
 * A service to handle all login & login data related tasks
 */
export class LoginService {


  /**
   * Initialize api request & local storage services
   * @param apiService ApiRequestsService
   * @param localStorageService LocalStorageService
   */
  constructor(private apiService: RequestService, private localStorageService: LocalStorageService) { }

  /**
   * Login user
   * @param postdata any
   */
  login(postdata: any) {
    console.log(postdata);
    return this.apiService.postRequest(ApiUrls.Login, postdata)
      .pipe(
        finalize(() => console.log('End of the first(Login) call')),
        filter((res: any) => res.data.access_token !== ''),
        concatMap(loginResponse => this.getLoginData({}, loginResponse.data)),
        catchError((error: any) => throwError(error))
      );
  }

  /**
   * Get Login data
   * @param postdata any
   * @param tokenResponse? LoginToken
   */
  getLoginData(postdata: any = {}, tokenResponse?: LoginToken) {
    console.log('tokenResponse.access_token', tokenResponse);
    this.localStorageService.setJsonItem(LocalStorageService.ACCESS_TOKEN, tokenResponse.access_token);
    return this.apiService.getRequest(ApiUrls.LoginData, postdata);
  }

  /**
   * set login token
   * @param tokenResponse LoginToken
   */

  /**
   * Set Login data
   * @param loginData any
   */
  setLoginData(loginData: {}) {
    this.localStorageService.setJsonItem(LocalStorageService.LOGIN_DATA, loginData);
  }

  /**
   * Check if user is logged in
   */
  isLogggedIn() {
    return !!this.localStorageService.getItem(LocalStorageService.LOGIN_DATA) ? true : false;
  }
}
