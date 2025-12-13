import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { ModalComponent } from 'angular-custom-modal';
import { ApiService } from '@shared/services/api.service';
import { CirugiasService } from '@shared/services/cirugias.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    moduleId: module.id,
    selector: 'app-scrum-cirugias',
    templateUrl: './scrum-cirugias.html',
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class ScrumCirugiasComponent implements OnInit, OnDestroy {

    pabellones: any[] = [];
    sortableCache: { [key: number]: any } = {};
    pacientes: any[] = [];
    doctores: any[] = [];
    tiposCirugia: any[] = [];
    pollingInterval: any;

    paramsCirugia: any = {
        id: null, paciente_id: null, doctor_id: null, tipo_cirugia_id: null,
        pabellon_id: null, fecha: '', hora_inicio: '', duracion_programada: '', extra_time: 0
    };

    @ViewChild('isAddCirugiaModal') isAddCirugiaModal!: ModalComponent;

    constructor(
        private cirugiasService: CirugiasService,
        private api: ApiService,
        private cdr: ChangeDetectorRef 
    ) { }

    ngOnInit(): void {
        this.cargarDatos();
        this.pollingInterval = setInterval(() => this.cargarDatos(true), 10000);
    }

    ngOnDestroy() { if (this.pollingInterval) clearInterval(this.pollingInterval); }

    cargarDatos(silent = false) {
        if (!silent) this.cirugiasService.actualizarEstados().subscribe();
        this.cargarReferenciales();
        this.cargarPabellones(silent);
    }

    cargarReferenciales() {
        this.api.getPacientes().subscribe(p => this.pacientes = p || []);
        this.api.getTiposCirugia().subscribe(t => this.tiposCirugia = t || []);
        this.api.getUsuarios().subscribe(u => this.doctores = (u || []).filter((x: any) => x.rol === 'Doctor' || x.rol === 'Medico'));
    }

    cargarPabellones(silent = false) {
        this.api.getPabellones().pipe(catchError(() => of([]))).subscribe((pabellones: any[]) => {
            if (!pabellones || pabellones.length === 0) return;

            const llamadas$ = pabellones.map(p => this.cirugiasService.listarCirugias(p.id).pipe(catchError(() => of([]))));

            forkJoin(llamadas$).subscribe((resultados: any[]) => {
                const nuevosDatos = pabellones.map((p, i) => ({ ...p, tasks: resultados[i] || [] }));

                if (silent && this.pabellones.length > 0) this.verificarCambios(this.pabellones, nuevosDatos);

                if (!silent) { this.pabellones = []; this.cdr.detectChanges(); }
                setTimeout(() => {
                    this.pabellones = [...nuevosDatos];
                    this.cdr.detectChanges();
                }, silent ? 0 : 50);
            });
        });
    }

    verificarCambios(viejo: any[], nuevo: any[]) {
        nuevo.forEach((pabNuevo: any) => {
            pabNuevo.tasks.forEach((tareaNueva: any) => {
                const pabViejo = viejo.find(p => p.id === pabNuevo.id);
                const tareaVieja = pabViejo?.tasks.find((t: any) => t.id === tareaNueva.id);
                if (tareaVieja && tareaVieja.estado !== tareaNueva.estado) {
                    this.mostrarAlerta(tareaNueva.estado, pabNuevo.nombre);
                }
            });
        });
    }

    mostrarAlerta(estado: string, pabellon: string) {
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        let msg = ''; let icon: any = 'info';
        if (estado === 'EN_CURSO') { msg = `🏥 ${pabellon}: Cirugía INICIADA`; icon = 'success'; }
        else if (estado === 'FINALIZADA') { msg = `✅ ${pabellon}: Cirugía FINALIZADA`; icon = 'success'; }
        else if (estado === 'EN_ASEO') { msg = `🧹 ${pabellon}: Comenzó ASEO`; icon = 'warning'; }
        else if (estado === 'COMPLICADA') { msg = `⚠️ ${pabellon}: Cirugía ATRASADA`; icon = 'error'; }
        if (msg) Toast.fire({ icon: icon, title: msg });
    }

    // --- NUEVA FUNCIÓN PARA CONTADORES SEPARADOS ---
    getCounts(pab: any) {
        const total = pab.tasks?.length || 0;
        const aseos = pab.tasks?.filter((t: any) => t.es_aseo).length || 0;
        const cirugias = total - aseos;
        return { cirugias, aseos };
    }

    abrirModalCrear(pabellonId: number) { this.editarCirugia(pabellonId); }

    editarCirugia(pabellonId: number | any, cirugia: any = null) {
        if (typeof pabellonId === 'object') { cirugia = pabellonId; pabellonId = cirugia.pabellon_id; }
        if (cirugia) this.paramsCirugia = { ...cirugia };
        else this.paramsCirugia = {
            id: null, paciente_id: null, doctor_id: null, tipo_cirugia_id: null, pabellon_id: pabellonId,
            fecha: new Date().toISOString().split('T')[0], hora_inicio: '', duracion_programada: '', extra_time: 0
        };
        this.isAddCirugiaModal.open();
    }

    guardarCirugia() {
        const data = structuredClone(this.paramsCirugia);
        data.paciente_id = Number(data.paciente_id); data.doctor_id = Number(data.doctor_id);
        data.tipo_cirugia_id = Number(data.tipo_cirugia_id); data.pabellon_id = Number(data.pabellon_id);
        data.duracion_programada = data.duracion_programada ? Number(data.duracion_programada) : null;
        data.extra_time = data.extra_time ? Number(data.extra_time) : 0;

        if (!data.fecha || !data.hora_inicio || !data.tipo_cirugia_id) {
            Swal.fire('Error', 'Complete los campos obligatorios', 'warning');
            return;
        }

        if (!data.id) {
            delete data.id;
            this.cirugiasService.crearCirugia(data).subscribe(() => {
                this.cargarDatos(); this.isAddCirugiaModal.close(); Swal.fire('Guardado', 'Cirugía agendada', 'success');
            }, (err) => Swal.fire('Error', err.error.detail || 'Error', 'error'));
        } else {
            this.cirugiasService.actualizarCirugia(data.id, data).subscribe(() => {
                this.cargarDatos(); this.isAddCirugiaModal.close(); Swal.fire('Actualizado', 'Cirugía editada', 'success');
            });
        }
    }

    finalizarCirugia(cirugia: any) {
        Swal.fire({
            title: '¿Finalizar Cirugía?', text: "Se liberará el pabellón y activará el Aseo.", icon: 'question',
            showCancelButton: true, confirmButtonColor: '#00ab55', confirmButtonText: 'Sí, finalizar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cirugiasService.updateEstado(cirugia.id, 'FINALIZADA').subscribe({
                    next: () => { setTimeout(() => { this.cargarDatos(); Swal.fire('Listo', 'Cirugía finalizada', 'success'); }, 500); },
                    error: () => Swal.fire('Error', 'No se pudo conectar', 'error')
                });
            }
        });
    }

    agregarExtraTime(cirugia: any) {
        Swal.fire({
            title: 'Tiempo extra (min)', input: 'number', inputValue: '30', showCancelButton: true, confirmButtonText: 'Agregar',
        }).then(result => {
            if (result.isConfirmed) {
                this.cirugiasService.actualizarExtraTime(cirugia.id, (cirugia.extra_time || 0) + Number(result.value)).subscribe(() => this.cargarDatos());
            }
        });
    }

    eliminarCirugia(cirugia: any) {
        Swal.fire({
            title: '¿Eliminar?', text: 'Irreversible', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#d33'
        }).then((r) => {
            if (r.isConfirmed) {
                this.cirugiasService.eliminarCirugia(cirugia.id).subscribe(() => {
                    this.cargarDatos(); Swal.fire('Eliminado', 'Item eliminado', 'success');
                });
            }
        });
    }

    getCardBorder(cir: any) {
        if (cir.es_aseo) return 'border-l-4 border-purple-500 bg-purple-50';
        switch (cir.estado) {
            case 'EN_CURSO': return 'border-l-4 border-yellow-500 bg-yellow-50';
            case 'FINALIZADA': return 'border-l-4 border-green-500 opacity-75';
            case 'COMPLICADA': return 'border-l-4 border-red-500 bg-red-50';
            case 'CANCELADA': return 'border-l-4 border-gray-500 bg-gray-200';
            default: return 'border-l-4 border-blue-500 bg-white';
        }
    }

    getEstadoBadge(estado: string) {
        switch (estado) {
            case 'PROGRAMADA': return 'badge-outline-primary';
            case 'EN_CURSO': return 'badge-outline-warning';
            case 'FINALIZADA': return 'badge-outline-success';
            case 'EN_ASEO': return 'badge-outline-info';
            case 'COMPLICADA': return 'badge-outline-danger';
            default: return 'badge-outline-secondary';
        }
    }

    sortableOptionsFor(pabellonId: number) { return this.sortableCache[pabellonId] || (this.sortableCache[pabellonId] = { group: 'cirugias', animation: 150 }); }
    getPacienteNombre(id: number): string { return this.pacientes.find(p => p.id === id)?.nombre || 'Sin Paciente'; }
    getDoctorNombre(id: number): string { return this.doctores.find(d => d.id === id)?.nombre_completo || 'Sin Doctor'; }
    getTipoNombre(id: number): string { return this.tiposCirugia.find(t => t.id === id)?.nombre || 'Procedimiento'; }
    getTotalMinutos(pab: any): number { return (pab.tasks || []).reduce((acc: number, c: any) => acc + (c.duracion_programada || 0) + (c.extra_time || 0), 0); }
}