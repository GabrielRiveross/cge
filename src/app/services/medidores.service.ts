import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Medidor {
  id_medidor: number;
  codigo_medidor: string;
  id_cliente: number;
  direccion_suministro: string;
  latitud: number | null;
  longitud: number | null;
  estado: boolean;
  cliente_nombre?: string;  // viene en los listados con join a cliente
}

export interface MedidorCreate {
  codigo_medidor: string;
  id_cliente: number;
  direccion_suministro: string;
  latitud: number | null;
  longitud: number | null;
  estado: boolean;
}

@Injectable({ providedIn: 'root' })
export class MedidoresService {
  /**
   * Si environment.apiBase = 'http://localhost:8000',
   * esto queda 'http://localhost:8000/api/medidores'
   */
  private base = `${environment.apiBase}/api/medidores`;

  constructor(private http: HttpClient) {}

  /** Listar todos los medidores */
  listar(): Observable<Medidor[]> {
    return this.http.get<Medidor[]>(this.base);
  }

  /** Listar sólo los medidores de un cliente (para el mapa por cliente) */
  listarPorCliente(idCliente: number): Observable<Medidor[]> {
    // backend: GET /api/medidores/por-cliente/:id_cliente
    return this.http.get<Medidor[]>(`${this.base}/por-cliente/${idCliente}`);
  }

  /** Obtener un medidor por id */
  get(id: number): Observable<Medidor> {
    return this.http.get<Medidor>(`${this.base}/${id}`);
  }

  /** Crear medidor */
  crear(data: MedidorCreate): Observable<Medidor> {
    return this.http.post<Medidor>(this.base, data);
  }

  /** Actualizar medidor */
  actualizar(id: number, payload: MedidorCreate): Observable<Medidor> {
    return this.http.put<Medidor>(`${this.base}/${id}`, payload);
  }

  /** Eliminar medidor */
  eliminar(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}
