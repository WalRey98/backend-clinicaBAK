import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { ModalComponent } from 'angular-custom-modal';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@shared/services/user.service';
import { TranslateService } from '@ngx-translate/core';

interface Country {
    code: string;
    name: string;
    phoneCode: string;
}

@Component({
    moduleId: module.id,
    selector: 'app-listuser',
    templateUrl: './listuser.html',
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class ListuserComponent implements OnInit {
    displayType: string = 'list'; // Define la propiedad y dale un valor inicial
    params!: FormGroup;
    filterdUserList: any[] = [];
    searchUser = '';
    tenantId: string | null = null;
    userList: any[] = []; // Asegurarse de que es un array

    countries: Country[] = [
        { code: 'AF', name: 'Afganistán', phoneCode: '+93' },
        { code: 'AL', name: 'Albania', phoneCode: '+355' },
        { code: 'DE', name: 'Alemania', phoneCode: '+49' },
        { code: 'AD', name: 'Andorra', phoneCode: '+376' },
        { code: 'AO', name: 'Angola', phoneCode: '+244' },
        { code: 'AR', name: 'Argentina', phoneCode: '+54' },
        { code: 'AM', name: 'Armenia', phoneCode: '+374' },
        { code: 'AU', name: 'Australia', phoneCode: '+61' },
        { code: 'AT', name: 'Austria', phoneCode: '+43' },
        { code: 'AZ', name: 'Azerbaiyán', phoneCode: '+994' },
        { code: 'BS', name: 'Bahamas', phoneCode: '+1-242' },
        { code: 'BH', name: 'Baréin', phoneCode: '+973' },
        { code: 'BD', name: 'Bangladés', phoneCode: '+880' },
        { code: 'BB', name: 'Barbados', phoneCode: '+1-246' },
        { code: 'BY', name: 'Bielorrusia', phoneCode: '+375' },
        { code: 'BE', name: 'Bélgica', phoneCode: '+32' },
        { code: 'BZ', name: 'Belice', phoneCode: '+501' },
        { code: 'BO', name: 'Bolivia', phoneCode: '+591' },
        { code: 'BR', name: 'Brasil', phoneCode: '+55' },
        { code: 'BG', name: 'Bulgaria', phoneCode: '+359' },
        { code: 'CA', name: 'Canadá', phoneCode: '+1' },
        { code: 'CL', name: 'Chile', phoneCode: '+56' },
        { code: 'CN', name: 'China', phoneCode: '+86' },
        { code: 'CO', name: 'Colombia', phoneCode: '+57' },
        { code: 'CR', name: 'Costa Rica', phoneCode: '+506' },
        { code: 'HR', name: 'Croacia', phoneCode: '+385' },
        { code: 'CU', name: 'Cuba', phoneCode: '+53' },
        { code: 'CY', name: 'Chipre', phoneCode: '+357' },
        { code: 'CZ', name: 'Chequia', phoneCode: '+420' },
        { code: 'DK', name: 'Dinamarca', phoneCode: '+45' },
        { code: 'DO', name: 'República Dominicana', phoneCode: '+1-809' },
        { code: 'EC', name: 'Ecuador', phoneCode: '+593' },
        { code: 'EG', name: 'Egipto', phoneCode: '+20' },
        { code: 'SV', name: 'El Salvador', phoneCode: '+503' },
        { code: 'ES', name: 'España', phoneCode: '+34' },
        { code: 'US', name: 'Estados Unidos', phoneCode: '+1' },
        { code: 'FR', name: 'Francia', phoneCode: '+33' },
        { code: 'GE', name: 'Georgia', phoneCode: '+995' },
        { code: 'GR', name: 'Grecia', phoneCode: '+30' },
        { code: 'GT', name: 'Guatemala', phoneCode: '+502' },
        { code: 'HT', name: 'Haití', phoneCode: '+509' },
        { code: 'HN', name: 'Honduras', phoneCode: '+504' },
        { code: 'HU', name: 'Hungría', phoneCode: '+36' },
        { code: 'IS', name: 'Islandia', phoneCode: '+354' },
        { code: 'IN', name: 'India', phoneCode: '+91' },
        { code: 'ID', name: 'Indonesia', phoneCode: '+62' },
        { code: 'IR', name: 'Irán', phoneCode: '+98' },
        { code: 'IE', name: 'Irlanda', phoneCode: '+353' },
        { code: 'IL', name: 'Israel', phoneCode: '+972' },
        { code: 'IT', name: 'Italia', phoneCode: '+39' },
        { code: 'JM', name: 'Jamaica', phoneCode: '+1-876' },
        { code: 'JP', name: 'Japón', phoneCode: '+81' },
        { code: 'KE', name: 'Kenia', phoneCode: '+254' },
        { code: 'KR', name: 'Corea del Sur', phoneCode: '+82' },
        { code: 'MX', name: 'México', phoneCode: '+52' },
        { code: 'NL', name: 'Países Bajos', phoneCode: '+31' },
        { code: 'NZ', name: 'Nueva Zelanda', phoneCode: '+64' },
        { code: 'NI', name: 'Nicaragua', phoneCode: '+505' },
        { code: 'NO', name: 'Noruega', phoneCode: '+47' },
        { code: 'PA', name: 'Panamá', phoneCode: '+507' },
        { code: 'PY', name: 'Paraguay', phoneCode: '+595' },
        { code: 'PE', name: 'Perú', phoneCode: '+51' },
        { code: 'PT', name: 'Portugal', phoneCode: '+351' },
        { code: 'PR', name: 'Puerto Rico', phoneCode: '+1-787' },
        { code: 'RU', name: 'Rusia', phoneCode: '+7' },
        { code: 'ZA', name: 'Sudáfrica', phoneCode: '+27' },
        { code: 'KR', name: 'Corea del Sur', phoneCode: '+82' },
        { code: 'SE', name: 'Suecia', phoneCode: '+46' },
        { code: 'CH', name: 'Suiza', phoneCode: '+41' },
        { code: 'TW', name: 'Taiwán', phoneCode: '+886' },
        { code: 'TH', name: 'Tailandia', phoneCode: '+66' },
        { code: 'TR', name: 'Turquía', phoneCode: '+90' },
        { code: 'UA', name: 'Ucrania', phoneCode: '+380' },
        { code: 'GB', name: 'Reino Unido', phoneCode: '+44' },
        { code: 'UY', name: 'Uruguay', phoneCode: '+598' },
        { code: 'VE', name: 'Venezuela', phoneCode: '+58' },
        { code: 'VN', name: 'Vietnam', phoneCode: '+84' },
    ];

    @ViewChild('addUserModal') addUserModal!: ModalComponent;

    constructor(
        public fb: FormBuilder,
        private userService: UserService,
        private translate: TranslateService,
    ) { }

    ngOnInit() {
        this.cargarUsuarios();
        
    }

    initForm() {
        this.params = this.fb.group({
            id: [0],
            nombre_completo: ['', Validators.required],
            username: ['', Validators.required],
            rol: ['', Validators.required],
            status:[''],
        });
    }

    validateCountry(control: AbstractControl): { [key: string]: any } | null {
        const selectedCountry = control.value;
        if (!selectedCountry) return { required: true };

        const isValidCountry = this.countries.some(country => country.name === selectedCountry);
        return isValidCountry ? null : { invalidCountry: true };
    }

    cargarUsuarios() {
        this.userService.getUsers().subscribe(data => {
            this.userList = Array.isArray(data) ? data : [];
            this.initForm();
            this.searchUsers();
        });
    }

    searchUsers() {
        this.filterdUserList = this.userList.filter((d: any) => d.nombre_completo.toLowerCase().includes(this.searchUser.toLowerCase()));
    }

    editUser(user: any | null = null) {
        const userRole = this.userService.getUserData()?.rol;
        if (userRole !== 'Admin') {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permisos para editar usuarios.',
            });
            return;
        }
    
        this.initForm();
        if (user) {
            this.params.setValue({
                id: user.id || 0,
                nombre_completo: user.nombre_completo || '',
                username: user.username || '',
                rol: user.rol || '',
                status: user.status || '',
            });
        }
        this.addUserModal.open();
    }

    saveUser() {
        if (this.params.invalid) {
            return;
        }
    
        const userRole = this.userService.getUserData()?.rol;
        if (userRole !== 'Admin') {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permisos para crear o editar usuarios.',
            });
            return;
        }
    
        const user = { ...this.params.value };
    
        if (!user.id || user.id === 0) {
            delete user.id;
        }
    
        if (this.params.value.id) {
            this.userService.updateUser(this.params.value.id, user).subscribe(response => {
                this.cargarUsuarios();
                this.addUserModal.close();
            });
        } else {
            this.userService.createUser(user).subscribe(response => {
                this.cargarUsuarios();
                this.addUserModal.close();
            });
        }
    }

    deleteUser(user: any) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Deseas eliminar al usuario ${user.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.userService.deleteUser(user.id).subscribe(response => {
                    this.cargarUsuarios();
                });
            }
        });
    }

    resetPassword(user: any) {
        Swal.fire({
            title: 'Cambiar Contraseña',
            input: 'password',
            inputLabel: 'Nueva Contraseña',
            inputPlaceholder: 'Ingrese la nueva contraseña',
            showCancelButton: true,
            confirmButtonText: 'Cambiar',
            cancelButtonText: 'Cancelar',
            preConfirm: (password) => {
                return this.userService.resetPassword(user.id, password).toPromise().then(() => {
                    Swal.fire('Éxito', 'Contraseña actualizada exitosamente', 'success');
                }).catch((error) => {
                    Swal.showValidationMessage(`Error: ${error}`);
                });
            }
        });
    }

}