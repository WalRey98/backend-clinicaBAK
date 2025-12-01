import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoCirugiaService {

  private readonly URL = `${environment.api}/tipos-cirugia`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');
    if (!token) {
      console.error('No token available');
      throw new Error('Token is required');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getTipos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/`, { headers: this.getAuthHeaders() });
  }

  getTipo(id: number): Observable<any> {
    return this.http.get<any>(`${this.URL}/${id}`, { headers: this.getAuthHeaders() });
  }

  createTipo(data: any): Observable<any> {
    return this.http.post<any>(`${this.URL}/`, data, { headers: this.getAuthHeaders() });
  }

  updateTipo(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.URL}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteTipo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.URL}/${id}`, { headers: this.getAuthHeaders() });
  }
}