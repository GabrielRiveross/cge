import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { BoletasService } from '../../services/boletas.service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-boletas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,
    // MatIconModule
  ],
  templateUrl: './boletas.component.html'
})
export class BoletasComponent implements OnInit {
  idCliente = Number(localStorage.getItem('ultimoCliente')) || 1;
  anio = new Date().getFullYear();
  mes = new Date().getMonth() + 1;
  boletas: any[] = [];
  loading = false;
  msg = '';

  constructor(private boletasSvc: BoletasService) {}

  ngOnInit(): void {
    this.listar();
  }

  guardarPref() {
    localStorage.setItem('ultimoCliente', String(this.idCliente));
  }

  listar() {
    this.loading = true;
    this.boletasSvc.listar(this.idCliente || undefined).subscribe({
      next: data => { this.boletas = data; this.loading = false; },
      error: err => { this.msg = err?.error?.detail || 'Error listando boletas'; this.loading = false; }
    });
  }

  generar() {
    if (!this.idCliente || !this.anio || !this.mes) { this.msg = 'Completa los campos'; return; }
    this.loading = true;
    this.boletasSvc.generar({ id_cliente: this.idCliente, anio: this.anio, mes: this.mes }).subscribe({
      next: _ => { this.msg = 'Boleta generada'; this.listar(); this.loading = false; },
      error: err => { this.msg = err?.error?.detail || 'Error generando boleta'; this.loading = false; }
    });
  }

  descargar(id_boleta: number) {
    this.boletasSvc.descargarPdf(id_boleta).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boleta_${this.anio}_${String(this.mes).padStart(2, '0')}_cliente_${this.idCliente}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: err => { this.msg = err?.error?.detail || 'Error descargando PDF'; }
    });
  }
}
