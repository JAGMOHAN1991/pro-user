import { HttpErrorResponse } from '@angular/common/http';
import { LogoutService } from './logout.service';
import { Router } from '@angular/router';
import { LocalStorageService } from './../../theme/services/local-storage.service';
import { AppSettings } from './../../app.settings';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Settings } from './../../app.settings.model';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit, AfterViewInit, OnDestroy {

  public settings: Settings;
  constructor(public appSettings: AppSettings,
    private localStorageService: LocalStorageService,
    private router: Router,
    private logoutService: LogoutService) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    this.logout();
  }

  logout() {
    this.localStorageService.clear();
    this.logoutService.logout().subscribe((data: any) => {
      console.log('Logged out successfully.');
    }, (error: HttpErrorResponse) => {
      console.log(error);
    });
    this.router.navigate(['/login']);
  }

  ngAfterViewInit() {
    this.settings.loadingSpinner = false;
  }

  ngOnDestroy() {
    window.location.reload();
  }
}
