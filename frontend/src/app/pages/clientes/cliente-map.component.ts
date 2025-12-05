import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { MedidoresService, Medidor } from '../../services/medidores.service';
import { ClientesService, Cliente } from '../../services/clientes.service';

@Component({
  selector: 'app-cliente-map',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cliente-map.component.html',
  styleUrls: ['./cliente-map.component.scss'],
})
export class ClienteMapComponent implements OnInit, AfterViewInit, OnDestroy {

  private map?: L.Map;
  medidores: Medidor[] = [];
  cliente?: Cliente;
  idCliente!: number;

  constructor(
    private route: ActivatedRoute,
    private medidoresService: MedidoresService,
    private clientesService: ClientesService,
  ) {}

  ngOnInit(): void {
    this.idCliente = Number(this.route.snapshot.paramMap.get('id'));

    this.clientesService.get(this.idCliente).subscribe(c => {
      this.cliente = c;
    });

    this.medidoresService.listarPorCliente(this.idCliente).subscribe(meds => {
      this.medidores = meds;
      this.initMarkers();          // si el mapa ya está creado, dibuja
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map('map-medidores').setView([-35.43, -71.66], 12); // Talca aprox

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.initMarkers();
  }

  private initMarkers(): void {
    console.log("Medidores recibidos:", this.medidores);

    if (!this.map || !this.medidores?.length) return;

    this.medidores.forEach((m: Medidor) => {
      console.log("Medidor coors:", m.codigo_medidor, m.latitud, m.longitud);

      if (m.latitud == null || m.longitud == null) {
        console.warn("Sin coordenadas, no se dibuja:", m);
        return;
      }

      const marker = L.marker([m.latitud, m.longitud]).addTo(this.map!);
      marker.bindPopup(`
      <b>${m.codigo_medidor}</b><br>
      ${m.direccion_suministro}<br>
      Estado: ${m.estado ? 'Activo' : 'Inactivo'}<br>
      Cliente: ${this.cliente?.nombre_razon ?? ''}
    `);
    });
  }


  ngOnDestroy(): void {
    this.map?.remove();
  }
}
