import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, NavigationEnd } from '@angular/router';
import { AppService } from '../../services/app.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@shared/services/user.service';

import { Subscription } from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'header',
  templateUrl: './header.html',
  animations: [
    trigger('toggleAnimation', [
      transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
      transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
    ]),
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  store: any;
  search = false;
  user: any | null = null;
  notifications: any[] = [];
  private notificationSubscription: Subscription = new Subscription();


  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
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

  ngOnInit(): void {

    this.setActiveDropdown();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveDropdown();
      }
    });

    this.loadUserData();
  }

  loadUserData(): void {
    try {
      const storedUser = this.userService.getUserData();
      if (storedUser) {
        this.userService.getUserById(storedUser.id).subscribe(
          (response) => {
            this.user = response;
          },
          (error) => {
            console.error('Error fetching user data', error);
          }
        );
      } else {
        console.error('User ID is not defined or user data is null');
      }
    } catch (error) {
      console.error('Error in loadUserData:', error);
    }
  }


  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  setActiveDropdown() {
    const selector = document.querySelector('ul.horizontal-menu a[routerLink="' + window.location.pathname + '"]');
    if (selector) {
      selector.classList.add('active');
      const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
      for (let i = 0; i < all.length; i++) {
        all[0]?.classList.remove('active');
      }
      const ul: any = selector.closest('ul.sub-menu');
      if (ul) {
        let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
        if (ele) {
          ele = ele[0];
          setTimeout(() => {
            ele?.classList.add('active');
          });
        }
      }
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

  logout() {
    this.userService.clearUserData();
    this.router.navigate(['/']);
  }

  lockScreen() {
    this.router.navigate(['/auth/lockscreen']);
  }
}