import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LecturaCreate {
  id_medidor: number;
  anio: number;
  mes: number;
  lectura_kwh: number;
  observacion?: string | null; // opcional
}

export interface LecturaOut {
  id_lectura: number;
  id_medidor: number;
  anio: number;
  mes: number;
  lectura_kwh: number;
  observacion?: string | null; // opcional
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class LecturasService {
  private base = `${environment.apiBase}/api/lecturas`;

  constructor(private http: HttpClient) {}

  /** Crea una lectura */
  crear(data: LecturaCreate): Observable<LecturaOut> {
    return this.http.post<LecturaOut>(this.base, data);
  }

  /**
   * Lista lecturas por medidor (ordenadas desc por año/mes según backend).
   * Reemplaza al antiguo método `historial(...)`.
   */
  listarPorMedidor(id_medidor: number): Observable<LecturaOut[]> {
    return this.http.get<LecturaOut[]>(`${this.base}/por-medidor/${id_medidor}`);
  }

  // ---------- Helpers opcionales (útiles para filtros o UI) ----------

  /**
   * Lista todas con filtros opcionales de año/mes.
   * Útil si en el futuro agregas una vista general con filtros.
   */
  listar(anio?: number, mes?: number): Observable<LecturaOut[]> {
    let params = new HttpParams();
    if (anio != null) params = params.set('anio', String(anio));
    if (mes != null) params = params.set('mes', String(mes));
    return this.http.get<LecturaOut[]>(this.base, { params });
  }

  /** Obtiene la última lectura registrada para un medidor (si tu backend lo expone). */
  ultimaPorMedidor(id_medidor: number): Observable<LecturaOut | null> {
    return this.http.get<LecturaOut | null>(`${this.base}/ultima/${id_medidor}`);
  }
}
