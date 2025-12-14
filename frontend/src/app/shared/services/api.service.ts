import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ajusta si tu import es @environments/environment
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private baseUrl = `${environment.api}`;

    constructor(private http: HttpClient, private cookieService: CookieService) { }

    // Helper privado para obtener el token
    private getAuthHeaders(): HttpHeaders {
        const token = this.cookieService.get('token');
        if (!token) {
            console.warn('No token available - Requests might fail');
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
    // DASHBOARD (Nuevo)
    // --------------------------
    getDashboardResumen(): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.get<any>(`${this.baseUrl}/dashboard/resumen`, { headers });
    }

    // --------------------------
    // PABELLONES CRUD
    // --------------------------
    getPabellones(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.baseUrl}/pabellones/`, { headers });
    }

    getPabellonById(id: number): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.get<any>(`${this.baseUrl}/pabellones/${id}`, { headers });
    }

    createPabellon(data: any): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.post<any>(`${this.baseUrl}/pabellones/`, data, { headers });
    }

    updatePabellon(id: number, data: any): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.put<any>(`${this.baseUrl}/pabellones/${id}`, data, { headers });
    }

    deletePabellon(id: number): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.delete<any>(`${this.baseUrl}/pabellones/${id}`, { headers });
    }

    // --------------------------
    // PACIENTES
    // --------------------------
    getPacientes(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.baseUrl}/pacientes/`, { headers });
    }

    // --------------------------
    // TIPOS DE CIRUGÍA
    // --------------------------
    getTiposCirugia(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.baseUrl}/tipos-cirugia/`, { headers });
    }

    // --------------------------
    // USUARIOS (Doctores)
    // --------------------------
    getUsuarios(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.baseUrl}/usuarios/`, { headers });
    }
}