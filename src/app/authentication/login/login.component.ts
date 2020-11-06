import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './../../theme/services/error.service';
import { LoginService } from './login.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import {Subscription} from 'rxjs';

/**
 * Define login type
 */
export class Login {
  constructor(public user_type: string, public username: string, public password: string) { }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  // login: Login = new Login('AgentNew', 'Skil@1234');
  login: Login;
  successObservable: Subscription;

  public form: FormGroup;
  public settings: Settings;
  constructor(public appSettings: AppSettings, public fb: FormBuilder, public router: Router,
    private errorService: ErrorService,
    private loginService: LoginService
  ) {
    this.settings = this.appSettings.settings;
    this.form = this.fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'user_type': [''],
      /* 'rememberMe': false */
    });
  }

  /**
   * Get login data on page load if valid token is provided
   */
  ngOnInit() {
  }

  /**
   * Handle success response from login data api call
   */
  loginDataHandler = (loginData: any) => {
    this.settings.loadingSpinner = true;
    this.loginService.setLoginData(loginData);
    // if (loginData.data.data.username === undefined) {
    //   this.router.navigate(['logout']);
    // } else {
    //   this.router.navigate(['/']);
    // }
    this.router.navigate(['/']);
  }

  /**
   * Handle error response from login data api call
   */
  loginErrorHandler = (error: HttpErrorResponse) => {
    this.errorService.error(error);
  }

  /**
   * Function to execute on form submit.
   * Validates form data and act accordingly
   */
  onSubmit() {
    if (this.errorService.isFormValid(this.form)) {
      this.successObservable = this.loginService
        .login(this.form.value)
        .subscribe(this.loginDataHandler, this.loginErrorHandler);
    }
  }

  ngAfterViewInit() {
    this.settings.loadingSpinner = false;
  }
}
