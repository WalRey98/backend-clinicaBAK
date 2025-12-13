import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
    moduleId: module.id,
    selector: 'app-dashboard', // Selector actualizado
    templateUrl: './index.html',
})
// CORRECCIÓN: El nombre debe coincidir con lo que importamos en app.module.ts
export class DashboardComponent implements OnInit {
    
    loading = true;
    kpis = {
        total_hoy: 0,
        en_ejecucion: 0,
        retrasos: 0,
        aseo_activo: 0
    };
    proximasCirugias: any[] = [];
    fechaHoy = new Date();

    constructor(private api: ApiService) {}

    ngOnInit() {
        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;
        this.api.getDashboardResumen().subscribe({
            next: (data) => {
                this.kpis = data.kpis;
                this.proximasCirugias = data.proximas_cirugias || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando dashboard:', err);
                this.loading = false;
            }
        });
    }
}
