import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CirugiasService {
  
  private readonly BASE_URL = `${environment.api}/cirugias`; 

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // --- LECTURA ---
  listarCirugias(pabellonId?: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    let url = `${this.BASE_URL}/`; 
    if (pabellonId) url += `?pabellon_id=${pabellonId}`;
    return this.http.get<any[]>(url, { headers });
  }

  getCirugias(): Observable<any[]> { return this.listarCirugias(); }

  // --- ESCRITURA ---
  crearCirugia(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.BASE_URL}/`, data, { headers });
  }

  actualizarCirugia(id: number, data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.BASE_URL}/${id}`, data, { headers });
  }
  
  // Alias
  createCirugia(data: any) { return this.crearCirugia(data); }
  updateCirugia(id: number, data: any) { return this.actualizarCirugia(id, data); }

  // --- ACCIONES ---
  updateEstado(id: number, nuevoEstado: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.BASE_URL}/${id}/estado`, { nuevo_estado: nuevoEstado }, { headers });
  }

  eliminarCirugia(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.BASE_URL}/${id}`, { headers });
  }
  deleteCirugia(id: number) { return this.eliminarCirugia(id); }

  actualizarExtraTime(id: number, minutos: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.BASE_URL}/${id}/extra-time`, { extra_time: minutos }, { headers });
  }

  // 🔥 ESTA ES LA FUNCIÓN QUE FALTABA Y DABA ERROR 🔥
  moverCirugia(id: number, nuevoPabellonId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    // Usamos PATCH enviando solo el pabellon_id
    return this.http.patch(`${this.BASE_URL}/${id}`, { pabellon_id: nuevoPabellonId }, { headers });
  }

  actualizarEstados(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.api}/cirugias/actualizar-estados`, {}, { headers });
  }
}