import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { ModalComponent } from 'angular-custom-modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PacienteService } from '@shared/services/paciente.service';


@Component({
    moduleId: module.id,
    selector: 'app-pacientes',
    templateUrl: './pacientes.html',
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))
            ]),
        ]),
    ],
})
export class PacientesComponent implements OnInit {

    displayType: string = 'list';
    params!: FormGroup;

    pacientes: any[] = [];
    pacientesFiltrados: any[] = [];

    searchValue = '';

    @ViewChild('addUserModal') addUserModal!: ModalComponent;

    constructor(
        private fb: FormBuilder,
        private pacientesService: PacienteService,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        this.cargarPacientes();
    }

    cargarPacientes() {
        this.pacientesService.getPacientes().subscribe(data => {
            this.pacientes = data;
            this.pacientesFiltrados = [...this.pacientes];
        });
    }

    buscar() {
        this.pacientesFiltrados = this.pacientes.filter((p: any) =>
            p.nombre.toLowerCase().includes(this.searchValue.toLowerCase()) ||
            p.rut?.toLowerCase().includes(this.searchValue.toLowerCase())
        );
    }

    initForm() {
        this.params = this.fb.group({
            id: [0],
            nombre: ['', Validators.required],
            rut: ['', Validators.required],
            telefono: [''],
            email: ['', [Validators.email]],
            fecha_nacimiento: [''],
            direccion: [''],
        });
    }

    editarPaciente(paciente: any | null = null) {
        this.initForm();

        if (paciente) {
            this.params.patchValue({
                id: paciente.id,
                nombre: paciente.nombre,
                rut: paciente.rut,
                telefono: paciente.telefono,
                email: paciente.email,
                fecha_nacimiento: paciente.fecha_nacimiento,
                direccion: paciente.direccion
            });
        }

        this.addUserModal.open();
    }

    guardarPaciente() {
        if (this.params.invalid) return;

        const data = { ...this.params.value };

        if (data.id && data.id !== 0) {
            this.pacientesService.updatePaciente(data.id, data).subscribe(() => {
                this.cargarPacientes();
                this.addUserModal.close();
            });
        } else {
            delete data.id;
            this.pacientesService.createPaciente(data).subscribe(() => {
                this.cargarPacientes();
                this.addUserModal.close();
            });
        }
    }

    eliminarPaciente(paciente: any) {
        Swal.fire({
            title: '¿Eliminar paciente?',
            text: `Esta acción no se puede deshacer`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                this.pacientesService.deletePaciente(paciente.id).subscribe(() => {
                    this.cargarPacientes();
                });
            }
        });
    }
}