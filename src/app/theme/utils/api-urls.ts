import { environment } from '../../../environments/environment';

/**
 * API Url class
 * Contains API Url values and related methods
 */
export class ApiUrls {     
    public static Login = 'oauth/token';
    public static LoginData = 'login_data';

    /**
     * get root url without adding prefix(api/v1) to it
     * @param url string
     */
    public static getRootUrl(url: string, method: string) {
        return environment.api.baseurl + method + '?action=' + url + '&method=' + method;
    }

    /**
     * get complete api url with prefix
     * @param url string
     */
    public static getUrl(url: string, method: string) {
        return environment.api.baseurl + method + environment.api.prefix + '?action=' + url + '&method=' + method;
    }

    public static getDirectUrl(url: string) {
        return environment.api.baseurl + url;
    }
}