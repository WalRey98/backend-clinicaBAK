import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AppService } from '@shared/services/app.service';

@Component({
    selector: 'landing',
    templateUrl: './landing.component.html',
})
export class LandingLayout {
    store: any;
    showTopButton = false;
    showTermsModal = false;
    showPrivacyModal = false;
    headerClass = '';

    constructor(public storeData: Store<any>, private service: AppService, private router: Router, private route: ActivatedRoute) {
        this.initStore();
        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          const childRoute = this.route.firstChild?.snapshot;
          this.showTermsModal = childRoute?.data?.['showTerms'] || false;
          this.showPrivacyModal = childRoute?.data?.['showPrivacy'] || false;
        });
    }

    ngOnInit() {
        this.toggleLoader();
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                this.showTopButton = true;
            } else {
                this.showTopButton = false;
            }
        });
    }

    toggleLoader() {
        this.storeData.dispatch({ type: 'toggleMainLoader', payload: true });
        setTimeout(() => {
            this.storeData.dispatch({ type: 'toggleMainLoader', payload: false });
        }, 500);
    }

    ngOnDestroy() {
        window.removeEventListener('scroll', () => { });
    }

    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    goToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

  // Cierre desde el footer (evento emitido)
  closeModal(modalType: 'terms' | 'privacy') {
    if (modalType === 'terms') {
      this.showTermsModal = false;
    } else if (modalType === 'privacy') {
      this.showPrivacyModal = false;
    }
    this.router.navigate(['/Home']);
  }
}

