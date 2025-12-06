import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LecturasService, LecturaCreate, LecturaOut } from '../../services/lecturas.service';
import { MedidoresService } from '../../services/medidores.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lectura-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule, // ← importante para <mat-icon>
  ],
  templateUrl: './lectura-form.component.html',
  styleUrls: ['./lectura-form.component.scss'],
})
export class LecturaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private lecturasSvc = inject(LecturasService);
  private medidoresSvc = inject(MedidoresService);

  medidores: any[] = [];
  cargando = false;

  historial: LecturaOut[] = [];

  form = this.fb.group({
    id_medidor: [null, [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
    mes: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    lectura_kwh: [null, [Validators.required, Validators.min(0)]],
    observacion: [''],
  });

  ngOnInit(): void {
    // Cargar medidores para el <mat-select>
    this.medidoresSvc.listar().subscribe({
      next: (res: any[]) => (this.medidores = res || []),
      error: () => this.snack.open('No se pudieron cargar los medidores', 'Cerrar', { duration: 2500 }),
    });

    // Al cambiar el medidor, cargar historial usando listarPorMedidor
    this.form.controls.id_medidor.valueChanges.subscribe((id) => {
      if (id != null) this.cargarHistorial(Number(id));
      else this.historial = [];
    });
  }

  private cargarHistorial(id_medidor: number): void {
    this.lecturasSvc.listarPorMedidor(id_medidor).subscribe({
      next: (res: LecturaOut[]) => (this.historial = res ?? []),
      error: () => {
        this.historial = [];
        this.snack.open('No se pudo cargar el historial', 'Cerrar', { duration: 2500 });
      },
    });
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Completa los campos requeridos', 'Cerrar', { duration: 2500 });
      return;
    }

    const v = this.form.getRawValue();

    const payload: LecturaCreate = {
      id_medidor: Number(v.id_medidor),
      anio: Number(v.anio),
      mes: Number(v.mes),
      lectura_kwh: Number(v.lectura_kwh),
      // construcción segura (evita error por toString en null/undefined)
      observacion: `${v.observacion ?? ''}`.trim() || null,
    };

    this.cargando = true;
    this.lecturasSvc.crear(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.snack.open('Lectura registrada', 'OK', { duration: 2000 });

        const id = Number(this.form.value.id_medidor);
        if (id) this.cargarHistorial(id);

        // Resetea los campos de entrada de lectura y observación
        this.form.patchValue({ lectura_kwh: null, observacion: '' });
      },
      error: (e) => {
        this.cargando = false;
        const detail = e?.error?.detail;
        const msg =
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((x: any) => x?.msg || JSON.stringify(x)).join(' • ')
              : 'No se pudo registrar la lectura';
        this.snack.open(msg, 'Cerrar', { duration: 3500 });
      },
    });
  }

  trackByMedidor(index: number, m: any) {
    return m?.id_medidor ?? index;
  }

  trackByHistorial(index: number, l: LecturaOut) {
    return l ? `${l.id_medidor}-${l.anio}-${l.mes}` : index;
  }
}
