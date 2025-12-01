import { NgModule } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortablejsModule } from '@dustfoundation/ngx-sortablejs';
import { MenuModule } from 'headlessui-angular';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { QuillModule } from 'ngx-quill';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { IconModule } from 'src/app/shared/icon/icon.module';
import { AppLayout } from './app-layout';
import { IndexComponent } from './Dashboard';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'angular-custom-modal';
import { ListuserComponent } from './Listuser/listuser';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RutDirective } from '@shared/directives/formatrut/rut.directive';
import { PacientesComponent } from './pacientes/pacientes';
import { PabellonesComponent } from './pabellones/pabellones';
import { ScrumCirugiasComponent } from './scrum-cirugias/scrum-cirugias';
import { TiposCirugiaComponent } from './tipo-cirugias/tipo-cirugias';


const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            // SOURCE
            { path: '', redirectTo: 'Dashboard', pathMatch: 'full' },
            { path: 'Dashboard', component: IndexComponent, title: 'Dashboard | CLINICA BAK' },
            { path: 'list-user', component: ListuserComponent, title: 'Listado de Usuarios | CLINICA BAK' },
            { path: 'pacientes', component: PacientesComponent, title: 'Listado de Pacientes | CLINICA BAK' },
            { path: 'pabellones', component: PabellonesComponent, title: 'Listado de Pabellones | CLINICA BAK' },
            { path: 'agendamiento', component: ScrumCirugiasComponent, title: 'Listado de Pabellones | CLINICA BAK' },
            { path: 'cirugias', component: TiposCirugiaComponent, title: 'Listado de Pabellones | CLINICA BAK' },
            { path: '**', redirectTo: 'Dashboard', pathMatch: 'full' },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        SortablejsModule,
        NgScrollbarModule.withConfig({
            visibility: 'hover',
            appearance: 'standard',
        }),
        QuillModule.forRoot(),
        FullCalendarModule,
        NgxTippyModule,
        DataTableModule,
        IconModule,
        FontAwesomeModule,
        NgIf,
        MenuModule,
        TranslateModule,
        MenuModule,
        NgxTippyModule,
        NgApexchartsModule,
        RutDirective,
    ],
    declarations: [
        ListuserComponent,
        IndexComponent,
        PacientesComponent,
        PabellonesComponent,
        ScrumCirugiasComponent,
        TiposCirugiaComponent,
    ],
})
export class AppsModule { }
