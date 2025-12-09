import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

import { CampaniasService } from '../../services/campanias.service';
import { TiposDonacionService } from '../../services/tipos-donacion.service';
import { PuntosRecoleccionService } from '../../services/puntos-recoleccion.service';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { Campania } from '../../models/campania.model';
import { PageHeaderComponent } from '../shared/page-header.component';

@Component({
  selector: 'app-campanias-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    FormsModule,
    MatInputModule,
    MatTableModule,
    PageHeaderComponent
  ],
  templateUrl: './campanias-view.component.html',
  styleUrls: ['./campanias-view.component.css']
})
export class CampaniasViewComponent implements OnInit {

  campaniasActivas: Campania[] = [];
  dataSource = new MatTableDataSource<Campania>([]);
  terminoBusqueda = '';

  constructor(
    private campaniasService: CampaniasService,
    private tiposDonacionService: TiposDonacionService,
    private puntosRecoleccionService: PuntosRecoleccionService,
    private beneficiariosService: BeneficiariosService
  ) {}

  ngOnInit(): void {
    // Cargar datos relacionados para poder mostrar nombres
    this.tiposDonacionService.getAll().subscribe();
    this.puntosRecoleccionService.getAll().subscribe();
    this.beneficiariosService.getAll().subscribe();
    this.cargarCampaniasActivas();
  }

  cargarCampaniasActivas(): void {
    this.campaniasService.getAll().subscribe(campanias => {
      this.campaniasActivas = campanias.filter(c => c.activa);
      this.dataSource.data = this.campaniasActivas;
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.terminoBusqueda = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    this.dataSource.filterPredicate = (data: Campania, filter: string) => {
      const searchText = filter.toLowerCase();
      return (
        data.nombre.toLowerCase().includes(searchText) ||
        data.descripcion.toLowerCase().includes(searchText) ||
        data.tipoDonacionPrincipal.toLowerCase().includes(searchText) ||
        data.ubicacionRecoleccion.toLowerCase().includes(searchText)
      );
    };
  }

  getTipoDonacionNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const tipos = this.tiposDonacionService.getLocal();
    const tipo = tipos.find(t => t.id === id);
    return tipo ? tipo.nombre : 'N/A';
  }

  getPuntoRecoleccionNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const puntos = this.puntosRecoleccionService.getLocal();
    const punto = puntos.find(p => p.id === id);
    return punto ? `${punto.nombre} - ${punto.ciudad}` : 'N/A';
  }

  getBeneficiarioNombre(id: number | undefined): string {
    if (!id) return 'No especificado';
    const beneficiarios = this.beneficiariosService.getLocal();
    const beneficiario = beneficiarios.find(b => b.id === id);
    return beneficiario ? beneficiario.nombre : 'No especificado';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No especificada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

