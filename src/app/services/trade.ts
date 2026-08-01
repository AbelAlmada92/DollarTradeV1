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

  // Generar PDF
  generarComprobante(operacion: Dolar, esCreador: boolean) {
    const docPDF = new jsPDF();
    const fecha = new Date().toLocaleString();

    docPDF.setFontSize(18);
    docPDF.text('Comprobante de Operación', 20, 20);
    docPDF.setFontSize(12);

    docPDF.text(`ID: ${operacion.id}`, 20, 40);
    docPDF.text(`Fecha: ${fecha}`, 20, 50);
    docPDF.text(`Tipo de operación: ${operacion.tipoOperacion.toUpperCase()}`, 20, 60);
    docPDF.text(`Tipo de dólar: ${operacion.tipoDolar}`, 20, 70);
    docPDF.text(`Monto USD: ${operacion.montoUSD}`, 20, 80);
    docPDF.text(`Total en pesos: $${operacion.totalPesos}`, 20, 90);
    docPDF.text(`Usuario: ${operacion.usuarioNombre} (${operacion.usuarioId})`, 20, 100);
    docPDF.text('---------------------------', 20, 110);

    docPDF.text('Transacción completada ✅', 20, 120);
    if (esCreador && (operacion as any).confirmadoPor) {
      docPDF.text(
        `Confirmada por: ${(operacion as any).confirmadoNombre || ''} (${(operacion as any).confirmadoPor})`,
        20,
        130
      );
    }

    docPDF.save(`comprobante_${operacion.id}.pdf`);
  }
}



