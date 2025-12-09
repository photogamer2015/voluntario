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

import { VoluntariosService } from '../../services/voluntarios.service';
import { Voluntario } from '../../models/voluntario.model';
import { PageHeaderComponent } from '../shared/page-header.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-voluntarios-crud',
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
  templateUrl: './voluntarios-crud.component.html',
  styleUrls: ['./voluntarios-crud.component.css']
})
export class VoluntariosCrudComponent implements OnInit {

  form!: FormGroup;
  voluntarios: Voluntario[] = [];
  dataSource = new MatTableDataSource<Voluntario>([]);
  displayedColumns = ['id', 'nombre', 'email', 'tipoParticipacion', 'disponibilidad', 'activo', 'acciones'];
  editMode = false;
  terminoBusqueda = '';

  tiposParticipacion = ['Recolección', 'Clasificación', 'Entrega', 'Logística'];
  disponibilidades = ['Fines de semana', 'Diario', 'Entre semana'];

  constructor(
    private fb: FormBuilder,
    private voluntariosService: VoluntariosService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarVoluntarios();
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.minLength(7)]],
      tipoParticipacion: ['', Validators.required],
      disponibilidad: ['', Validators.required],
      activo: [true]
    });
  }

  cargarVoluntarios(): void {
    this.voluntariosService.getAll().subscribe(vols => {
      this.voluntarios = vols;
      this.dataSource.data = vols;
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.terminoBusqueda = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();


    this.dataSource.filterPredicate = (data: Voluntario, filter: string) => {
      const searchText = filter.toLowerCase();
      const nombreCompleto = `${data.nombres} ${data.apellidos}`.toLowerCase();
      return (
        nombreCompleto.includes(searchText) ||
        data.nombres.toLowerCase().includes(searchText) ||
        data.apellidos.toLowerCase().includes(searchText) ||
        data.email.toLowerCase().includes(searchText) ||
        data.telefono.includes(searchText) ||
        data.tipoParticipacion.toLowerCase().includes(searchText) ||
        data.disponibilidad.toLowerCase().includes(searchText)
      );
    };
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const vol: Voluntario = this.form.value;

    if (this.editMode) {
      this.voluntariosService.update(vol);
    } else {
      this.voluntariosService.add(vol);
    }

    this.cargarVoluntarios();
    this.cancelar();
  }

  editar(v: Voluntario): void {
    this.editMode = true;
    this.form.patchValue(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(v: Voluntario): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Confirmar eliminación',
        mensaje: `¿Estás seguro de eliminar al voluntario "${v.nombres} ${v.apellidos}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voluntariosService.delete(v.id);
        this.cargarVoluntarios();
      }
    });
  }

  cancelar(): void {
    this.editMode = false;
    this.form.reset({
      id: 0,
      activo: true
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
