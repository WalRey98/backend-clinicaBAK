import { NgModule } from '@angular/core';
import { CommonModule, NgIf, DatePipe } from '@angular/common'; // DatePipe importante
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
import { DashboardComponent } from './Dashboard';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'angular-custom-modal';
import { ListuserComponent } from './Listuser/listuser';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts'; // <--- ESTE ES CRUCIAL
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
            { path: '', redirectTo: 'Dashboard', pathMatch: 'full' },
            { path: 'Dashboard', component: DashboardComponent, title: 'Dashboard | CLINICA BAK' },
            { path: 'list-user', component: ListuserComponent, title: 'Listado de Usuarios' },
            { path: 'pacientes', component: PacientesComponent, title: 'Listado de Pacientes' },
            { path: 'pabellones', component: PabellonesComponent, title: 'Listado de Pabellones' },
            { path: 'agendamiento', component: ScrumCirugiasComponent, title: 'Agenda de Pabellones' },
            { path: 'cirugias', component: TiposCirugiaComponent, title: 'Tipos de Cirugía' },
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
        NgScrollbarModule,
        QuillModule.forRoot(),
        FullCalendarModule,
        NgxTippyModule,
        DataTableModule,
        IconModule,
        FontAwesomeModule,
        NgIf,
        MenuModule,
        TranslateModule,
        NgApexchartsModule, // <--- Verifica que esté aquí
        RutDirective,
    ],
    declarations: [
        ListuserComponent,
        DashboardComponent,
        PacientesComponent,
        PabellonesComponent,
        ScrumCirugiasComponent,
        TiposCirugiaComponent,
    ],
    providers: [DatePipe]
})
export class AppsModule { }