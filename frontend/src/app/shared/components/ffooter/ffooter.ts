import { NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-ffooter',
  templateUrl: './ffooter.html',
})
export class FfooterComponent {
  // showTermsModal: boolean = false;
  // showPrivacyModal: boolean = false;
  currYear: number = new Date().getFullYear();

  @Input() showTermsModal = false;
  @Input() showPrivacyModal = false;
  
  @Output() close = new EventEmitter<'terms' | 'privacy'>();

  constructor(private router: Router) {}

  // Navega a /terms o /privacy para que LandingComponent los maneje
  openModal(type: 'terms' | 'privacy') {
    this.router.navigate(['/' + type]);
  }

  // Emitir evento de cierre del modal
  closeModal(type: 'terms' | 'privacy') {
    this.close.emit(type);
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