import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CirugiasService {

  private readonly URL = `${environment.api}/cirugias`;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');

    if (!token) {
      console.error('No token available');
      throw new Error('Token is required');
    }

    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // 1. LISTAR CIRUGÍAS (opcional: filtrar por pabellón y fecha)
  listarCirugias(pabellon_id?: number, fecha?: string): Observable<any[]> {
    let params = new HttpParams();

    if (pabellon_id) params = params.set('pabellon_id', pabellon_id);
    if (fecha)       params = params.set('fecha', fecha);

    return this.http.get<any[]>(this.URL, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  // 2. LEER CIRUGÍA
  obtenerCirugia(id: number): Observable<any> {
    return this.http.get<any>(`${this.URL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // 3. CREAR CIRUGÍA
  crearCirugia(body: any): Observable<any> {
    const payload = { ...body };
    delete payload.id; // por si acaso
    return this.http.post<any>(this.URL, payload, {
      headers: this.getAuthHeaders()
    });
}

  // 4. ACTUALIZAR CIRUGÍA
  actualizarCirugia(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.URL}/${id}`, body, {
      headers: this.getAuthHeaders()
    });
  }

  // 5. CAMBIAR ESTADO
  cambiarEstado(id: number, nuevo_estado: string): Observable<any> {
    return this.http.patch<any>(`${this.URL}/${id}/estado`, {
      nuevo_estado
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // 6. ACTUALIZAR EXTRA_TIME
  actualizarExtraTime(id: number, extra_time: number): Observable<any> {
    return this.http.patch<any>(`${this.URL}/${id}/extra-time`, {
      extra_time
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // 7. MOVER CIRUGÍA A OTRO PABELLÓN
  moverCirugia(id: number, pabellon_id: number): Observable<any> {
    return this.http.patch<any>(
        `${this.URL}/${id}`,
        { pabellon_id },
        { headers: this.getAuthHeaders() }
    );
}

  // 8. "ELIMINAR" CIRUGÍA → marcar como SUSPENDIDA
  eliminarCirugia(id: number): Observable<any> {
    return this.cambiarEstado(id, 'SUSPENDIDA');
  }

  // 9. ACTUALIZAR ESTADOS
  actualizarEstados(): Observable<any> {
  return this.http.post<any>(`${this.URL}/actualizar-estados`, {}, {
    headers: this.getAuthHeaders()
  });
}
}