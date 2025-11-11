import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {Medidor, MedidoresService} from '../../services/medidores.service';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-medidores-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './medidores-list.component.html'
})
export class MedidoresListComponent implements OnInit {
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private medidoresSvc = inject(MedidoresService);
  private clientesSvc = inject(ClientesService);

  displayedColumns = ['codigo', 'cliente', 'direccion', 'estado', 'acciones'];
  data: any[] = [];
  clientesIndex = new Map<number, string>();

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarMedidores();
  }

  private cargarMedidores(): void {
    this.medidoresSvc.listar().subscribe({
      next: (res: any[]) => (this.data = res || []),
      error: () => {
        this.data = [];
        this.snack.open('Error al cargar medidores', 'Cerrar', { duration: 2500 });
      }
    });
  }

  private cargarClientes(): void {
    this.clientesSvc.listar().subscribe({
      next: (res: any[]) => {
        (res || []).forEach(c => this.clientesIndex.set(c.id_cliente, c.nombre_razon));
      },
      error: () => {
        this.snack.open('No se pudieron cargar los clientes', 'Cerrar', { duration: 2500 });
      }
    });
  }

  nombreCliente(idCliente: number): string {
    return this.clientesIndex.get(idCliente) ?? '';
  }

  editar(m: Medidor) {
    this.router.navigate(['/medidores/editar', m.id_medidor]);
  }


  eliminar(m: any): void {
    if (!m?.id_medidor) return;
    if (!confirm(`¿Eliminar medidor ${m.codigo_medidor}?`)) return;

    this.medidoresSvc.eliminar(m.id_medidor).subscribe({
      next: () => {
        this.snack.open('Eliminado', 'OK', { duration: 2000 });
        this.cargarMedidores();
      },
      error: (e) => {
        const msg = e?.error?.detail || 'No se pudo eliminar';
        this.snack.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
