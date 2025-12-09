import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TipoDonacion } from '../models/tipo-donacion.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TiposDonacionService {

  private apiUrl = '/json/tipos-donacion.json';
  private storageKey = 'donaciones_tipos_donacion';
  private tipos: TipoDonacion[] = [];
  private dataLoaded = false;

  constructor(private http: HttpClient) {}

  private loadData(): Observable<TipoDonacion[]> {
    if (this.dataLoaded) {
      return of(this.tipos);
    }
    
    // Intentar cargar desde localStorage primero
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.tipos = JSON.parse(stored);
        this.dataLoaded = true;
        return of(this.tipos);
      } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
      }
    }
    
    // Si no hay datos en localStorage, cargar desde JSON
    return this.http.get<TipoDonacion[]>(this.apiUrl).pipe(
      tap(data => {
        this.tipos = data;
        this.dataLoaded = true;
        this.saveToStorage();
      })
    );
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tipos));
  }

  getAll(): Observable<TipoDonacion[]> {
    return this.loadData();
  }

  getLocal(): TipoDonacion[] {
    return this.tipos;
  }

  add(t: TipoDonacion): void {
    const newId = this.tipos.length > 0
      ? Math.max(...this.tipos.map(v => v.id)) + 1
      : 1;
    t.id = newId;
    this.tipos.push({ ...t });
    this.saveToStorage();
  }

  update(t: TipoDonacion): void {
    const index = this.tipos.findIndex(v => v.id === t.id);
    if (index > -1) {
      this.tipos[index] = { ...t };
      this.saveToStorage();
    }
  }

  delete(id: number): void {
    this.tipos = this.tipos.filter(v => v.id != id);
    this.saveToStorage();
  }
}
