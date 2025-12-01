import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalComponent } from 'angular-custom-modal';
import { TipoCirugiaService } from '@shared/services/tipo-cirugia.service';

@Component({
  moduleId: module.id,
  selector: 'app-tipo-cirugias',
  templateUrl: './tipo-cirugias.html'
})
export class TiposCirugiaComponent implements OnInit {

  tipos: any[] = [];
  tiposFiltrados: any[] = [];
  searchValue = '';

  params!: FormGroup;

  @ViewChild('modalTipo') modalTipo!: ModalComponent;

  constructor(
    private fb: FormBuilder,
    private tiposService: TipoCirugiaService
  ) {}

  ngOnInit() {
    this.cargarTipos();
  }

  cargarTipos() {
    this.tiposService.getTipos().subscribe(data => {
      this.tipos = data;
      this.tiposFiltrados = [...this.tipos];
    });
  }

  buscar() {
    this.tiposFiltrados = this.tipos.filter(t =>
      t.nombre.toLowerCase().includes(this.searchValue.toLowerCase())
    );
  }

  initForm() {
    this.params = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
      duracion_estimada: ['', Validators.required],
      descripcion: ['']
    });
  }

  editar(tipo?: any) {
    this.initForm();

    if (tipo) {
      this.params.patchValue(tipo);
    }

    this.modalTipo.open();
  }

  guardar() {
    if (this.params.invalid) return;

    const data = { ...this.params.value };

    if (data.id && data.id !== 0) {
      // UPDATE
      this.tiposService.updateTipo(data.id, data).subscribe(() => {
        this.cargarTipos();
        this.modalTipo.close();
      });
    } else {
      // CREATE
      delete data.id;
      this.tiposService.createTipo(data).subscribe(() => {
        this.cargarTipos();
        this.modalTipo.close();
      });
    }
  }

  eliminar(tipo: any) {
    Swal.fire({
      title: '¿Eliminar tipo de cirugía?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.tiposService.deleteTipo(tipo.id).subscribe(() => {
          this.cargarTipos();
        });
      }
    });
  }
}