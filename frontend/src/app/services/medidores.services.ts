import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Medidor {
  id_medidor: number;
  codigo_medidor: string;
  id_cliente: number;
  direccion_suministro: string;
  estado: boolean;
}

export interface MedidorCreate {
  codigo_medidor: string;
  id_cliente: number;
  direccion_suministro: string;
  estado: boolean;
}

@Injectable({ providedIn: 'root' })
export class MedidoresService {
  private base = `${environment.apiBase}/api/medidores`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Medidor[]>(this.base);
  }

  get(id: number) {
    return this.http.get<Medidor>(`${this.base}/${id}`);
  }

  crear(data: MedidorCreate) {
    return this.http.post<Medidor>(this.base, data);
  }

  actualizar(id: number, data: MedidorCreate) {
    return this.http.put<Medidor>(`${this.base}/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}
