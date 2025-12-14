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

    paramsCirugia: any = { id: null, paciente_id: null, doctor_id: null, tipo_cirugia_id: null, pabellon_id: null, fecha: '', hora_inicio: '', duracion_programada: '', extra_time: 0 };
    @ViewChild('isAddCirugiaModal') isAddCirugiaModal!: ModalComponent;

    constructor(private cirugiasService: CirugiasService, private api: ApiService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.cargarDatos();
        this.pollingInterval = setInterval(() => this.cargarDatos(true), 10000);
    }
    ngOnDestroy() { if (this.pollingInterval) clearInterval(this.pollingInterval); }

    cargarDatos(silent = false) {
        this.cirugiasService.actualizarEstados().subscribe({
            next: () => { this.cargarReferenciales(); this.cargarPabellones(silent); },
            error: () => { this.cargarReferenciales(); this.cargarPabellones(silent); }
        });
    }

    cargarReferenciales() {
        this.api.getPacientes().subscribe(p => this.pacientes = p || []);
        this.api.getTiposCirugia().subscribe(t => this.tiposCirugia = t || []);
        this.api.getUsuarios().subscribe(u => this.doctores = (u || []).filter((x: any) => x.rol === 'Doctor' || x.rol === 'Medico'));
    }

    cargarPabellones(silent = false) {
        this.api.getPabellones().pipe(catchError(() => of([]))).subscribe((pabellonesData: any[]) => {
            if (!pabellonesData) return;
            const llamadas$ = pabellonesData.map(p => this.cirugiasService.listarCirugias(p.id).pipe(catchError(() => of([]))));

            forkJoin(llamadas$).subscribe((resultados: any[]) => {
                const datosEntrantes = pabellonesData.map((p, i) => ({ ...p, tasks: resultados[i] || [] }));

                if (!silent || this.pabellones.length === 0) {
                    this.pabellones = datosEntrantes;
                } else {
                    this.fusionarDatos(datosEntrantes);
                }
                
                // Forzamos actualización de vista
                this.pabellones = [...this.pabellones];
                this.cdr.detectChanges();
            });
        });
    }

    fusionarDatos(datosEntrantes: any[]) {
        datosEntrantes.forEach(pabEntrante => {
            let pabLocal = this.pabellones.find(p => p.id === pabEntrante.id);
            if (!pabLocal) { this.pabellones.push(pabEntrante); return; }

            pabLocal.tasks = pabLocal.tasks.filter((tLocal: any) => pabEntrante.tasks.find((tNuevo: any) => tNuevo.id === tLocal.id));
            pabEntrante.tasks.forEach((tNuevo: any) => {
                const tLocal = pabLocal.tasks.find((t: any) => t.id === tNuevo.id);
                if (tLocal) Object.assign(tLocal, tNuevo); else pabLocal.tasks.push(tNuevo);
            });
        });
    }

    // 🔥 ESTA ES LA FUNCIÓN QUE USAREMOS EN EL HTML PARA CONTAR EN VIVO 🔥
    getConteos(pab: any) {
        const tasks = pab.tasks || [];
        const aseos = tasks.filter((t: any) => (t.estado || '').toUpperCase() === 'EN_ASEO').length;
        const cirugias = tasks.filter((t: any) => {
            const s = (t.estado || '').toUpperCase();
            return s !== 'EN_ASEO' && s !== 'FINALIZADA' && s !== 'CANCELADA';
        }).length;
        const mins = tasks.reduce((acc: number, c: any) => acc + (Number(c.duracion_programada)||0) + (Number(c.extra_time)||0), 0);
        
        return { cirugias, aseos, mins };
    }

    trackByFn(index: number, item: any) { return item.id; }

    // --- ACCIONES ---
    comenzarAseo(cirugia: any) {
        Swal.fire({
            title: '¿Terminar Cirugía?', text: "El pabellón pasará a LIMPIEZA.", icon: 'info',
            showCancelButton: true, confirmButtonText: 'Sí, iniciar aseo', confirmButtonColor: '#7e22ce'
        }).then((r) => {
            if (r.isConfirmed) this.cirugiasService.updateEstado(cirugia.id, 'EN_ASEO').subscribe(() => this.cargarDatos(true));
        });
    }

    finalizarAseo(cirugia: any) {
        Swal.fire({
            title: '¿Pabellón Listo?', text: "Se marcará como FINALIZADO.", icon: 'success',
            showCancelButton: true, confirmButtonText: 'Sí, finalizar', confirmButtonColor: '#00ab55'
        }).then((r) => {
            if (r.isConfirmed) this.cirugiasService.updateEstado(cirugia.id, 'FINALIZADA').subscribe(() => this.cargarDatos(true));
        });
    }

    sortableOptionsFor(pabellonId: number) {
        if (!this.sortableCache[pabellonId]) {
            this.sortableCache[pabellonId] = {
                group: 'cirugias', animation: 150,
                onEnd: (event: any) => {
                    const cid = Number(event.item.getAttribute('data-cirugia-id'));
                    const pid = Number(event.to.getAttribute('data-pabellon-id'));
                    const oldPid = Number(event.from.getAttribute('data-pabellon-id'));
                    if (pid && cid && pid !== oldPid) {
                        this.cirugiasService.moverCirugia(cid, pid).subscribe({
                            next: () => this.cargarDatos(true),
                            error: () => { this.cargarDatos(); Swal.fire('Error', 'No se pudo mover', 'error'); }
                        });
                    }
                }
            };
        } return this.sortableCache[pabellonId];
    }

    guardarCirugia(): void {
        const data = { ...this.paramsCirugia };
        data.paciente_id = Number(data.paciente_id); data.doctor_id = Number(data.doctor_id);
        data.tipo_cirugia_id = Number(data.tipo_cirugia_id); data.pabellon_id = Number(data.pabellon_id);
        data.duracion_programada = Number(data.duracion_programada); data.extra_time = Number(data.extra_time);

        if (!data.fecha || !data.hora_inicio || !data.tipo_cirugia_id) {
            Swal.fire('Error', 'Datos incompletos', 'warning');
            return;
        }
        if (!data.id) delete data.id;

        const req$ = data.id ? this.cirugiasService.actualizarCirugia(data.id, data) : this.cirugiasService.crearCirugia(data);
        req$.subscribe({
            next: () => { this.cargarDatos(); this.isAddCirugiaModal.close(); Swal.fire('Éxito', 'Guardado', 'success'); },
            error: (e) => Swal.fire('Error', e.error?.detail || 'Choque de horario', 'error')
        });
    }

    abrirModalCrear(pid: number) { this.editarCirugia(pid); }
    editarCirugia(arg: any, c: any = null) {
        if (c) this.paramsCirugia = { ...c };
        else this.paramsCirugia = { id: null, pabellon_id: arg, fecha: new Date().toISOString().split('T')[0], hora_inicio: '', duracion_programada: 60, extra_time: 0 };
        this.isAddCirugiaModal.open();
    }
    agregarExtraTime(c: any) {
        Swal.fire({ title: '+ Minutos', input: 'number', inputValue: '30', showCancelButton: true }).then(r => {
            if (r.isConfirmed) this.cirugiasService.actualizarExtraTime(c.id, (c.extra_time || 0) + Number(r.value)).subscribe(() => this.cargarDatos());
        });
    }
    eliminarCirugia(c: any) {
        Swal.fire({ title: 'Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí', confirmButtonColor: '#d33' }).then(r => {
            if (r.isConfirmed) this.cirugiasService.eliminarCirugia(c.id).subscribe(() => this.cargarDatos());
        });
    }

    getCardBorder(cir: any) {
        switch (cir.estado) {
            case 'EN_CURSO': return 'border-l-4 border-yellow-500 bg-yellow-50';
            case 'EN_ASEO': return 'border-l-4 border-purple-500 bg-purple-100'; 
            case 'FINALIZADA': return 'border-l-4 border-green-500 opacity-75';
            case 'COMPLICADA': return 'border-l-4 border-red-500 bg-red-50';
            default: return 'border-l-4 border-blue-500 bg-white';
        }
    }
    getEstadoBadge(estado: string) {
        if (estado === 'EN_ASEO') return 'badge-outline-info';
        if (estado === 'EN_CURSO') return 'badge-outline-warning';
        if (estado === 'FINALIZADA') return 'badge-outline-success';
        return 'badge-outline-primary';
    }
    getPacienteNombre(id: number): string { return this.pacientes.find(p => p.id === id)?.nombre || 'Paciente'; }
    getDoctorNombre(id: number): string { return this.doctores.find(d => d.id === id)?.nombre_completo || 'Doctor'; }
    getTipoNombre(id: number): string { return this.tiposCirugia.find(t => t.id === id)?.nombre || 'Cirugía'; }
}