import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Campania } from '../models/campania.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CampaniasService {

  private apiUrl = '/json/campanias.json';
  private storageKey = 'donaciones_campanias';
  private campanias: Campania[] = [];
  private dataLoaded = false;

  constructor(private http: HttpClient) { }

  private loadData(): Observable<Campania[]> {
    if (this.dataLoaded) {
      return of(this.campanias);
    }
    
    // Intentar cargar desde localStorage primero
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.campanias = JSON.parse(stored);
        this.dataLoaded = true;
        return of(this.campanias);
      } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
      }
    }
    
    // Si no hay datos en localStorage, cargar desde JSON
    return this.http.get<Campania[]>(this.apiUrl).pipe(
      tap(data => {
        this.campanias = data;
        this.dataLoaded = true;
        this.saveToStorage();
      })
    );
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.campanias));
  }

  getAll(): Observable<Campania[]> {
    return this.loadData();
  }

  getLocal(): Campania[] {
    return this.campanias;
  }

  add(campania: Campania): void {
    const newId = this.campanias.length > 0
      ? Math.max(...this.campanias.map(c => c.id)) + 1
      : 1;
    campania.id = newId;
    this.campanias.push({ ...campania });
    this.saveToStorage();
  }

  update(campania: Campania): void {
    const index = this.campanias.findIndex(c => c.id === campania.id);
    if (index > -1) {
      this.campanias[index] = { ...campania };
      this.saveToStorage();
    }
  }

  delete(id: number): void {
    this.campanias = this.campanias.filter(c => c.id !== id);
    this.saveToStorage();
  }
}
