import { ApiUrls } from './../theme/utils/api-urls';
import { Injectable } from '@angular/core';
import { RequestService } from '../theme/services/request.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private requestService: RequestService) { }
}
