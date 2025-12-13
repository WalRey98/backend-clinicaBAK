import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { NgxNumberSpinnerModule } from 'ngx-number-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuillModule } from 'ngx-quill';
import { EasymdeModule } from 'ngx-easymde';
import { TextMaskModule } from 'angular2-text-mask';
import { NouisliderModule } from 'ng2-nouislider';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { MenuModule } from 'headlessui-angular';
import { ClipboardModule } from 'ngx-clipboard';
import { IconModule } from 'src/app/shared/icon/icon.module';
import { QuillEditorComponent } from './quill-editor/quill-editor';



const routes: Routes = [
];
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HighlightModule,
        NgxNumberSpinnerModule,
        NgSelectModule,
        QuillModule.forRoot(),
        EasymdeModule.forRoot(),
        TextMaskModule,
        NouisliderModule,
        Ng2FlatpickrModule,
        MenuModule,
        ClipboardModule,
        IconModule,
    ],
    declarations: [
        QuillEditorComponent,
    ],
    providers: [
        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                coreLibraryLoader: () => import('highlight.js/lib/core'),
                languages: {
                    json: () => import('highlight.js/lib/languages/json'),
                    typescript: () => import('highlight.js/lib/languages/typescript'),
                    xml: () => import('highlight.js/lib/languages/xml'),
                },
            },
        },
    ],
})
export class FormModule {}
