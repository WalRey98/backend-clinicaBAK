import { Component, ViewChild, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { ModalComponent } from 'angular-custom-modal';
import { ApiService } from '@shared/services/api.service';
import { CirugiasService } from '@shared/services/cirugias.service';
import { forkJoin } from 'rxjs';

@Component({
    moduleId: module.id,
    selector: 'app-scrum-cirugias',
    templateUrl: './scrum-cirugias.html',
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))
            ]),
        ]),
    ],
})
export class ScrumCirugiasComponent implements OnInit {

    pabellones: any[] | null = null;
    sortableCache: { [key: number]: any } = {};
    pacientes: any[] = [];
    doctores: any[] = [];
    tiposCirugia: any[] = [];

    paramsCirugia: any = {
        id: null,
        paciente_id: null,
        doctor_id: null,
        tipo_cirugia_id: null,
        pabellon_id: null,
        fecha: '',
        hora_inicio: '',
        duracion_programada: '',
        extra_time: 0
    };

    @ViewChild('isAddCirugiaModal') isAddCirugiaModal!: ModalComponent;

    constructor(
        private cirugiasService: CirugiasService,
        private api: ApiService,
    ) { }

    ngOnInit(): void {
        this.cirugiasService.actualizarEstados().subscribe(() => {
            this.cargarPabellones();
        });

        this.cargarReferenciales();
        this.cargarPabellones();
    }

    // -------------------------- REFERENCIALES --------------------------
    cargarReferenciales() {
        this.api.getPacientes().subscribe(p => this.pacientes = p || []);
        this.api.getTiposCirugia().subscribe(t => this.tiposCirugia = t || []);
        this.api.getUsuarios().subscribe(u => {
            this.doctores = (u || []).filter((x: any) => x.rol === 'Doctor' || x.rol === 'Medico');
        });
    }

    getPacienteNombre(id: number): string {
        return this.pacientes.find(p => p.id === id)?.nombre || `Paciente #${id}`;
    }

    getDoctorNombre(id: number): string {
        return this.doctores.find(d => d.id === id)?.nombre_completo || `Doctor #${id}`;
    }

    getTipoNombre(id: number): string {
        return this.tiposCirugia.find(t => t.id === id)?.nombre || `Tipo #${id}`;
    }

    getTotalMinutos(pab: any): number {
        if (!pab.tasks) return 0;
        return pab.tasks.reduce((acc: number, c: any) => {
            const base = Number(c.duracion_programada || 0);
            const extra = Number(c.extra_time || 0);
            return acc + base + extra;
        }, 0);
    }

    // -------------------------- TABLERO --------------------------
    cargarPabellones() {
        this.api.getPabellones().subscribe((pabellones: any[]) => {

            const llamadas$ = pabellones.map(p =>
                this.cirugiasService.listarCirugias(p.id)
            );

            forkJoin(llamadas$).subscribe((resultados: any[]) => {
                this.pabellones = pabellones.map((p, i) => ({
                    ...p,
                    tasks: resultados[i] || []
                }));
            });

        });
    }

    // Opciones de sortableJS por pabellón (para drag & drop)
    sortableOptionsFor(pabellonId: number) {
        if (!this.sortableCache[pabellonId]) {
            this.sortableCache[pabellonId] = {
                group: {
                    name: 'cirugias',
                    pull: true,
                    put: true,
                },
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                onEnd: (event: any) => {
                    const idCirugia = Number(event.item.getAttribute('data-cirugia-id'));
                    const nuevoPabellon = pabellonId;

                    if (event.from !== event.to) {
                        this.cirugiasService
                            .moverCirugia(idCirugia, nuevoPabellon)
                            .subscribe(() => this.cargarPabellones());
                    }
                }
            };
        }

        return this.sortableCache[pabellonId];
    }

