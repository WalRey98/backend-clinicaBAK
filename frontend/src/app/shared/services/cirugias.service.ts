import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CirugiasService {
  
  // OJO: Asegúrate que environment.api no tenga slash al final (ej: "http://localhost:8000")
  private readonly BASE_URL = `${environment.api}/cirugias`; 

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ==========================================
  //  LECTURA (GET) - Corregido Error 307
  // ==========================================
  
  // Listar todas o filtrar por pabellón
  // Agregamos el '/' final para evitar el Redirect 307
  listarCirugias(pabellonId?: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    let url = `${this.BASE_URL}/`; 
    if (pabellonId) {
      url += `?pabellon_id=${pabellonId}`;
    }
    return this.http.get<any[]>(url, { headers });
  }

  // Obtener todas (alias para compatibilidad)
  getCirugias(): Observable<any[]> {
    return this.listarCirugias();
  }

  // ==========================================
  //  ESCRITURA (POST/PUT)
  // ==========================================

  crearCirugia(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.BASE_URL}/`, data, { headers });
  }

  // Alias para compatibilidad con tu código
  createCirugia(data: any) { return this.crearCirugia(data); }

  actualizarCirugia(id: number, data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.BASE_URL}/${id}`, data, { headers });
  }
  
  // Alias
  updateCirugia(id: number, data: any) { return this.actualizarCirugia(id, data); }

  // ==========================================
  //  ACCIONES CRÍTICAS (PATCH/DELETE)
  //  Aquí arreglamos el Error 404 y 422
  // ==========================================

  // ERROR 422 SOLUCIONADO: Enviamos el JSON exacto que pide el Pydantic schema
  updateEstado(id: number, nuevoEstado: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { nuevo_estado: nuevoEstado }; // Estructura exacta
    return this.http.patch(`${this.BASE_URL}/${id}/estado`, body, { headers });
  }

  // ERROR 404 SOLUCIONADO: Ruta limpia sin duplicar '/cirugias'
  eliminarCirugia(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.BASE_URL}/${id}`, { headers });
  }
  // Alias
  deleteCirugia(id: number) { return this.eliminarCirugia(id); }

  actualizarExtraTime(id: number, minutos: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { extra_time: minutos };
    return this.http.patch(`${this.BASE_URL}/${id}/extra-time`, body, { headers });
  }
  // Alias
  updateExtraTime(id: number, min: number) { return this.actualizarExtraTime(id, min); }

  moverCirugia(id: number, nuevoPabellonId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { pabellon_id: nuevoPabellonId };
    return this.http.patch(`${this.BASE_URL}/${id}`, body, { headers });
  }

  // Endpoint auxiliar para forzar la máquina de estados
  actualizarEstados(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.api}/cirugias/actualizar-estados`, {}, { headers });
  }
}