import { catchError } from 'rxjs/operators';
import { ApiUrls } from './../utils/api-urls';
import { LocalStorageService } from './local-storage.service';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';



/**
 * Define Http Header type
 */
export class BoHttpHeader {
  name: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Initialize http & local storage service
   * @param http HttpClient
   * @param localStorageService LocalStorageService
   */
  constructor(private http: HttpClient, private localStorageService: LocalStorageService) { }

  /**
   * Append headers from key value pairs
   * @param name string
   * @param value string
   */
  appendHeaders(name: string, value: string) {
    this.headers.append(name, value);
    return this;
  }

  /**
   * Append headers from Array
   * @param headers BoHttpHeader[]
   */
  appendHeadersArray(headers: BoHttpHeader[]) {
    headers.forEach(header => {
      this.headers = this.headers.append(header.name, header.value);
    });
    return this;
  }

  /**
   * Set authorization header
   * @param token LoginToken
   */
  /*appendAuthToken(token: LoginToken) {
    this.headers = this.headers.set(
      'Authorization',
      token ? (token.token_type + ' ' + token.access_token) : '' + token
    );
    return this;
  }*/

  /**
   * Get Token
   */
  /* getToken() {
    const token = this.localStorageService.getJsonItem(LocalStorageService.LOGIN_TOKEN);
    return !!token ? of(token) : throwError(new HttpErrorResponse({ error: { error: 401, message: 'Please login to continue' } }));
  } */

  /**
   * get response
   * @param status number
   * @param message string
   * @param data []
   */
  getResponse(status: number, message: string, data: [] = []) {
    return {
      status: status,
      message: message,
      data: data
    };
  }

  /**
   * Make GET Http request
   * @param action string
   * @param data any
   */
  getRequest(action: string, data: any = '') {
    /*if (!!tokenResponse) {
      this.setAuthToken(tokenResponse);
    }*/

    /* return this.getToken().pipe(
      tap(this.setAuthToken),
      mergeMap(_tokenResponse => this.processRequest('get', action, data))
    ); */
    return this.processRequest('get', action, data);
  }

  /**
   * Make POST Http request
   * @param action string
   * @param data any
   * @param tokenResponse LoginToken
   */
  postRequest(action: string, data: any = {}) {
    /*if (!!tokenResponse) {
      this.setAuthToken(tokenResponse);
    }*/

    /* return (action === ApiUrls.Login) ?
      this.processRequest('post', action, data) :
    this.getToken().pipe(
        tap(this.setAuthToken),
        mergeMap(_tokenResponse => this.processRequest('post', action, data))
      );*/
    return this.processRequest('post', action, data);
  }

  /**
   * Set Auth token
   */
  /* setAuthToken = (tokenResponse: LoginToken) => {
    this.appendAuthToken(tokenResponse);
  } */

  /**
   * Process HTTP requests
   */
  processRequest = (method: string, action: string, data: any) => {
    if (method === 'post') {
      data['action'] = action;
      data['method'] = method;
      return this.http.post(this.getFinalUrl(action, method), data, {
        headers: this.headers
      });
    }
    return this.http.get(this.getFinalUrl(action, method), {
      headers: this.headers,
      params: data
    });
  }

  /**
   * Get Final URL
   * @param action string
   */
  getFinalUrl(action: string, method: string) {
    return action !== ApiUrls.Login
      ? ApiUrls.getUrl(action, method)
      : ApiUrls.getRootUrl(action, method);
  }

  logout() {
    return this.http.post(ApiUrls.getDirectUrl('logout'), []);
  }

  fileRequest(action: string, data: any = {}, errorHandler: any = null) {

    data['action'] = action;
    data['method'] = 'post';

    const formData: FormData = new FormData();

    Object.keys(data).map((key: string) => {
        if (typeof data[key] !== 'object' && data[key]) {
            formData.append(key, data[key]);
        } else {
            if (data.pincode_list instanceof Array && data.pincode_list.length > 0) {
                formData.delete('pincode_list[]');
                for (let j = 0; j < data.pincode_list.length; j++) {
                    formData.append('pincode_list[]', data.pincode_list[j]);
                }
            }else{
                formData.append(key, data[key]);
            }
        }
    });

    return this.http.post(this.getFinalUrl(action, 'post'), formData, {
      headers: { 'Accept': 'application/json' },
    }).pipe(
      catchError(errorHandler ? errorHandler : this.processError)
    );
  }

  fileRequestMultiple(action: string, data: any, errorHandler: any = null) {

    data['action'] = action;
    data['method'] = 'post';

    const formData: FormData = new FormData();

    Object.keys(data).map((key: string) => {
      if (typeof data[key] !== 'object' && data[key]) {
        formData.append(key, data[key]);
      }

      if (typeof data[key] === 'object' && data[key]) {
        console.log(data[key]);

        if (data.pancard_file.length > 0) {
          formData.delete('pancard_file[]');
          for (let i = 0; i < data.pancard_file.length; i++) {
            formData.append('pancard_file[]', data.pancard_file[i]);
          }
        }
        if (data.aadhar_file.length > 0) {
          formData.delete('aadhar_file[]');
          for (let j = 0; j < data.aadhar_file.length; j++) {
            formData.append('aadhar_file[]', data.aadhar_file[j]);
          }
        }

      }
      // if (typeof data[key] === 'object' && data[key]) {
      //   console.log(data[key]);
      //   let arr = data[key];
      //   for (var i = 0; i < arr.length; i++) {
      //     if (data.pancard_file) {
      //       formData.append('pancard_file[]', arr[i]);
      //     }
      //   }
      // }

    });

    return this.http.post(this.getFinalUrl(action, 'post'), formData, {
      headers: { 'Accept': 'application/json' },
    }).pipe(
      catchError(errorHandler ? errorHandler : this.processError)
    );
  }

  processError = (error: HttpErrorResponse, caught: Observable<Object>) => {
    //  this.alertService.error(error, true);
    return throwError(error);
  }

  /**
   *
   * @param action
   * @param data
   * @param includes
   * @param filter
   * @param errorHandler
   * @returns {Observable<Object>}
   */
  getDownloadLinkRequest(action: string, data: any = {}, includes: any = [], filter: any = [],
    errorHandler: any = null) {
    data = this.setIncludes(includes, data);
    data = this.setFilter(filter, data);
    return window.open(this.getFinalUrl(action, 'download_link') + '&' + this.getQueryString(data));
  }

  getDownloadRequest(action: string, data: any = {}) {
    window.location.href = this.getFinalUrl(action, 'download-tds') + '&' + this.getQueryString(data);
  }

  getQueryString(data: any) {
    let httpParams = new HttpParams();
    Object.keys(data).forEach((value: any) => {
      httpParams = httpParams.set(value, data[value]);
    });

    return httpParams.toString();
  }

  setFilter(filter: [], postData: any = {}) {
    if (Object.keys(filter).length > 0) {
      Object.keys(filter).forEach((value) => {
        postData['filter[' + value + ']'] = filter[value];
      });
    }
    return postData;
  }

  setIncludes(includes: [], postData: any) {
    if (includes.length > 0) {
      postData['include'] = includes.join(',');
    }
    return postData;
  }

  getDownloadJsRequest(action: string, data: any = {}, includes: any = [], filter: any = [],
    errorHandler: any = null): Observable<Object> {
    data = this.setIncludes(includes, data);
    data = this.setFilter(filter, data);
    return this.processRequest('get', action, data).pipe(
      catchError(errorHandler ? errorHandler : this.processError)
    );
  }
}
