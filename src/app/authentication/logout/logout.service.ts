import { RequestService } from './../../theme/services/request.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(private requestService: RequestService) { }

  logout() {
    return this.requestService.logout();
  }
}
