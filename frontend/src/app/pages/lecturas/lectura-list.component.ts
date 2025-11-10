import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { LecturasService, LecturaOut} from '../../services/lecturas.service';
import { MedidoresService } from '../../services/medidores.service';

@Component({
  selector: 'app-lecturas-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './lecturas-list.component.html'
})
export class LecturasListComponent {
  private svc = inject(LecturasService);
  private medidoresSvc = inject(MedidoresService);
  private snack = inject(MatSnackBar);

  displayedColumns = ['fecha', 'lectura', 'observacion'];
  data: LecturaOut[] = [];

  // Búsqueda por ID de medidor
  idMedidor?: number;

  buscar(): void {
    const id = Number(this.idMedidor);
    if (!id) {
      this.snack.open('Ingresa el ID del medidor', 'Cerrar', { duration: 2000 });
      return;
    }
    this.svc.listarPorMedidor(id).subscribe({
      next: (res) => this.data = res || [],
      error: (e) => this.showErr(e, 'Error al cargar lecturas')
    });
  }



  private showErr(e: any, fallback: string) {
    const detail = e?.error?.detail;
    let msg = fallback;
    if (typeof detail === 'string') msg = detail;
    else if (Array.isArray(detail)) msg = detail.map((x: any) => x?.msg || JSON.stringify(x)).join(' • ');
    else if (e?.error) msg = JSON.stringify(e.error);
    this.snack.open(msg, 'Cerrar', { duration: 3500 });
  }
}
