import { Routes } from '@angular/router';
import { SessionGuard } from '@core/guards/session.guard';



export const routes: Routes = [
    {
        path: 'app',
        loadChildren: () => import('./layouts/apps/app.module').then((m) => m.AppsModule),
        canActivate:[SessionGuard],
    },
    {
        path: '',
        loadChildren: () => import('./layouts/auth/auth.module').then((m) => m.AuthModule)
    },
    {
        path: 'errors',
        loadChildren: () => import('./layouts/error/error.module').then((m) => m.ErrorModule),
    },
    { path: '', redirectTo: '', pathMatch: 'full'},
    { path: '**', redirectTo: 'errors/404' },
];