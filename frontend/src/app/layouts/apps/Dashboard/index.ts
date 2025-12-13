import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/shared/services/api.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-index', // Selector corregido
    templateUrl: './index.html',
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class DashboardComponent implements OnInit {
    store: any;
    isLoading = true;
    
    // Datos Reales
    kpis = {
        total_hoy: 0,
        en_ejecucion: 0,
        retrasos: 0,
        aseo_activo: 0
    };
    proximasCirugias: any[] = [];
    
    // Configuración del Gráfico
    cirugiasChart: any;

    constructor(
        public storeData: Store<any>, 
        private api: ApiService
    ) {
        this.initStore();
    }

ngOnInit() {
    this.cargarDatosDashboard();
    
    // Auto-actualizar cada 30 segundos para detectar cambios y alertas
    setInterval(() => {
        this.cargarDatosDashboard();
        // Aquí podrías comparar los datos nuevos con los viejos y lanzar Swal.fire() si algo cambió
    }, 30000); 
}

    async initStore() {
        this.storeData.select((d) => d.index).subscribe((d) => {
            const hasChangeTheme = this.store?.theme !== d?.theme;
            this.store = d;
            if (hasChangeTheme) {
                this.initChartConfig(); // Recargar colores si cambia el tema
            }
        });
    }

    cargarDatosDashboard() {
        this.isLoading = true;
        this.api.getDashboardResumen().subscribe({
            next: (data) => {
                this.kpis = data.kpis;
                this.proximasCirugias = data.proximas_cirugias;
                
                // Configurar gráfico con datos reales
                this.initChartConfig(data.grafico_estados.series, data.grafico_estados.labels);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error cargando dashboard:', err);
                this.isLoading = false;
            }
        });
    }

    initChartConfig(seriesData: number[] = [0, 0, 0, 0], labelsData: string[] = []) {
        const isDark = this.store.theme === 'dark' || this.store.isDarkMode;
        
        this.cirugiasChart = {
            series: seriesData,
            chart: {
                type: 'donut',
                height: 300,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 2, colors: isDark ? '#0e1726' : '#fff' },
            colors: ['#4361ee', '#e2a03f', '#00ab55', '#e7515a'], // Azul, Amarillo, Verde, Rojo
            labels: labelsData.length > 0 ? labelsData : ['Programada', 'En Curso', 'Finalizada', 'Cancelada'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                itemMargin: { horizontal: 8, vertical: 8 },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: { show: true, offsetY: -10 },
                            value: {
                                show: true,
                                fontSize: '24px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => val,
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '20px',
                                formatter: (w: any) => {
                                    return w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
                                },
                            },
                        },
                    },
                },
            },
            tooltip: {
                y: {
                    formatter: function(val: any) {
                        return val + " cirugías"
                    }
                }
            }
        };
    }
}
