import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { Error404Component } from './error404/error404';
import { Error500Component } from './error500/error500';
import { Error503Component } from './error503/error503';
import { MenuModule } from 'headlessui-angular';
import { IconModule } from '@shared/icon/icon.module';

const routes: Routes = [
    { path: '404', component: Error404Component, title: 'Error 404 | WARESEC - Software and Security SpA' },
    { path: '500', component: Error500Component, title: 'Error 500 | WARESEC - Software and Security SpA' },
    { path: '503', component: Error503Component, title: 'Error 503 | WARESEC - Software and Security SpA' },
];

@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, MenuModule, IconModule]
})
export class ErrorModule {}
