import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { LecturasService, LecturaOut } from '../../services/lecturas.service';

@Component({
  selector: 'app-lectura-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './lectura-list.component.html'
})
export class LecturaListComponent {
  private svc = inject(LecturasService);

  idMedidor?: number;
  data: LecturaOut[] = [];
  displayedColumns = ['fecha', 'lectura', 'observacion']; // ⬅️ incluye observación

  buscar() {
    const id = Number(this.idMedidor);
    if (!id) { this.data = []; return; }
    this.svc.historial(id).subscribe({
      next: (rows) => this.data = rows ?? [],
      error: () => this.data = []
    });
  }
}
