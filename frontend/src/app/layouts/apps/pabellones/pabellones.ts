import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { ModalComponent } from 'angular-custom-modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '@shared/services/api.service';
import { UserService } from '@shared/services/user.service';

@Component({
    moduleId: module.id,
    selector: 'app-pabellones',
    templateUrl: './pabellones.html',
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class PabellonesComponent implements OnInit {

    displayType: string = 'list';
    params!: FormGroup;

    filterdList: any[] = [];
    searchTerm = '';

    pabellonesList: any[] = [];

    @ViewChild('addModal') addModal!: ModalComponent;

    constructor(
        public fb: FormBuilder,
        private apiService: ApiService,
        private userService: UserService,
        private translate: TranslateService,
    ) {}

    ngOnInit() {
        this.cargarPabellones();
        this.initForm();
    }

    initForm() {
        this.params = this.fb.group({
            id: [0],
            nombre: ['', Validators.required],
            es_compleja: [false],
            capacidad: [1, [Validators.required, Validators.min(1)]],
        });
    }

    cargarPabellones() {
        this.apiService.getPabellones().subscribe(data => {
            this.pabellonesList = Array.isArray(data) ? data : [];
            this.searchItems();
        });
    }

    searchItems() {
        const query = this.searchTerm.toLowerCase();
        this.filterdList = this.pabellonesList.filter((p: any) =>
            p.nombre.toLowerCase().includes(query)
        );
    }

    edit(item: any | null = null) {
        const userRole = this.userService.getUserData()?.rol;

        if (userRole !== 'Admin') {
            Swal.fire({
                icon: 'error',
                title: 'Permiso denegado',
                text: 'Tu usuario no puede modificar pabellones.',
            });
            return;
        }

        this.initForm();

        if (item) {
            this.params.setValue({
                id: item.id,
                nombre: item.nombre,
                es_compleja: item.es_compleja,
                capacidad: item.capacidad
            });
        }

        this.addModal.open();
    }

    save() {
        if (this.params.invalid) return;

        const userRole = this.userService.getUserData()?.rol;
        if (userRole !== 'Admin') {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permisos para crear o editar pabellones.',
            });
            return;
        }

        const data = { ...this.params.value };

        if (data.id && data.id !== 0) {
            this.apiService.updatePabellon(data.id, data).subscribe(() => {
                this.cargarPabellones();
                this.addModal.close();
            });
        } else {
            delete data.id;
            this.apiService.createPabellon(data).subscribe(() => {
                this.cargarPabellones();
                this.addModal.close();
            });
        }
    }

    delete(item: any) {
        Swal.fire({
            title: '¿Eliminar pabellón?',
            text: `Pabellón: ${item.nombre}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        }).then(result => {
            if (result.isConfirmed) {
                this.apiService.deletePabellon(item.id).subscribe(() => {
                    this.cargarPabellones();
                });
            }
        });
    }
}