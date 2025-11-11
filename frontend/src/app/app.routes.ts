import { Routes } from '@angular/router';
import { BoletasComponent } from './pages/boletas/boletas.component';

import { ClientesListComponent } from './pages/clientes/clientes-list.component';
import { ClienteFormComponent } from './pages/clientes/cliente-form.component';

import { MedidoresListComponent } from './pages/medidores/medidores-list.component';
import { MedidorFormComponent } from './pages/medidores/medidor-form.component';

import { LecturasListComponent } from './pages/lecturas/lecturas-list.component';
import { LecturaFormComponent } from './pages/lecturas/lectura-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'boletas', pathMatch: 'full' },

  { path: 'boletas', component: BoletasComponent },

  // CLIENTES
  { path: 'clientes', component: ClientesListComponent },
  { path: 'clientes/nuevo', component: ClienteFormComponent },
  { path: 'clientes/editar/:id', component: ClienteFormComponent },

  // MEDIDORES
  { path: 'medidores', component: MedidoresListComponent },
  { path: 'medidores/crear', component: MedidorFormComponent },
  { path: 'medidores/editar/:id', component: MedidorFormComponent },

  // ✅ LECTURAS (ARREGLADO)
  { path: 'lecturas', component: LecturasListComponent },   // LISTADO
  { path: 'lecturas/nueva', component: LecturaFormComponent }, // CREAR
  { path: 'lecturas/:id', component: LecturaFormComponent },


  { path: '**', redirectTo: 'boletas' }
];
