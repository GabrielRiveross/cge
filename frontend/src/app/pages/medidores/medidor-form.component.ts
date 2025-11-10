import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MedidoresService, MedidorCreate, Medidor } from '../../services/medidores.service';
import { ClientesService, Cliente } from '../../services/clientes.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-medidor-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule,
    MatButtonModule, MatSnackBarModule, MatSelectModule
  ],
  templateUrl: './medidor-form.component.html'
})
export class MedidorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(MedidoresService);
  private clientesSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  id?: number;
  titulo = 'Nuevo Medidor';
  clientes: Cliente[] = [];

  form = this.fb.group({
    // ↓↓↓ mínimo 1 para evitar bloqueos por longitud
    codigo_medidor: ['', [Validators.required, Validators.minLength(1)]],
    id_cliente: [null as unknown as number, [Validators.required]],
    direccion_suministro: ['', [Validators.required]],
    estado: [true]
  });

  ngOnInit(): void {
    // Clientes para el select
    this.clientesSvc.listar().subscribe({
      next: (cs: Cliente[]) => this.clientes = cs || [],
      error: () => {}
    });

    // Si viene :id => edición por ID
    this.id = Number(this.route.snapshot.paramMap.get('id')) || undefined;
    if (this.id) {
      this.titulo = 'Editar Medidor';
      this.svc.get(this.id).subscribe({
        next: (m: Medidor) => {
          this.form.patchValue({
            codigo_medidor: m.codigo_medidor,
            id_cliente: m.id_cliente,
            direccion_suministro: m.direccion_suministro,
            estado: m.estado
          });
        },
        error: () => {
          this.snack.open('Medidor no encontrado', 'Cerrar', { duration: 2500 });
          this.router.navigate(['/medidores']);
        }
      });
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Revisa los campos', 'Cerrar', { duration: 2500 });
      return;
    }
    const payload: MedidorCreate = this.form.value as MedidorCreate;

    let req$: Observable<Medidor>;
    if (this.id) {
      req$ = this.svc.actualizar(this.id, payload);
    } else {
      req$ = this.svc.crear(payload);
    }

    req$.subscribe({
      next: () => {
        this.snack.open('Guardado correctamente', 'OK', { duration: 1800 });
        this.router.navigate(['/medidores']); // ← vuelve a medidores
      },
      error: (e) => {
        const msg = e?.error?.detail || 'Error al guardar';
        this.snack.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
