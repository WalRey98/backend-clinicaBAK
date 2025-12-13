import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Importante para el diseño original

// Componentes
import { AuthLayout } from './auth-layout';
import { SigninComponent } from './sign-in/signin';

const routes: Routes = [
    {
        path: '',
        component: AuthLayout,
        children: [
            { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
            { path: 'sign-in', component: SigninComponent, title: 'Iniciar Sesión | CLINICA BAK' },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        FontAwesomeModule // Agregado para que funcionen los íconos del diseño
    ],
    declarations: [
        AuthLayout,
        SigninComponent,
    ],
})
export class AuthModule { }