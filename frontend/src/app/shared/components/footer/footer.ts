import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@shared/services/app.service';
import { VersionService } from '@shared/services/version.service';


@Component({
    moduleId: module.id,
    selector: 'footer',
    templateUrl: './footer.html',
})
export class FooterComponent {
    currYear: number = new Date().getFullYear();
    appVersion: string;

    constructor(
      private appSetting: AppService, 
      public translate: TranslateService, 
      public storeData: Store<any>,
      private versionService: VersionService,
      private router: Router,
    ) {
      this.appVersion = this.versionService.getVersion();
    }
    ngOnInit() {}

    showTermsModal: boolean = false;
  showPrivacyModal: boolean = false;
  store: any;

  // Abrir modal
  openModal(type: string): void {
    if (type === 'terms') {
      this.showTermsModal = true;
    } else if (type === 'privacy') {
      this.showPrivacyModal = true;
    }
  }

  // Cerrar modales
  closeModal(): void {
    this.showTermsModal = false;
    this.showPrivacyModal = false;
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
}
