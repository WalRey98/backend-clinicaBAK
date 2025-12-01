import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { EMPTY } from 'rxjs';

interface JwtPayload {
  exp?: number;
  [key: string]: any;
}

@Injectable()
export class InjectSessionInterceptor implements HttpInterceptor {
  private isLoggingOut = false;

  constructor(private cookieService: CookieService, private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.cookieService.get('token');
    let clonedRequest = request;

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < now) {
          console.warn('🔴 Token expirado localmente');
          this.handleExpiredSession();
          return EMPTY;
        }

        clonedRequest = request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('❌ Error al decodificar token:', err);
        this.handleExpiredSession();
        return EMPTY;
      }
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // ⚠️ Si es un error de autenticación desde login o registro, lo dejamos pasar
        const isAuthRoute =
          request.url.includes('/auth/login') ||
          request.url.includes('/auth/register') ||
          request.url.includes('/auth/verify') ||
          request.url.includes('/auth/reset');

        if (error.status === 451) {
          Swal.fire({
            icon: 'error',
            title: 'Usuario no encontrado',
            text: 'Verifica tus datos e inténtalo nuevamente.',
            confirmButtonText: 'Aceptar',
          });
          return EMPTY;
        }

        // 🔹 Manejo personalizado de tu código 452
        if (error.status === 452) {
          Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            text: 'Usuario o contraseña inválidos. Verifica tus datos e inténtalo nuevamente.',
            confirmButtonText: 'Aceptar',
          });
          return EMPTY;
        }

        if (error.status === 453) {
          Swal.fire({
            icon: 'error',
            title: 'Usuario no Permitido',
            text: 'Solo se permiten usuarios Administradores de la Plataforma.',
            confirmButtonText: 'Aceptar',
          });
          return EMPTY;
        }


        if (error.status === 455) {
          Swal.fire({
            icon: 'error',
            title: 'Usuario Inactivo',
            text: 'Contactar con el Administrador de la Plataforma.',
            confirmButtonText: 'Aceptar',
          });
          return EMPTY;
        }

        // 🔹 Token inválido / rechazado por backend
        if ((error.status === 401 || error.status === 403) && !isAuthRoute) {
          console.warn('🔴 Token rechazado por el backend');
          this.handleExpiredSession();
          return EMPTY;
        }

        // Otros errores (404, 500, etc.) → que sigan su curso normal
        return EMPTY;
      })
    );
  }

  private handleExpiredSession(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;

    try {
      this.cookieService.delete('token', '/', undefined, true, 'Strict');
    } catch (e) {
      console.error('Error eliminando cookie:', e);
    }

    sessionStorage.clear();
    localStorage.clear();

    Swal.fire({
      icon: 'warning',
      title: 'Sesión expirada',
      text: 'Tu sesión ha finalizado por seguridad. Debes volver a iniciar sesión.',
      confirmButtonText: 'Iniciar sesión',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      this.router.navigate(['/auth/signin']).then(() => {
        this.isLoggingOut = false;
        return EMPTY;
      });
    });
  }
}