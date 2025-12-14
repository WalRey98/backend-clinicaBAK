import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private readonly URL = `${environment.api}/pacientes`;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');
    if (!token) {
      console.error('No token available');
      throw new Error('Token is required');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // -------------------------------------------------------
  // GET /pacientes/  → Listar Pacientes
  // -------------------------------------------------------
  getPacientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/`, {
      headers: this.getAuthHeaders()
    });
  }

  // -------------------------------------------------------
  // POST /pacientes/  → Crear Paciente
  // -------------------------------------------------------
  createPaciente(data: any): Observable<any> {
    return this.http.post<any>(`${this.URL}/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // -------------------------------------------------------
  // GET /pacientes/{id}  → Obtener un Paciente
  // -------------------------------------------------------
  getPaciente(id: number): Observable<any> {
    return this.http.get<any>(`${this.URL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // -------------------------------------------------------
  // PUT /pacientes/{id} → Actualizar Paciente
  // -------------------------------------------------------
  updatePaciente(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.URL}/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // -------------------------------------------------------
  // DELETE /pacientes/{id}  → Eliminar Paciente
  // -------------------------------------------------------
  deletePaciente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.URL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}