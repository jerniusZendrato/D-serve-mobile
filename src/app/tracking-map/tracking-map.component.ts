import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-tracking-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './tracking-map.component.html',
  styleUrl: './tracking-map.component.css'
})
export class TrackingMapComponent {
// Pusat wilayah
  center: google.maps.LatLngLiteral = { lat: -6.2442, lng: 106.8000 };

  // Posisi helper default
  helperPosition: google.maps.LatLngLiteral = { lat: -6.2442, lng: 106.8000 };

  // Opsi map (dibatasi ke area tertentu)
  options: google.maps.MapOptions = {
    zoom: 15,
    minZoom: 14,
    maxZoom: 18,
    restriction: {
      latLngBounds: {
        north: -6.20,
        south: -6.28,
        east: 106.85,
        west: 106.75,
      },
      strictBounds: true,
    },
    streetViewControl: false,
    mapTypeControl: false,
  };

  updateHelper(lat: number, lng: number) {
    this.helperPosition = { lat, lng };
    this.center = { lat, lng };
  }
}