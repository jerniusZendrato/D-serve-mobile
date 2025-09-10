import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import L from 'leaflet';

@Component({
  selector: 'app-maps',
  standalone:true,
  imports: [],
  templateUrl: './maps.component.html',
  
  styleUrl: './maps.component.css'
})
export class MapsComponent implements AfterViewInit {

  lat = -2.932112;   // default koordinat pertambangan
  lng = 115.2278778;
  zoom = 16;
  private map!: L.Map;
  private marker!: L.Marker;


  constructor(private route: ActivatedRoute, private router: Router) {}

  goBack(): void {
  // this.location.back();
  this.router.navigate(['//home']);

}
  ngAfterViewInit(): void {
    // Ambil query params jika dikirim dari card
    this.route.queryParams.subscribe(params => {
      this.lat = parseFloat(params['lat']) || this.lat;
      this.lng = parseFloat(params['lng']) || this.lng;
      this.initMap();
    });
  }


  // private initMap(): void {
  //   this.map = L.map('map', {
  //     center: [-6.200, 106.816], // contoh koordinat tambang
  //     zoom: 13
  //   });

  //   // Tile OSM dengan jalan/terrain
  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     maxZoom: 19,
  //     attribution: '© OpenStreetMap contributors'
  //   }).addTo(this.map);

  //   // Marker lokasi tambang
  //   const marker = L.marker([-6.200, 106.816]).addTo(this.map);
  //   marker.bindPopup('<b>Lokasi Tambang</b><br>Ini contoh lokasi.').openPopup();

  //   // Highlight area tambang (polygon contoh)
  //   const polygon = L.polygon([
  //     [-6.201, 106.815],
  //     [-6.201, 106.817],
  //     [-6.199, 106.817],
  //     [-6.199, 106.815]
  //   ], { color: 'orange', fillOpacity: 0.3 }).addTo(this.map);
  //   polygon.bindPopup('Area Tambang');
  // }

  initMap() {
    // Inisialisasi map
    this.map = L.map('map').setView([this.lat, this.lng], this.zoom);

    // Tile OpenStreetMap
   L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
}).addTo(this.map);


    // Marker
    this.marker = L.marker([this.lat, this.lng]).addTo(this.map)
      .bindPopup('Lokasi Pertambangan')
      .openPopup();
  }

}
