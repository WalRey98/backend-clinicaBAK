import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@shared/services/app.service';
import { CookieService } from 'ngx-cookie-service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { ApiService } from '@shared/services/api.service';
import { UserService } from '@shared/services/user.service'; // Importamos UserService

@Component({
  selector: 'app-signin',
  templateUrl: './signin.html',
  animations: [
      trigger('toggleAnimation', [
          transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
          transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
      ]),
  ],
})
export class SigninComponent implements OnInit, OnDestroy { // Nombre corregido: SigninComponent
  
  store: any;
  form!: FormGroup;
  errorSession: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showPassword: boolean = false;
  isLogin = true;
  loading = false; // Agregado para feedback visual

  constructor(
    private route: ActivatedRoute,
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private cookie: CookieService,
    private readonly _formBuilder: FormBuilder,
    private authService: ApiService,
    private userService: UserService // Inyectamos UserService
  ) { 
    this.initStore();
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
      });
  }

  ngOnInit() {
    // Limpiamos datos antiguos al entrar
    this.cookie.delete('token', '/');
    this.userService.clearUserData();

    this.form = this._formBuilder.group({
          username: ['', [Validators.required]],
          password: ['', [Validators.required, Validators.minLength(4)]],
        });
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
        return;
    }

    this.loading = true;
    this.errorSession = false;
    const { username, password } = this.form.value;

    this.authService.login(username, password).subscribe({
      next: (ResponseApi) => {
        this.loading = false;
        const token = ResponseApi.data?.token;
        const user = ResponseApi.data?.user;

        if (token && user) {
            // 1. Guardar Token
            this.cookie.set('token', token, 1, '/');
            
            // 2. Guardar Usuario (CRUCIAL para permisos de Admin)
            this.userService.setUserData(user);
            
            // 3. Redirigir a la App
            this.router.navigate(['/app']);
        } else {
            this.errorSession = true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorSession = true;
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Usuario o contraseña incorrectos',
            confirmButtonColor: '#4361ee'
        });
      }
    });
  }

  ngOnDestroy() {
  }
}