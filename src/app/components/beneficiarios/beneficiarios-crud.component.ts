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

import { BeneficiariosService } from '../../services/beneficiarios.service';
import { Beneficiario } from '../../models/beneficiario.model';
import { PageHeaderComponent } from '../shared/page-header.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-beneficiarios-crud',
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
  templateUrl: './beneficiarios-crud.component.html',
  styleUrls: ['./beneficiarios-crud.component.css']
})
export class BeneficiariosCrudComponent implements OnInit {

  form!: FormGroup;
  beneficiarios: Beneficiario[] = [];
  dataSource = new MatTableDataSource<Beneficiario>([]);
  displayedColumns = ['id', 'nombre', 'tipo', 'ubicacion', 'contacto', 'acciones'];
  editMode = false;
  terminoBusqueda = '';

  tipos = ['Familia', 'Fundación', 'Comunidad'];

  constructor(
    private fb: FormBuilder,
    private beneficiariosService: BeneficiariosService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarBeneficiarios();
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      ubicacion: ['', Validators.required],
      contacto: ['', Validators.required]
    });
  }

  cargarBeneficiarios(): void {
    this.beneficiariosService.getAll().subscribe(b => {
      this.beneficiarios = b;
      this.dataSource.data = b;
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.terminoBusqueda = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    // Filtro personalizado para buscar en múltiples campos
    this.dataSource.filterPredicate = (data: Beneficiario, filter: string) => {
      const searchText = filter.toLowerCase();
      return (
        data.nombre.toLowerCase().includes(searchText) ||
        data.tipo.toLowerCase().includes(searchText) ||
        data.ubicacion.toLowerCase().includes(searchText) ||
        data.contacto.toLowerCase().includes(searchText) ||
        data.descripcion.toLowerCase().includes(searchText)
      );
    };
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const b: Beneficiario = this.form.value;

    if (this.editMode) {
      this.beneficiariosService.update(b);
    } else {
      this.beneficiariosService.add(b);
    }

    this.cargarBeneficiarios();
    this.cancelar();
  }

  editar(b: Beneficiario): void {
    this.editMode = true;
    this.form.patchValue(b);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(b: Beneficiario): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Confirmar eliminación',
        mensaje: `¿Eliminar al beneficiario "${b.nombre}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.beneficiariosService.delete(b.id);
        this.cargarBeneficiarios();
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
