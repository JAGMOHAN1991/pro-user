import { LocalStorageService } from './../local-storage.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


/**
 * Definition for Report configuration
 */
export interface ReportConfig {
  column_labels?: any;
  exceljs: {
    companyDetails: {
      label: {
        richText: any,
        label1?: string,
        label2?: string,
        label3?: string,
        label4?: string,
        alignment: { horizontal: string, vertical: string }
      }
    },
    metaDetails: {
      label: {
        richText: any
      }
    }
  };
}

/**
 * Definition for application configuration
 */
export interface Configuration {
  reports: ReportConfig;
}

@Injectable({
  providedIn: 'root'
})
/**
 * A service to fetch required configuration at application boot time.
 */
export class ConfigService {

  private config?: Configuration;

  /**
   * Config service constructor
   * @param http HttpClient
   * @param localStorage LocalStoragteService
   */
  constructor(private http: HttpClient, private localStorage: LocalStorageService) { }

  /**
   * Load configuration from intermediate
   * @param url string
   */
  load(url: string) {
    return this.http.get(url, {
      headers: { 'Accept': 'application/json' }
    }).toPromise().then((config: Configuration) => this.config = config).catch(err => console.log(err));
  }

  /**
   * Get configuration
   */
  getConfiguration(): Configuration {
    return this.config;
  }
}
