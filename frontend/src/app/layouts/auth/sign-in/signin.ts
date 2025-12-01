import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@shared/services/app.service';
import { CookieService } from 'ngx-cookie-service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { ApiService } from '@shared/services/api.service';
import { UserService } from '@shared/services/user.service';


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
export class SignInComponent implements OnInit {
  
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



  constructor(private route: ActivatedRoute,
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private cookie: CookieService,
    private readonly _formBuilder: FormBuilder,
    private authService: ApiService,
    private userService: UserService
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
          username: ['', [
            Validators.required,
          ]],
          password: ['', [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(12)
          ]],
        });
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
    const { username, password } = this.form.value;
    this.authService.login(username, password).subscribe(
      ResponseApi => {
        const { token, user } = ResponseApi.data;
        this.cookie.set('token', token, undefined, '/', undefined, true, 'Strict');
        this.userService.setUserData(user);
        this.router.navigate(['/app']);
      },
      err => {
        this.errorSession = true;
        this.translate.get(['Error', 'Ocurrió un error con tu email o password']).subscribe(translations => {
          Swal.fire(translations['Error'], translations['Ocurrió un error con tu email o password'], 'error');
        });
      }
    );
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