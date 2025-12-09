import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { CampaniasService } from '../../services/campanias.service';
import { Campania } from '../../models/campania.model';
import { PageHeaderComponent } from '../shared/page-header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    PageHeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  campaniasActivas: Campania[] = [];

  constructor(
    private campaniasService: CampaniasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.campaniasService.getAll().subscribe(campanias => {
      this.campaniasActivas = campanias.filter(c => c.activa);
    });
  }

  ir(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
