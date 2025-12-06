import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientesService, ClienteCreate } from '../../services/clientes.service';
import { rutPersonaValidator, formatRut } from '../../shared/validators/rut.validator';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule,
    MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  id?: number;
  titulo = 'Nuevo Cliente';

  form = this.fb.group({
    rut: ['', [Validators.required, rutPersonaValidator()]],
    nombre_razon: ['', [Validators.required, Validators.minLength(3)]],
    email_contacto: ['', [Validators.email]],
    telefono: [''],
    direccion_facturacion: [''],
    estado: [true]
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) || undefined;
    if (this.id) {
      this.titulo = 'Editar Cliente';
      this.svc.get(this.id).subscribe({
        next: c => this.form.patchValue(c),
        error: e => this.snack.open(e?.error?.detail || 'No se pudo cargar', 'Cerrar', { duration: 3000 })
      });
    }
  }

  normalizarRut() {
    const raw = this.form.value.rut || '';
    this.form.patchValue({ rut: formatRut(String(raw)) }, { emitEvent: false });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Revisa los campos', 'Cerrar', { duration: 2500 });
      return;
    }
    const payload = this.form.value as ClienteCreate;

    const req$ = this.id
      ? this.svc.actualizar(this.id, payload)
      : this.svc.crear(payload);

    req$.subscribe({
      next: _ => {
        this.snack.open('Guardado correctamente', 'OK', { duration: 2000 });
        this.router.navigate(['/clientes']);
      },
      error: e => this.snack.open(e?.error?.detail || 'Error al guardar', 'Cerrar', { duration: 3000 })
    });
  }
}
