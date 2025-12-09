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

import { TiposDonacionService } from '../../services/tipos-donacion.service';
import { TipoDonacion } from '../../models/tipo-donacion.model';
import { PageHeaderComponent } from '../shared/page-header.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-tipos-donacion-crud',
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
  templateUrl: './tipos-donacion-crud.component.html',
  styleUrls: ['./tipos-donacion-crud.component.css']
})
export class TiposDonacionCrudComponent implements OnInit {

  form!: FormGroup;
  tipos: TipoDonacion[] = [];
  dataSource = new MatTableDataSource<TipoDonacion>([]);
  displayedColumns = ['id', 'nombre', 'prioridad', 'soloEspecie', 'acciones'];
  editMode = false;
  terminoBusqueda = '';

  prioridades = ['Alta', 'Media', 'Baja'];

  constructor(
    private fb: FormBuilder,
    private tiposService: TiposDonacionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarTipos();
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      soloEspecie: [true],
      prioridad: ['', Validators.required]
    });
  }

  cargarTipos(): void {
    this.tiposService.getAll().subscribe(t => {
      this.tipos = t;
      this.dataSource.data = t;
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.terminoBusqueda = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    // Filtro personalizado para buscar en múltiples campos
    this.dataSource.filterPredicate = (data: TipoDonacion, filter: string) => {
      const searchText = filter.toLowerCase();
      return (
        data.nombre.toLowerCase().includes(searchText) ||
        data.descripcion.toLowerCase().includes(searchText) ||
        data.prioridad.toLowerCase().includes(searchText)
      );
    };
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const t: TipoDonacion = this.form.value;

    if (this.editMode) {
      this.tiposService.update(t);
    } else {
      this.tiposService.add(t);
    }

    this.cargarTipos();
    this.cancelar();
  }

  editar(t: TipoDonacion): void {
    this.editMode = true;
    this.form.patchValue(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(t: TipoDonacion): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Confirmar eliminación',
        mensaje: `¿Eliminar el tipo de donación "${t.nombre}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tiposService.delete(t.id);
        this.cargarTipos();
      }
    });
  }

  cancelar(): void {
    this.editMode = false;
    this.form.reset({
      id: 0,
      soloEspecie: true
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
