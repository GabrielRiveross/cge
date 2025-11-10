import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientesService, Cliente } from '../../services/clientes.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  templateUrl: './clientes-list.component.html'
})
export class ClientesListComponent implements OnInit {
  private svc = inject(ClientesService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  displayedColumns = ['rut', 'nombre', 'email', 'estado', 'acciones'];
  data: Cliente[] = [];
  q = localStorage.getItem('filtroClientes') || '';

  ngOnInit(): void {
    this.buscar();
  }

  buscar() {
    const q = (this.q || '').trim();
    this.svc.listar(q).subscribe({
      next: (res) => {
        this.data = res;
      },
      error: () => {
        this.data = [];
        this.snack.open('Error al cargar', 'Cerrar', {duration: 3000});
      }
    });
  }

  crear() {
    this.router.navigate(['/clientes/nuevo']);
  }

  editar(c: Cliente) {
    this.router.navigate(['/clientes/editar', c.id_cliente]);
  }

  eliminar(c: Cliente) {
    if (!confirm(`¿Eliminar cliente ${c.nombre_razon}?`)) return;
    this.svc.eliminar(c.id_cliente).subscribe({
      next: _ => {
        this.snack.open('Eliminado', 'OK', {duration: 2000});
        this.buscar(); // <- vuelve a pedir al backend (consistencia garantizada)
      },
      error: e => {
        this.snack.open(e?.error?.detail || 'No se pudo eliminar', 'Cerrar', {duration: 3000});
      }
    });
  }
}
