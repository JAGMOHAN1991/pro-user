import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  public static LOGIN_DATA   = 'user.logindata';
  public static LOGIN_TOKEN  = 'login.token';
  public static ACCESS_TOKEN = 'user.token';
  public static USER_TYPE    = 'user.user_type';

  constructor() {
  }

  /**
   * set local storage item
   * @param key string
   * @param value string
   */
  setItem(key: string, value: string) {
    self.localStorage.setItem(key, value);
  }

  /**
   * get local storage item
   * @param key string
   */
  getItem(key: string): string | null {
    return self.localStorage.getItem(key);
  }

  /**
   * Clear local storage
   */
  clear() {
    self.localStorage.clear();
  }

  /**
   * Set json item in local storage
   * @param key string
   * @param value any
   */
  setJsonItem(key: string, value: {}) {
    self.localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * get json item from specified local storage key
   * @param key string
   */
  getJsonItem(key: string) {
    return JSON.parse(self.localStorage.getItem(key));
  }

  getBranchId() {
    const loginData = JSON.parse(self.localStorage.getItem(LocalStorageService.LOGIN_DATA));
    return loginData.data.data.branch_id;
  }
}
