import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { CampaniasService } from '../../services/campanias.service';
import { TiposDonacionService } from '../../services/tipos-donacion.service';
import { PuntosRecoleccionService } from '../../services/puntos-recoleccion.service';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { Campania } from '../../models/campania.model';
import { TipoDonacion } from '../../models/tipo-donacion.model';
import { PuntoRecoleccion } from '../../models/punto-recoleccion.model';
import { Beneficiario } from '../../models/beneficiario.model';
import { PageHeaderComponent } from '../shared/page-header.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-campanias-crud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    PageHeaderComponent
  ],
  templateUrl: './campanias-crud.component.html',
  styleUrls: ['./campanias-crud.component.css']
})
export class CampaniasCrudComponent implements OnInit {

  form!: FormGroup;
  campanias: Campania[] = [];
  dataSource = new MatTableDataSource<Campania>([]);
  displayedColumns = ['id', 'nombre', 'tipo', 'fechaLimite', 'ubicacion', 'activa', 'acciones'];
  editMode = false;
  terminoBusqueda = '';

  tiposDonacion: TipoDonacion[] = [];
  puntosRecoleccion: PuntoRecoleccion[] = [];
  beneficiarios: Beneficiario[] = [];

  constructor(
    private fb: FormBuilder,
    private campaniasService: CampaniasService,
    private tiposDonacionService: TiposDonacionService,
    private puntosRecoleccionService: PuntosRecoleccionService,
    private beneficiariosService: BeneficiariosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCampanias();
    this.cargarTiposDonacion();
    this.cargarPuntosRecoleccion();
    this.cargarBeneficiarios();
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipoDonacionPrincipalId: [null, Validators.required],
      tipoDonacionPrincipal: [''], // Se llenará automáticamente
      fechaLimite: ['', Validators.required],
      puntoRecoleccionId: [null, Validators.required],
      ubicacionRecoleccion: [''], // Se llenará automáticamente
      beneficiarioId: [null],
      aceptaRopa: [false],
      aceptaAlimentos: [false],
      aceptaJuguetes: [false],
      activa: [true]
    });

    // Actualizar campos derivados cuando cambien los selects
    this.form.get('tipoDonacionPrincipalId')?.valueChanges.subscribe(id => {
      const tipo = this.tiposDonacion.find(t => t.id === id);
      this.form.patchValue({ tipoDonacionPrincipal: tipo?.nombre || '' }, { emitEvent: false });
    });

    this.form.get('puntoRecoleccionId')?.valueChanges.subscribe(id => {
      const punto = this.puntosRecoleccion.find(p => p.id === id);
      this.form.patchValue({ ubicacionRecoleccion: punto ? `${punto.nombre} - ${punto.direccion}, ${punto.ciudad}` : '' }, { emitEvent: false });
    });
  }

  cargarCampanias(): void {
    this.campaniasService.getAll().subscribe(campanias => {
      this.campanias = campanias;
      this.dataSource.data = campanias;
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.terminoBusqueda = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    // Filtro personalizado para buscar en múltiples campos
    this.dataSource.filterPredicate = (data: Campania, filter: string) => {
      const searchText = filter.toLowerCase();
      const tipoNombre = this.getTipoDonacionNombre(data.tipoDonacionPrincipalId).toLowerCase();
      const puntoNombre = this.getPuntoRecoleccionNombre(data.puntoRecoleccionId).toLowerCase();
      return (
        data.nombre.toLowerCase().includes(searchText) ||
        data.descripcion.toLowerCase().includes(searchText) ||
        tipoNombre.includes(searchText) ||
        data.tipoDonacionPrincipal.toLowerCase().includes(searchText) ||
        puntoNombre.includes(searchText) ||
        data.ubicacionRecoleccion.toLowerCase().includes(searchText) ||
        data.fechaLimite.includes(searchText)
      );
    };
  }

  cargarTiposDonacion(): void {
    this.tiposDonacionService.getAll().subscribe(tipos => {
      this.tiposDonacion = tipos;
    });
  }

  cargarPuntosRecoleccion(): void {
    this.puntosRecoleccionService.getAll().subscribe(puntos => {
      this.puntosRecoleccion = puntos;
    });
  }

  cargarBeneficiarios(): void {
    this.beneficiariosService.getAll().subscribe(beneficiarios => {
      this.beneficiarios = beneficiarios;
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const campania: Campania = this.form.value;

    if (this.editMode) {
      this.campaniasService.update(campania);
    } else {
      this.campaniasService.add(campania);
    }

    // Recargar datos para asegurar sincronización
    this.cargarCampanias();
    this.cancelar();
  }

  editar(c: Campania): void {
    this.editMode = true;
    // Si tiene tipoDonacionPrincipalId, usarlo; si no, buscar por nombre
    let tipoId = c.tipoDonacionPrincipalId;
    if (!tipoId && c.tipoDonacionPrincipal) {
      const tipo = this.tiposDonacion.find(t => t.nombre === c.tipoDonacionPrincipal);
      tipoId = tipo?.id;
    }
    
    // Similar para punto de recolección
    let puntoId = c.puntoRecoleccionId;
    if (!puntoId && c.ubicacionRecoleccion) {
      const punto = this.puntosRecoleccion.find(p => 
        c.ubicacionRecoleccion.includes(p.nombre) || 
        c.ubicacionRecoleccion.includes(p.direccion)
      );
      puntoId = punto?.id;
    }

    this.form.patchValue({
      ...c,
      tipoDonacionPrincipalId: tipoId || null,
      puntoRecoleccionId: puntoId || null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(c: Campania): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Confirmar eliminación',
        mensaje: `¿Estás seguro de eliminar la campaña "${c.nombre}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.campaniasService.delete(c.id);
        this.cargarCampanias();
      }
    });
  }

  cancelar(): void {
    this.editMode = false;
    this.form.reset({
      id: 0,
      tipoDonacionPrincipalId: null,
      tipoDonacionPrincipal: '',
      puntoRecoleccionId: null,
      ubicacionRecoleccion: '',
      beneficiarioId: null,
      activa: true,
      aceptaRopa: false,
      aceptaAlimentos: false,
      aceptaJuguetes: false
    });
  }

  getTipoDonacionNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const tipo = this.tiposDonacion.find(t => t.id === id);
    return tipo ? tipo.nombre : 'N/A';
  }

  getPuntoRecoleccionNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const punto = this.puntosRecoleccion.find(p => p.id === id);
    return punto ? `${punto.nombre} - ${punto.ciudad}` : 'N/A';
  }

  getBeneficiarioNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const beneficiario = this.beneficiarios.find(b => b.id === id);
    return beneficiario ? beneficiario.nombre : 'N/A';
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
