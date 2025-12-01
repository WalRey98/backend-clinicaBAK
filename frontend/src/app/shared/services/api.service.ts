import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private baseUrl = `${environment.api}`;

    constructor(private http: HttpClient, private cookieService: CookieService) { }

    private getAuthHeaders(): HttpHeaders {
        const token = this.cookieService.get('token');
        if (!token) {
            console.error('No token available');
            throw new Error('Token is required'); // Lanza un error si no hay token
        }
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    // --------------------------
    // AUTH
    // --------------------------
    login(username: string, password: string): Observable<any> {
        const body = new URLSearchParams();
        body.set('username', username);
        body.set('password', password);

        return this.http.post(
            `${this.baseUrl}/token`,
            body.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
    }

    // --------------------------
    // PABELLONES CRUD
    // --------------------------
    getPabellones(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.baseUrl}/pabellones/`, { headers });
    }

    // GET /pabellones/{id}
    getPabellonById(id: number): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.get<any>(`${this.baseUrl}/pabellones/${id}`, { headers });
    }

    // POST /pabellones/
    createPabellon(data: any): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.post<any>(`${this.baseUrl}/pabellones/`, data, { headers });
    }

    // PUT /pabellones/{id}
    updatePabellon(id: number, data: any): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.put<any>(`${this.baseUrl}/pabellones/${id}`, data, { headers });
    }

    // DELETE /pabellones/{id}
    deletePabellon(id: number): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.delete<any>(`${this.baseUrl}/pabellones/${id}`, { headers });
    }

    // --------------------------
    // PACIENTES
    // GET /pacientes/
    // --------------------------
    getPacientes(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.baseUrl}/pacientes/`, { headers });
    }

    // --------------------------
    // TIPOS DE CIRUGÍA
    // GET /tipos-cirugia/
    // --------------------------
    getTiposCirugia(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.baseUrl}/tipos-cirugia/`, { headers });
    }

    // --------------------------
    // USUARIOS (para doctores)
    // GET /usuarios/
    // --------------------------
    getUsuarios(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.baseUrl}/usuarios/`, { headers });
    }
}