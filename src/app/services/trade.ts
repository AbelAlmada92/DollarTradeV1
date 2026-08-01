import { Injectable, inject } from '@angular/core';
import { Firestore, collection, setDoc, doc, updateDoc, collectionData, query, where } from '@angular/fire/firestore';
import { Dolar } from '../interfaces/dolar.interface';
import { AuthService } from './auth';
import jsPDF from 'jspdf';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TradeService {
  private firestore: Firestore = inject(Firestore);
  private auth: AuthService = inject(AuthService);
  private collectionRef;

  constructor() {
    this.collectionRef = collection(this.firestore, 'operaciones');
  }

  // Crear operación
  async crearOperacion(op: Dolar) {
    const docRef = doc(this.collectionRef, op.id);
    await setDoc(docRef, { ...op, fecha: new Date().toISOString() });
  }

  // Observable en tiempo real — solo las operaciones del usuario indicado
  getOperaciones(usuarioId: string): Observable<Dolar[]> {
    const consulta = query(this.collectionRef, where('usuarioId', '==', usuarioId));
    return collectionData(consulta, { idField: 'id' }) as Observable<Dolar[]>;
  }

  // Confirmar operación
  async confirmarOperacion(operacion: Dolar) {
    const usuario = await this.auth.getCurrentUser();
    const docRef = doc(this.collectionRef, operacion.id);
    await updateDoc(docRef, {
      confirmado: true,
      confirmadoPor: usuario?.email || 'Desconocido',
      confirmadoNombre: usuario?.displayName || usuario?.email || 'Usuario',
    });
  }

  // Cancelar operación
  async cancelarOperacion(id: string) {
    const docRef = doc(this.collectionRef, id);
    await updateDoc(docRef, { cancelado: true });
  }

  // Generar comprobante PDF (estilo recibo moderno)
  generarComprobante(operacion: Dolar, esCreador: boolean) {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });

    const W = doc.internal.pageSize.getWidth();
    const mL = 14;
    const mR = W - 14;
    const contentW = mR - mL;

    // Paleta (alineada al tema de la app)
    const green = [5, 150, 105];
    const greenDark = [4, 132, 87];
    const tint = [236, 253, 245];
    const ink = [15, 23, 42];
    const muted = [100, 116, 139];
    const line = [226, 232, 240];

    const setFill = (c: number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const setText = (c: number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const setDraw = (c: number[]) => doc.setDrawColor(c[0], c[1], c[2]);

    // Formateo de valores
    const nf2 = (n: number) =>
      n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const usd = Number(operacion.montoUSD).toLocaleString('es-AR');
    const pesos = nf2(operacion.totalPesos);
    const cotiz = operacion.montoUSD ? nf2(operacion.totalPesos / operacion.montoUSD) : '-';
    const tipoTxt = operacion.tipoOperacion === 'compra' ? 'Compra' : 'Venta';

    const fechaRaw = (operacion as any).fecha;
    const fecha = fechaRaw
      ? new Date(fechaRaw).toLocaleString('es-AR')
      : new Date().toLocaleString('es-AR');
    const generado = new Date().toLocaleString('es-AR');

    // ---------- Encabezado ----------
    setFill(green);
    doc.rect(0, 0, W, 38, 'F');

    setFill([255, 255, 255]);
    doc.roundedRect(mL, 11, 13, 13, 3, 3, 'F');
    setText(green);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('$', mL + 6.5, 20, { align: 'center' });

    setText([255, 255, 255]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DollarTrade', mL + 18, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Comprobante de operación', mL + 18, 24);

    // ---------- Tarjeta del monto ----------
    const cardY = 46;
    const cardH = 28;
    setFill(tint);
    doc.roundedRect(mL, cardY, contentW, cardH, 3, 3, 'F');

    setText(greenDark);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('TOTAL EN PESOS', mL + 6, cardY + 8);

    setText(ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`$${pesos}`, mL + 6, cardY + 19);

    setText(muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${tipoTxt} · ${operacion.tipoDolar}`, mL + 6, cardY + 25);

    // Badge de estado
    const pillTxt = 'Completada';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const pw = doc.getTextWidth(pillTxt) + 6;
    const px = mR - 6 - pw;
    setFill(green);
    doc.roundedRect(px, cardY + 6, pw, 7, 3.5, 3.5, 'F');
    setText([255, 255, 255]);
    doc.text(pillTxt, px + pw / 2, cardY + 10.7, { align: 'center' });

    // ---------- Detalle ----------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setText(muted);
    doc.text('DETALLE', mL, cardY + cardH + 8);

    const rows: [string, string][] = [
      ['Tipo de operación', tipoTxt],
      ['Tipo de dólar', operacion.tipoDolar],
      ['Monto en USD', `US$ ${usd}`],
      ['Cotización aplicada', `$${cotiz}`],
      ['Fecha', fecha],
      ['Usuario', operacion.usuarioNombre],
    ];
    if (esCreador && operacion.confirmadoPor) {
      rows.push(['Confirmada por', operacion.confirmadoNombre || operacion.confirmadoPor]);
    }

    let y = cardY + cardH + 16;
    const rowH = 11;
    for (const [label, value] of rows) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setText(muted);
      doc.text(label, mL, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      setText(ink);
      doc.text(value, mR, y, { align: 'right' });

      setDraw(line);
      doc.setLineWidth(0.2);
      doc.line(mL, y + 4, mR, y + 4);
      y += rowH;
    }

    // ---------- Pie ----------
    y += 4;
    setText(muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`N° de operación: ${operacion.id}`, mL, y);
    doc.text(`Generado el ${generado}`, mL, y + 5);

    doc.setFontSize(7.5);
    doc.text(
      'Este comprobante certifica la operación registrada en DollarTrade.',
      W / 2,
      198,
      { align: 'center', maxWidth: contentW }
    );

    doc.save(`comprobante_${operacion.id}.pdf`);
  }
}



