import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../theme/services/local-storage.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  loginData: any;
  userType: any;

  constructor(
    private localStorageService: LocalStorageService, private router: Router
  ) { }

  ngOnInit() {
    this.loginData = this.localStorageService.getJsonItem(LocalStorageService.LOGIN_DATA);
    this.userType = this.localStorageService.getJsonItem(LocalStorageService.USER_TYPE);
    if(this.userType === 'SALES_EXECUTIVE'){
     return this.router.navigate(['/fieldx']);
    }
  }

}
