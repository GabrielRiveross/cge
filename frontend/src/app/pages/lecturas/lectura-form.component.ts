import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LecturasService, LecturaCreate } from '../../services/lecturas.service';
import { MedidoresService } from '../../services/medidores.service';

@Component({
  selector: 'app-lectura-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './lectura-form.component.html'
})
export class LecturaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private lecturasSvc = inject(LecturasService);
  private medidoresSvc = inject(MedidoresService);

  medidores: any[] = [];
  cargando = false;

  form = this.fb.group({
    id_medidor: [null as number | null, [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.required]],
    mes: [new Date().getMonth() + 1, [Validators.required]],
    lectura_kwh: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    // Cargar medidores para el select
    this.medidoresSvc.listar().subscribe({
      next: (res: any[]) => this.medidores = res || [],
      error: () => this.snack.open('No se pudieron cargar los medidores', 'Cerrar', { duration: 2500 })
    });
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Completa los campos requeridos', 'Cerrar', { duration: 2500 });
      return;
    }

    const payload = {
      id_medidor: Number(this.form.value.id_medidor),
      anio: Number(this.form.value.anio),
      mes: Number(this.form.value.mes),
      lectura_kwh: Number(this.form.value.lectura_kwh)
    } as LecturaCreate;

    this.cargando = true;
    this.lecturasSvc.crear(payload).subscribe({
      next: _ => {
        this.cargando = false;
        this.snack.open('Lectura registrada', 'OK', { duration: 2000 });
      },
      error: e => {
        this.cargando = false;
        const detail = e?.error?.detail;
        const msg = typeof detail === 'string'
          ? detail
          : Array.isArray(detail) ? detail.map((x: any) => x?.msg || JSON.stringify(x)).join(' • ')
            : 'No se pudo registrar la lectura';
        this.snack.open(msg, 'Cerrar', { duration: 3500 });
      }
    });
  }
}
