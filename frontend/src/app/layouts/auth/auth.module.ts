import { NgModule } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IconModule } from 'src/app/shared/icon/icon.module';
import { MenuModule } from 'headlessui-angular';
import { AuthLayout } from './auth-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { SignInComponent } from './sign-in/signin';





const routes: Routes = [
    {
    path: '',
        component: AuthLayout,
        children: [
            // AUTH
            { path: '', redirectTo: 'signin', pathMatch: 'full' },
            { path: 'signin', component: SignInComponent, title: 'Signin | EVIEW - Controlando tu Publicidad' },
            { path: '**', redirectTo: 'signin', pathMatch: 'full' },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes), 
        CommonModule, 
        MenuModule, 
        IconModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        FormsModule,
        NgIf,
        TranslateModule,
    ],
    declarations: [
        SignInComponent,
    ],
})
export class AuthModule {}
