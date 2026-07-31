import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dolar } from '../interfaces/dolar.interface';

@Injectable({
  providedIn: 'root'
})
export class DollarService {
  private apiUrl = 'https://dolarapi.com/v1/dolares';

  constructor(private http: HttpClient) {}

  getDolares(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
