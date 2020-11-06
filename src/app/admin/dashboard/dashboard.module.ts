import { AlertModule } from './../alert/alert.module';
import { SharedModule } from './../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const routes = [
  { path: '', component: DashboardComponent, data: { breadbrumb: 'Dashboard'}}
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    AlertModule
  ],
  declarations: [
    DashboardComponent,
  ]
})
export class DashboardModule { }
