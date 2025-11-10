import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface LecturaCreate {
  id_medidor: number;
  anio: number;
  mes: number;
  lectura_kwh: number;
}

export interface LecturaOut {
  id_lectura: number;
  id_medidor: number;
  anio: number;
  mes: number;
  lectura_kwh: number;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class LecturasService {
  private base = `${environment.apiBase}/api/lecturas`;
  constructor(private http: HttpClient) {}

  crear(data: LecturaCreate) {
    return this.http.post<LecturaOut>(this.base, data);
  }

  listarPorMedidor(id_medidor: number) {
    return this.http.get<LecturaOut[]>(`${this.base}/por-medidor/${id_medidor}`);
  }

  // Alias que usa tu componente:
  historial(id_medidor: number) {
    return this.listarPorMedidor(id_medidor);
  }
}
