import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@shared/services/app.service';
import { AuthService } from '@shared/services/auth.service';
import { ContactService } from '@shared/services/contact.service';
import { UserService } from '@shared/services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',

})
export class InicioComponent implements OnInit {
  formData = {
    nombre: '',
    email: '',
    mensaje: ''
  };
  showConfirmation = false;
  currYear: number = new Date().getFullYear();

  store: any;
  form!: FormGroup;
  errorSession: boolean = false;
  submitted = false;
  passwordTextType!: boolean;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showPassword: boolean = false; // Añadido
  registerForm!: FormGroup;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  isLogin = true;

  images: string[] = [
    'assets/images/banner-front-1.png',
    'assets/images/banner-front-2.png',
    'assets/images/banner-front-3.png',
  ];
  
  currentSlide = 0;
  intervalId: any;
  tenantId: string | null = null;
  tenantError: string | null = null;


  constructor(private route: ActivatedRoute,
    private contactService: ContactService,
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private userService: UserService,
    private cookie: CookieService,
    private readonly _formBuilder: FormBuilder,
    private authService: AuthService,
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
    this.startAutoSlide();
    
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.warn(`Elemento con ID '${fragment}' no encontrado`);
        }
      }
    });

    this.form = this._formBuilder.group({
          email: ['', [
            Validators.required,
            Validators.email
          ]],
          password: ['', [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(12)
          ]],
          rememberMe: [false] // Añadido
        });

        this.registerForm = this._formBuilder.group({
          tenantName: ['', Validators.required],
          name: ['', Validators.required],
          lastname: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { 'mismatch': true };
  }

  togglePasswordVisibilityRegister(field: string) {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else if (field === 'confirm-password') {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    const { email, password, rememberMe } = this.form.value; // Añadido rememberMe
    this.authService.sendCredentials(email, password).subscribe(
      ResponseApi => {
        const { token, user } = ResponseApi.data;
        this.cookie.set('token', token, 1, '/', undefined, true, 'Strict');
        this.userService.setUserData(user);
        this.router.navigate(['/source']);
      },
      err => {
        this.errorSession = true;
        this.translate.get(['Error', 'Ocurrió un error con tu email o password']).subscribe(translations => {
          Swal.fire(translations['Error'], translations['Ocurrió un error con tu email o password'], 'error');
        });
      }
    );
  }

  submitForm(form: NgForm) {
    if (form.valid) {
      this.contactService.sendEmail(this.formData).subscribe(
        response => {
          console.log('Correo enviado', response);
          this.showConfirmation = true;
          form.resetForm();
        },
        error => {
          console.error('Error al enviar el correo', error);
        }
      );
    }
  }

    changeLanguage(item: any) {
        this.translate.use(item.code);
        this.appSetting.toggleLanguage(item);
        if (this.store.locale?.toLowerCase() === 'ae') {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
        } else {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
        }
        window.location.reload();
    }
    
    async showAlert(message: string) {
      Swal.fire({
        title: message,
        padding: '2em',
        customClass: {
          popup: 'sweet-alerts', // Clase personalizada para el popup
        },
      });
    }

    showLogin() {
      this.isLogin = true;
    }
  
    showRegister() {
      this.isLogin = false;
    }

      onSubmitregister() {
        if (this.registerForm.valid) {
          const { name, email, password, lastname, tenantName } = this.registerForm.value;
          this.authService.registerUser(name, email, password, lastname, tenantName ).subscribe(
            (response: any) => {
              const { token, user } = response.data;
              this.cookie.set('token', token, 1, '/');
              this.userService.setUserData(user);
              this.router.navigate(['/source']);
            },
            error => {
              console.error(error);
              this.translate.get(['Error', 'Ocurrió un error al realizar el registro']).subscribe(translations => {
                                    Swal.fire(translations['Error'], translations['Ocurrió un error al realizar el registro'], 'error');
                      });
            }
          );
        }
      }

      startAutoSlide() {
        this.intervalId = setInterval(() => {
          this.nextSlide();
        }, 5000); // cambia cada 5 segundos
      }
      
      nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.images.length;
      }
      
      prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.images.length) % this.images.length;
      }
      
      ngOnDestroy() {
        clearInterval(this.intervalId);
      }

      ngAfterViewInit(): void {
        this.route.fragment.subscribe(fragment => {
          if (fragment) {
            const el = document.getElementById(fragment);
            if (el) {
              setTimeout(() => {
                el.scrollIntoView({ behavior: 'smooth' });
              }, 100); // esperar a que cargue el DOM
            }
          }
        });
      }
}