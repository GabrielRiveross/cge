import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Cliente {
  id_cliente: number;
  rut: string;
  nombre_razon: string;
  email_contacto?: string;
  telefono?: string;
  direccion_facturacion?: string;
  estado: boolean;
}

export interface ClienteCreate {
  rut: string;
  nombre_razon: string;
  email_contacto?: string;
  telefono?: string;
  direccion_facturacion?: string;
  estado: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private base = `${environment.apiBase}/api/clientes`;

  constructor(private http: HttpClient) {}

  listar(q?: string, skip = 0, limit = 50) {
    let url = `${this.base}?skip=${skip}&limit=${limit}`;
    if (q && q.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
    return this.http.get<Cliente[]>(url);
  }

  get(id: number) {
    return this.http.get<Cliente>(`${this.base}/${id}`);
  }

  crear(data: ClienteCreate) {
    return this.http.post<Cliente>(this.base, data);
  }

  actualizar(id: number, data: ClienteCreate) {
    return this.http.put<Cliente>(`${this.base}/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}
