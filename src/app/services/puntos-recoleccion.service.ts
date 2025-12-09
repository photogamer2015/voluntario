import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PuntoRecoleccion } from '../models/punto-recoleccion.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PuntosRecoleccionService {

  private apiUrl = '/json/puntos-recoleccion.json';
  private storageKey = 'donaciones_puntos_recoleccion';
  private puntos: PuntoRecoleccion[] = [];
  private dataLoaded = false;

  constructor(private http: HttpClient) {}

  private loadData(): Observable<PuntoRecoleccion[]> {
    if (this.dataLoaded) {
      return of(this.puntos);
    }
    
    // Intentar cargar desde localStorage primero
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.puntos = JSON.parse(stored);
        this.dataLoaded = true;
        return of(this.puntos);
      } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
      }
    }
    
    // Si no hay datos en localStorage, cargar desde JSON
    return this.http.get<PuntoRecoleccion[]>(this.apiUrl).pipe(
      tap(data => {
        this.puntos = data;
        this.dataLoaded = true;
        this.saveToStorage();
      })
    );
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.puntos));
  }

  getAll(): Observable<PuntoRecoleccion[]> {
    return this.loadData();
  }

  getLocal(): PuntoRecoleccion[] {
    return this.puntos;
  }

  add(p: PuntoRecoleccion): void {
    const newId = this.puntos.length > 0
      ? Math.max(...this.puntos.map(v => v.id)) + 1
      : 1;
    p.id = newId;
    this.puntos.push({ ...p });
    this.saveToStorage();
  }

  update(p: PuntoRecoleccion): void {
    const index = this.puntos.findIndex(v => v.id === p.id);
    if (index > -1) {
      this.puntos[index] = { ...p };
      this.saveToStorage();
    }
  }

  delete(id: number): void {
    this.puntos = this.puntos.filter(v => v.id != id);
    this.saveToStorage();
  }
}