    // -------------------------- MODAL CREAR / EDITAR --------------------------
    editarCirugia(pabellonId: number, cirugia: any = null) {
        if (cirugia) {
            this.paramsCirugia = { ...cirugia };
        } else {
            this.paramsCirugia = {
                paciente_id: null,
                doctor_id: null,
                tipo_cirugia_id: null,
                pabellon_id: pabellonId,
                fecha: '',
                hora_inicio: '',
                duracion_programada: '',
                extra_time: 0,
            };
        }

        this.isAddCirugiaModal.open();
    }

    validarCirugia(data: any): string | null {
        if (!data.paciente_id) return 'Debe seleccionar un paciente.';
        if (!data.doctor_id) return 'Debe seleccionar un doctor.';
        if (!data.tipo_cirugia_id) return 'Debe seleccionar un tipo de cirugía.';
        if (!data.fecha) return 'Debe seleccionar una fecha.';
        if (!data.hora_inicio) return 'Debe seleccionar una hora de inicio.';
        return null;
    }

    guardarCirugia() {
        const data = structuredClone(this.paramsCirugia);

        // parsear a número lo que corresponde
        data.paciente_id = Number(data.paciente_id);
        data.doctor_id = Number(data.doctor_id);
        data.tipo_cirugia_id = Number(data.tipo_cirugia_id);
        data.pabellon_id = Number(data.pabellon_id);
        data.duracion_programada = data.duracion_programada ? Number(data.duracion_programada) : null;
        data.extra_time = data.extra_time ? Number(data.extra_time) : 0;

        const error = this.validarCirugia(data);
        if (error) {
            Swal.fire('Validación', error, 'warning');
            return;
        }

        // 🔥🔥🔥 FIX IMPORTANTE
        // SI ES NULL O 0, SE ELIMINA EL ID DEL BODY
        if (!data.id) {
            delete data.id;
            this.cirugiasService.crearCirugia(data).subscribe(() => {
                this.cargarPabellones();
                this.isAddCirugiaModal.close();
            });
            return;
        }

        // si tiene id → actualización
        this.cirugiasService.actualizarCirugia(data.id, data).subscribe(() => {
            this.cargarPabellones();
            this.isAddCirugiaModal.close();
        });
    }

    // -------------------------- EXTRA TIME --------------------------
    agregarExtraTime(cirugia: any) {
        Swal.fire({
            title: 'Tiempo extra en minutos',
            input: 'number',
            inputPlaceholder: 'Ej: 10',
            showCancelButton: true,
            confirmButtonText: 'Agregar',
        }).then(result => {
            if (result.value !== undefined) {
                const extra = Number(result.value);
                if (Number.isNaN(extra)) return;

                this.cirugiasService.actualizarExtraTime(cirugia.id, extra).subscribe(() => {
                    this.cargarPabellones();
                });
            }
        });
    }

    // -------------------------- ELIMINAR (SUSPENDER) --------------------------
    eliminarCirugia(cirugia: any) {
        Swal.fire({
            title: '¿Eliminar (suspender) cirugía?',
            text: `Paciente ID: ${cirugia.paciente_id}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
        }).then((r) => {
            if (r.isConfirmed) {
                this.cirugiasService.eliminarCirugia(cirugia.id).subscribe(() => {
                    this.cargarPabellones();
                });
            }
        });
    }

    // Para colorear tarjeta según estado / extra_time
        getCardClasses(cir: any): any {

        // Cirugías de ASEO → color único dominante
        if (cir.es_aseo) {
            return {
                'bg-sky-100': true,      // Color exclusivo para ASEO
                'opacity-80': true,      // Opcional: se ve más "suave"
            };
        }

        // Cirugías PRINCIPALES
        return {
            'bg-gray-100': cir.estado === 'PROGRAMADA',
            'bg-amber-100': cir.estado === 'EN_CURSO',
            'bg-rose-200': cir.estado === 'COMPLICADA',
            'bg-emerald-100': cir.estado === 'FINALIZADA',
            'bg-neutral-200': cir.estado === 'CANCELADA',

            // fallback por si viene algún registro extraño
            'bg-gray-50': !cir.estado
        };
    }
}