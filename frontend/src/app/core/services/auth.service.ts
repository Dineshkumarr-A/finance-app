import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';

const TOKEN_KEY = 'finance_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Observable<void> {
    return this.http.post<{ token: string }>('/api/auth/login', { email, password }).pipe(
      tap(res => localStorage.setItem(TOKEN_KEY, res.token)),
      map(() => void 0)
    );
  }

  register(email: string, password: string): Observable<void> {
    return this.http.post<{ token: string }>('/api/auth/register', { email, password }).pipe(
      tap(res => localStorage.setItem(TOKEN_KEY, res.token)),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
