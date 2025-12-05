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

import {
  MedidoresService,
  MedidorCreate,
  Medidor,
} from '../../services/medidores.service';
import {
  ClientesService,
  Cliente,
} from '../../services/clientes.service';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-medidor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './medidor-form.component.html',
})
export class MedidorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(MedidoresService);
  private clientesSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  /** ID del medidor (modo edición). Si es undefined => modo creación */
  id?: number;
  titulo = 'Nuevo Medidor';
  clientes: Cliente[] = [];

  form = this.fb.group({
    codigo_medidor: ['', [Validators.required, Validators.minLength(1)]],
    id_cliente: [null as unknown as number, [Validators.required]],
    direccion_suministro: ['', [Validators.required]],
    estado: [true],
    latitud: [
      null as unknown as number,
      [Validators.min(-90), Validators.max(90)],
    ],
    longitud: [
      null as unknown as number,
      [Validators.min(-180), Validators.max(180)],
    ],
  });

  ngOnInit(): void {
    // 1) Cargar clientes del combo
    this.clientesSvc.listar().subscribe({
      next: (cs) => (this.clientes = cs || []),
      error: () => {
        this.snack.open('Error al cargar clientes', 'Cerrar', {
          duration: 3000,
        });
      },
    });

    // 2) Detectar si hay :id válido (numérico)
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsed = idParam !== null ? Number(idParam) : NaN;

    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
      // Sin id o id inválido -> modo crear
      this.id = undefined;
      this.titulo = 'Nuevo Medidor';
      return;
    }

    this.id = parsed;
    this.titulo = 'Editar Medidor';

    // 3) Cargar datos del medidor
    this.svc.get(this.id).subscribe({
      next: (m: Medidor) => {
        this.form.patchValue({
          codigo_medidor: m.codigo_medidor,
          id_cliente: m.id_cliente,
          direccion_suministro: m.direccion_suministro,
          estado: m.estado,
          // 👇 también cargamos coordenadas
          latitud: m.latitud,
          longitud: m.longitud,
        });
      },
      error: (error) => {
        console.error('Error al cargar medidor:', error);

        const errorMsg =
          error.status === 404
            ? 'Medidor no encontrado'
            : 'Error al cargar los datos del medidor';

        this.snack.open(errorMsg, 'Cerrar', { duration: 5000 });

        if (error.status === 404) {
          this.router.navigate(['/medidores']);
        }
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Revisa los campos', 'Cerrar', { duration: 2500 });
      return;
    }

    const payload: MedidorCreate = this.form.value as MedidorCreate;
    const idCliente = payload.id_cliente; // lo usamos luego para ir al mapa
    let req$: Observable<Medidor>;

    if (this.id) {
      // Edición
      req$ = this.svc.actualizar(this.id, payload);
    } else {
      // Creación
      req$ = this.svc.crear(payload);
    }

    req$.subscribe({
      next: () => {
        this.snack.open('Guardado correctamente', 'OK', { duration: 1800 });

        // 👇 Ir al mapa del cliente para ver el/los medidores como puntos
        if (idCliente) {
          this.router.navigate(['/clientes', idCliente, 'mapa']);
        } else {
          // fallback por si acaso
          this.router.navigate(['/medidores']);
        }
      },
      error: (e) => {
        const msg = e?.error?.detail || 'Error al guardar';
        this.snack.open(msg, 'Cerrar', { duration: 3000 });
      },
    });
  }
}
