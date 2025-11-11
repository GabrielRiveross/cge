import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { LecturasService, LecturaOut } from '../../services/lecturas.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lecturas-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './lecturas-list.component.html',
  styleUrls: ['./lecturas-list.component.scss'],
})
export class LecturasListComponent {
  private svc = inject(LecturasService);

  idMedidor?: number;
  data: LecturaOut[] = [];
  // Asegúrate de que estas columnas existan en tu HTML de la tabla
  displayedColumns = ['fecha', 'lectura', 'observacion'];

  buscar(): void {
    const id = Number(this.idMedidor);
    if (!id || Number.isNaN(id)) {
      this.data = [];
      return;
    }

    this.svc.listarPorMedidor(id).subscribe({
      next: (rows: LecturaOut[]) => (this.data = rows ?? []),
      error: () => (this.data = []),
    });
  }

  trackByLectura(index: number, row: LecturaOut): string | number {
    // Si no tienes id_lectura, usa una clave compuesta
    return row?.id_lectura ?? `${row?.id_medidor}-${row?.anio}-${row?.mes}-${index}`;
  }
}
