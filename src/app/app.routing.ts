import { AuthGuard } from './auth.guard';
import { AdminPagesComponent } from './admin/admin-pages.component';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

export const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: AdminPagesComponent, children: [
            {
                path: '',
                loadChildren: './admin/dashboard/dashboard.module#DashboardModule',
                data: { breadcrumb: 'Dashboard' }
            }
        ]
    },
    {
        path: '',
        children: [
            {
                path: '',
                loadChildren: './authentication/authentication.module#AuthenticationModule'
            }
        ]
    },
    { path: '**', redirectTo: '400' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
    // preloadingStrategy: PreloadAllModules,  // <- comment this line for activate lazy load
    // useHash: true
});
