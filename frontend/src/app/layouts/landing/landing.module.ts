import { LandingLayout } from './landing.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, RouterOutlet, Routes } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '@shared/icon/icon.module';
import { MenuModule } from 'headlessui-angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { InicioComponent } from './page/inicio/landing';
import { AppService } from '@shared/services/app.service';




const routes: Routes = [
    {
        path: '',
        component: LandingLayout,
        children: [
            { path: '', redirectTo: 'Home', pathMatch: 'full' },
            { path: 'Home', component: InicioComponent, title: 'Home | EVIEW - Controlando tu Publicidad' },
            { path: '**', redirectTo: 'Home', pathMatch: 'full' },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        TranslateModule,
        MenuModule,
        IconModule,
        ReactiveFormsModule,
        FormsModule,
        NgScrollbarModule.withConfig({
            visibility: 'hover',
            appearance: 'standard',
        }),
        NgIf,
        FontAwesomeModule,
        HttpClientModule,
    ],
    declarations: [
        InicioComponent,

    ],
    providers: [
        AppService,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
})
export class LandingModule { }

