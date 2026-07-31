import { Component, OnInit } from '@angular/core';
import { DollarService } from 'src/app/services/dolar';
import { TradeService } from 'src/app/services/trade';
import { AuthService } from 'src/app/services/auth';
import { Dolar } from 'src/app/interfaces/dolar.interface';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  cotizaciones: any[] = []; // La API devuelve objetos con {nombre, compra, venta}
  tipoOperacion: 'compra' | 'venta' = 'compra';
  dolarSeleccionado!: any;
  monto: number = 0;
  totalPesos: number = 0;

  constructor(
    private dollarService: DollarService,
    private tradeService: TradeService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.obtenerDolares();
  }

  obtenerDolares() {
    this.dollarService.getDolares().subscribe({
      next: (data) => this.cotizaciones = data,
      error: (err) => console.error('Error al obtener cotizaciones', err)
    });
  }

  calcularTotal() {
    if (!this.dolarSeleccionado || !this.monto) {
      this.totalPesos = 0;
      return;
    }

    const tasa = this.tipoOperacion === 'compra'
      ? this.dolarSeleccionado.venta
      : this.dolarSeleccionado.compra;

    this.totalPesos = this.monto * tasa;
  }

  // 🔹 Crear una nueva operación
  async crearOperacion() {
  if (!this.dolarSeleccionado || !this.monto) {
    alert('Completa todos los campos antes de confirmar');
    return;
  }

  const usuario = await this.auth.getCurrentUser(); // ✅ Asegúrate de esperar la promesa
  const usuarioNombre = usuario?.email || 'Anónimo';
  const usuarioId = usuario?.uid || 'sin-id';

  const nuevaOperacion: Dolar = {
    id: crypto.randomUUID(),
    tipoOperacion: this.tipoOperacion,
    tipoDolar: this.dolarSeleccionado.nombre,
    montoUSD: this.monto,
    totalPesos: this.totalPesos,
    confirmado: false,
    usuarioId,
    usuarioNombre
  };

  try {
    await this.tradeService.crearOperacion(nuevaOperacion);
    alert('✅ Operación creada con éxito');
  } catch (err) {
    console.error('Error al crear operación:', err);
    alert('❌ Error al crear la operación');
  }

  // Reset de valores
  this.monto = 0;
  this.totalPesos = 0;
  this.dolarSeleccionado = null;
}
}

