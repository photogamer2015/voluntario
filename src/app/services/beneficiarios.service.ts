import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Beneficiario } from '../models/beneficiario.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BeneficiariosService {

  private apiUrl = '/json/beneficiarios.json';
  private storageKey = 'donaciones_beneficiarios';
  private beneficiarios: Beneficiario[] = [];
  private dataLoaded = false;

  constructor(private http: HttpClient) {}

  private loadData(): Observable<Beneficiario[]> {
    if (this.dataLoaded) {
      return of(this.beneficiarios);
    }
    
    // Intentar cargar desde localStorage primero
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.beneficiarios = JSON.parse(stored);
        this.dataLoaded = true;
        return of(this.beneficiarios);
      } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
      }
    }
    
    // Si no hay datos en localStorage, cargar desde JSON
    return this.http.get<Beneficiario[]>(this.apiUrl).pipe(
      tap(data => {
        this.beneficiarios = data;
        this.dataLoaded = true;
        this.saveToStorage();
      })
    );
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.beneficiarios));
  }

  getAll(): Observable<Beneficiario[]> {
    return this.loadData();
  }

  getLocal(): Beneficiario[] {
    return this.beneficiarios;
  }

  getById(id: number): Beneficiario | undefined {
    return this.beneficiarios.find(b => b.id === id);
  }

  add(b: Beneficiario): void {
    const newId = this.beneficiarios.length > 0
      ? Math.max(...this.beneficiarios.map(v => v.id)) + 1
      : 1;
    b.id = newId;
    this.beneficiarios.push({ ...b });
    this.saveToStorage();
  }

  update(b: Beneficiario): void {
    const index = this.beneficiarios.findIndex(v => v.id === b.id);
    if (index > -1) {
      this.beneficiarios[index] = { ...b };
      this.saveToStorage();
    }
  }

  delete(id: number): void {
    this.beneficiarios = this.beneficiarios.filter(v => v.id != id);
    this.saveToStorage();
  }
}
