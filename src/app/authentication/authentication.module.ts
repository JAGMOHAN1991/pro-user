import { NguCarouselModule } from '@ngu/carousel';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons/dist';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { SharedModule } from './../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertModule } from './../admin/alert/alert.module';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


export const routes = [
  { path: 'login', component: LoginComponent},
  { path: 'logout', component: LogoutComponent, pathMatch: 'full' },
  { path: 'error', component: ErrorComponent, data: { breadcrumb: 'Error' } },
  { path: '400', component: NotFoundComponent}
];

@NgModule({
  imports: [
    CommonModule,
    AlertModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    Angular2PromiseButtonModule.forRoot(),
    NguCarouselModule
  ],
  declarations: [
    LogoutComponent,
    LoginComponent,
    NotFoundComponent,
    ErrorComponent,
  ]
})
export class AuthenticationModule { }
