import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Voluntario } from '../models/voluntario.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VoluntariosService {

  private apiUrl = '/json/voluntarios.json';
  private storageKey = 'donaciones_voluntarios';
  private voluntarios: Voluntario[] = [];
  private dataLoaded = false;

  constructor(private http: HttpClient) { }

  private loadData(): Observable<Voluntario[]> {
    if (this.dataLoaded) {
      return of(this.voluntarios);
    }

    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.voluntarios = JSON.parse(stored);
        this.dataLoaded = true;
        return of(this.voluntarios);
      } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
      }
    }


    return this.http.get<Voluntario[]>(this.apiUrl).pipe(
      tap(data => {
        this.voluntarios = data;
        this.dataLoaded = true;
        this.saveToStorage();
      })
    );
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.voluntarios));
  }

  getAll(): Observable<Voluntario[]> {
    return this.loadData();
  }

  getLocal(): Voluntario[] {
    return this.voluntarios;
  }

  add(vol: Voluntario): void {
    const newId = this.voluntarios.length > 0
      ? Math.max(...this.voluntarios.map(v => v.id)) + 1
      : 1;
    vol.id = newId;
    this.voluntarios.push({ ...vol });
    this.saveToStorage();
  }

  update(vol: Voluntario): void {
    const index = this.voluntarios.findIndex(v => v.id === vol.id);
    if (index > -1) {
      this.voluntarios[index] = { ...vol };
      this.saveToStorage();
    }
  }

  delete(id: number): void {
    this.voluntarios = this.voluntarios.filter(v => v.id !== id);
    this.saveToStorage();
  }
}
