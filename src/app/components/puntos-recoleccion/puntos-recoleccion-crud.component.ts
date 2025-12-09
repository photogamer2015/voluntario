import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { PuntosRecoleccionService } from '../../services/puntos-recoleccion.service';
import { PuntoRecoleccion } from '../../models/punto-recoleccion.model';
import { PageHeaderComponent } from '../shared/page-header.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-puntos-recoleccion-crud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    PageHeaderComponent
  ],
  templateUrl: './puntos-recoleccion-crud.component.html',
  styleUrls: ['./puntos-recoleccion-crud.component.css']
})
export class PuntosRecoleccionCrudComponent implements OnInit {

  form!: FormGroup;
  puntos: PuntoRecoleccion[] = [];
  dataSource = new MatTableDataSource<PuntoRecoleccion>([]);
  displayedColumns = ['id', 'nombre', 'ciudad', 'direccion', 'horario', 'responsable', 'acciones'];
  editMode = false;
  terminoBusqueda = '';

  ciudades = ['Guayaquil', 'Quito', 'Cuenca', 'Otra'];

  constructor(
    private fb: FormBuilder,
    private puntosService: PuntosRecoleccionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarPuntos();
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', Validators.required],
      horario: ['', Validators.required],
      responsable: ['', Validators.required],
      telefonoContacto: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

  cargarPuntos(): void {
    this.puntosService.getAll().subscribe(p => {
      this.puntos = p;
      this.dataSource.data = p;
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.terminoBusqueda = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    // Filtro personalizado para buscar en múltiples campos
    this.dataSource.filterPredicate = (data: PuntoRecoleccion, filter: string) => {
      const searchText = filter.toLowerCase();
      return (
        data.nombre.toLowerCase().includes(searchText) ||
        data.ciudad.toLowerCase().includes(searchText) ||
        data.direccion.toLowerCase().includes(searchText) ||
        data.horario.toLowerCase().includes(searchText) ||
        data.responsable.toLowerCase().includes(searchText) ||
        data.telefonoContacto.includes(searchText)
      );
    };
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const p: PuntoRecoleccion = this.form.value;

    if (this.editMode) {
      this.puntosService.update(p);
    } else {
      this.puntosService.add(p);
    }

    this.cargarPuntos();
    this.cancelar();
  }

  editar(p: PuntoRecoleccion): void {
    this.editMode = true;
    this.form.patchValue(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(p: PuntoRecoleccion): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Confirmar eliminación',
        mensaje: `¿Eliminar el punto de recolección "${p.nombre}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.puntosService.delete(p.id);
        this.cargarPuntos();
      }
    });
  }

  cancelar(): void {
    this.editMode = false;
    this.form.reset({
      id: 0
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
