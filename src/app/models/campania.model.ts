export interface Campania {
  id: number;
  nombre: string;
  descripcion: string;
  tipoDonacionPrincipalId?: number; // Referencia al tipo de donación
  tipoDonacionPrincipal: string; // Mantener para compatibilidad
  fechaLimite: string;
  puntoRecoleccionId?: number; // Referencia al punto de recolección
  ubicacionRecoleccion: string; // Mantener para compatibilidad
  beneficiarioId?: number; // Referencia al beneficiario
  aceptaRopa: boolean;
  aceptaAlimentos: boolean;
  aceptaJuguetes: boolean;
  activa: boolean;
}
