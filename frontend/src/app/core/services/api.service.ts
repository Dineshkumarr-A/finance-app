import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlannerState } from '../models/planner.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  loadPlan(): Observable<PlannerState | null> {
    return this.http.get<PlannerState>(`${this.baseUrl}/plan`).pipe(
      catchError(() => of(null))
    );
  }

  savePlan(state: PlannerState): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/plan`, state).pipe(
      catchError(() => of({ success: false }))
    );
  }
}
