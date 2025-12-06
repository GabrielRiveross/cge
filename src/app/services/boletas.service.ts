import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoletasService {
  private base = `${environment.apiBase}/api/boletas`;

  constructor(private http: HttpClient) {}

  generar(payload: { id_cliente: number; anio: number; mes: number }) {
    return this.http.post<any>(this.base, payload);
  }

  listar(id_cliente?: number) {
    const url = id_cliente ? `${this.base}?id_cliente=${id_cliente}` : this.base;
    return this.http.get<any[]>(url);
  }

  descargarPdf(id_boleta: number) {
    const url = `${this.base}/${id_boleta}/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
