import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { User } from '@shared/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable(); // Observable para que otros componentes puedan suscribirse

  private readonly URL = `${environment.api}`;

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');
    if (!token) {
      console.error('No token available');
      throw new Error('Token is required'); // Lanza un error si no hay token
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ===================================================
// FASTAPI: USUARIOS CRUD
// ===================================================

// Crear usuario (POST /usuarios/)
createUser(data: any): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.post(`${this.URL}/usuarios/`, data, { headers });
}

// Listar usuarios (GET /usuarios/)
getUsers(): Observable<any[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<any[]>(`${this.URL}/usuarios`, { headers }).pipe(
    map(users => users.map(u => ({
      ...u,
      status: u.es_activo ? 'activo' : 'inactivo'
    })))
  );
}

// Obtener usuario por id (GET /usuarios/:id)
getUserById(id: number): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get<any>(`${this.URL}/usuarios/${id}`, { headers });
}

// Actualizar usuario (PUT /usuarios/:id)
updateUser(id: number, data: any): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.put(`${this.URL}/usuarios/${id}`, data, { headers });
}

// Eliminar usuario (DELETE /usuarios/:id)
deleteUser(id: number): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.delete(`${this.URL}/usuarios/${id}`, { headers });
}

cambiarPassword(currentPass: string, newPass: string) {
  const headers = this.getAuthHeaders();
  return this.http.post(`${this.URL}/usuarios/cambiar-password`, {
    current_password: currentPass,
    new_password: newPass
  }, { headers });
}

resetPassword(id: number, password: string): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.post(
    `${this.URL}/usuarios/${id}/reset-password`,
    { password },
    { headers }
  );
}


  //Local Storage

  setUserData(data: any): void {
    localStorage.setItem('userData', JSON.stringify(data));
    this.userSubject.next(data); // Notifica a todos los suscriptores
  }

  getUserData(): any | null {
    const userData = this.userSubject.value;
    return userData ? userData : JSON.parse(localStorage.getItem('userData') || 'null');
  }

  clearUserData(): void {
    localStorage.removeItem('userData');
    this.userSubject.next(null); // Notifica que el usuario ha sido eliminado
  }

  getToken(): string | null {
    return this.cookieService.get('token') || null;
  }

  setToken(token: string): void {
    this.cookieService.set('token', token, 1, '/'); // 1 day expiration
  }

  searchUsers(query: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.URL}/user/search`, { query }, { headers });
}
  

  updateUserData(user: any): void {
    this.userSubject.next(user);
    this.setUserData(user); // Persistir en localStorage
  }

  // Obtener el usuario actual
  getCurrentUser(): any | null {
    return this.userSubject.value;
  }

  suscribeUser(userId: string): Observable<any> {
    return this.http.post(`${this.URL}/user/${userId}/suscribe`, {});
  }

  sendTip(userId: string, amount: number): Observable<any> {
    return this.http.post(`${this.URL}/user/${userId}/tip`, { amount });
  }

  sendMessage(userId: string, message: string): Observable<any> {
    return this.http.post(`${this.URL}/user/${userId}/message`, { message });
  }

  toggleFollowUser(userId: string): Observable<any> {
    const headers = this.getAuthHeaders(); // Obtener headers con token
    return this.http.post<any>(`${this.URL}/user/follow/${userId}`, {}, { headers });
  }

}