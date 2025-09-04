import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UnitService } from '../service/unit.service';
import { units } from '../models/units.model';
import { LoginService } from '../service/login.service';
import { LoginData } from '../models/login.model';
import { LoadingService } from '../service/loading.service';
import { Console } from 'console';

@Component({
  selector: 'app-unit-input',
  standalone:true,
  imports: [FormsModule,CommonModule ],
  templateUrl: './unit-input.component.html',
  styleUrl: './unit-input.component.css'
})
export class UnitInputComponent implements OnInit{
  constructor(private router: Router,
    private unitService: UnitService,
    private loginservice: LoginService,
    private loadingservice: LoadingService
  ){}
  authData: LoginData | null = null;

  async ngOnInit(): Promise<void> {
    // Panggil method untuk mengambil data saat komponen diinisialisasi
    this.fetchUnits();
    this.authData = await this.loginservice.getToken();
  }

  unitName: string = '';
  goBack() {
    this.router.navigate(['/home']); // kembali ke dashboard
  }
  availableUnits: units[] = [];
  async fetchUnits(): Promise<void> {
    (await this.unitService.getUnits()).subscribe({
      next: (units) => {
        // Data berhasil diambil, simpan ke properti availableUnits
        this.availableUnits = units;
        console.log(this.availableUnits[0].name)
        console.log('Daftar Unit Tersedia:', this.availableUnits);
      },
      error: (err) => {
        // Tangani error jika terjadi
        console.error('Gagal mengambil data unit:', err);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.unitName) {
      console.log('Unit yang diinput:', this.unitName);
      this.loadingservice.show();

      // TODO: Di sini kamu bisa menambahkan logika untuk menyimpan data.
      // Contoh:
      // - Mengirim data ke API menggunakan HttpClient.
      // - Menyimpan data ke localStorage atau session storage.
      // - Menampilkan pesan sukses.

      // Setelah data berhasil disimpan, reset form
      // this.unitName = '';
      

      // this.authData = await this.loginservice.getToken();
      console.log("this.authData?.user.id",this.authData?.user.id)
      console.log('Unit yang diinput:', this.unitName)
      if (this.unitName && this.authData?.user.id) {
        const token = this.authData?.accessToken
        console.log("Token yang dikirim:", token);

      console.log('Mengupdate unit untuk user ID:', this.authData?.user.id, 'dengan unit ID:', this.unitName);

      this.loginservice.putUnit(this.authData?.user.id, this.unitName, token,this.authData).subscribe({
        next: (response) => {
          console.log('Update unit berhasil:', response);
          this.loadingservice.hide();
          this.router.navigate(['/home']);

          // TODO: Tampilkan pesan sukses ke pengguna
        },
        error: (error) => {
          console.error('Gagal mengupdate unit:', error);
          this.loadingservice.hide(); 
          // TODO: Tampilkan pesan error ke pengguna
        }
      });
    } else {
      console.error('User ID atau Unit ID tidak valid.');
    }
    }
  }
}
