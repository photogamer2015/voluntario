import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CampaniasCrudComponent } from './components/campanias/campanias-crud.component';
import { CampaniasViewComponent } from './components/campanias/campanias-view.component';
import { VoluntariosCrudComponent } from './components/voluntarios/voluntarios-crud.component';
import { PuntosRecoleccionCrudComponent } from './components/puntos-recoleccion/puntos-recoleccion-crud.component';
import { TiposDonacionCrudComponent } from './components/tipos-donacion/tipos-donacion-crud.component';
import { BeneficiariosCrudComponent } from './components/beneficiarios/beneficiarios-crud.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'campanias', component: CampaniasCrudComponent },
  { path: 'campanias-view', component: CampaniasViewComponent },
  { path: 'voluntarios', component: VoluntariosCrudComponent },
  { path: 'puntos-recoleccion', component: PuntosRecoleccionCrudComponent },
  { path: 'tipos-donacion', component: TiposDonacionCrudComponent },
  { path: 'beneficiarios', component: BeneficiariosCrudComponent },
  { path: '**', redirectTo: '' }
];
