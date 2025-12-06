import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import * as L from 'leaflet';
import { MedidoresService, Medidor } from '../../services/medidores.service';

@Component({
  selector: 'app-cliente-medidores-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  templateUrl: './cliente-medidores-mapa.component.html'
})
export class ClienteMedidoresMapaComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private medidoresSvc = inject(MedidoresService);

  idCliente!: number;
  medidores: Medidor[] = [];

  cargando = true;
  sinCoordenadas = false;

  private map?: L.Map;

  ngOnInit(): void {
    // Debe coincidir con la ruta: 'clientes/:id_cliente/medidores-mapa'
    this.idCliente = Number(this.route.snapshot.paramMap.get('id_cliente'));

    this.medidoresSvc.listarPorCliente(this.idCliente).subscribe({
      next: (rows) => {
        // Solo medidores con coordenadas
        this.medidores = rows.filter(
          (m) => m.latitud !== null && m.longitud !== null
        );

        this.cargando = false;
        this.sinCoordenadas = this.medidores.length === 0;

        if (!this.sinCoordenadas) {
          // Esperar un tick para que Angular pinte el <div id="map">
          setTimeout(() => {
            this.initMap(this.medidores);
          }, 0);
        }
      },
      error: (err) => {
        console.error('Error cargando medidores del cliente', err);
        this.cargando = false;
        this.sinCoordenadas = true;
      }
    });
  }

  private initMap(medidoresConCoord: Medidor[]): void {
    if (!medidoresConCoord.length) return;

    const first = medidoresConCoord[0];
    const center: L.LatLngTuple = [first.latitud!, first.longitud!];

    this.map = L.map('map', {
      center,
      zoom: 200,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    const latLngs: L.LatLngTuple[] = [];

    medidoresConCoord.forEach((m) => {
      const coords: L.LatLngTuple = [m.latitud!, m.longitud!];

      const marker = L.marker(coords).addTo(this.map!);
      marker.bindPopup(
        `<b>${m.codigo_medidor}</b><br>
         ${m.direccion_suministro}<br>
         Estado: ${m.estado ? 'Activo' : 'Inactivo'}`
      );

      latLngs.push(coords);
    });

    if (latLngs.length) {
      this.map.fitBounds(latLngs);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
