import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@shared/services/app.service';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css'],
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class NavbarComponent {
    showMenu = false;
    store: any;
    navbarOpen = false;

    constructor (private appSetting: AppService, public translate: TranslateService, public storeData: Store<any>, public router: Router){
        this.initStore();
    }

    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
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

    // toggleNavbar() {
    //     this.showMenu = !this.showMenu;
    // }

    toggleNavbar() {
      this.navbarOpen = !this.navbarOpen;
    }
    
    closeNavbar() {
      this.navbarOpen = false;
    }

    isScrolled = false;

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        this.isScrolled = offset > 100; // Cambia el valor "100" según el punto donde quieras que cambie
    }

    scrollToSection(section: string): void {
      const currentUrl = this.router.url;
  
      if (currentUrl === '/' || currentUrl.startsWith('/home')) {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.warn(`Elemento con ID '${section}' no encontrado.`);
        }
      } else {
        // Redirige a /home y pasa la sección como fragmento
        this.router.navigate(['/home'], { fragment: section });
      }
    }
}


