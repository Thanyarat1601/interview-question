import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

type Mode = 'login' | 'register';

interface AuthResponse {
  token: string;
  expires_at: string;
  username: string;
  user_id: number;
}

@Component({
  selector: 'app-q02-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header>
      <h1>No.2 — Authentication (JWT)</h1>
      <p class="muted">Register/Login พร้อม bcrypt + JWT token validate</p>
    </header>

    <div class="card mt-2" *ngIf="!auth.isAuthenticated(); else welcome" style="max-width:480px;">
      <div class="row" style="margin-bottom:1rem; gap: 0.5rem;">
        <button [class.primary]="mode() === 'login'" (click)="setMode('login')">Login</button>
        <button [class.primary]="mode() === 'register'" (click)="setMode('register')">สมัครสมาชิก</button>
      </div>

      <form *ngIf="mode() === 'login'" [formGroup]="loginForm" (ngSubmit)="login()" class="col">
        <label>Username <input formControlName="username" autocomplete="username" /></label>
        <label>Password <input type="password" formControlName="password" autocomplete="current-password" /></label>
        <p class="error-text" *ngIf="error()">{{ error() }}</p>
        <button class="primary" type="submit" [disabled]="loginForm.invalid || loading()">
          {{ loading() ? 'Signing in...' : 'Login' }}
        </button>
      </form>

      <form *ngIf="mode() === 'register'" [formGroup]="registerForm" (ngSubmit)="register()" class="col">
        <label>Username <input formControlName="username" autocomplete="username" /></label>
        <label>Password <input type="password" formControlName="password" autocomplete="new-password" /></label>
        <label>Confirm Password <input type="password" formControlName="confirm_password" autocomplete="new-password" /></label>
        <p class="error-text" *ngIf="passwordMismatch()">Password and Confirm Password do not match</p>
        <p class="error-text" *ngIf="error()">{{ error() }}</p>
        <p class="success-text" *ngIf="success()">{{ success() }}</p>
        <button class="primary" type="submit" [disabled]="registerForm.invalid || passwordMismatch() || loading()">
          {{ loading() ? 'Creating...' : 'สมัครสมาชิก' }}
        </button>
      </form>
    </div>

    <ng-template #welcome>
      <div class="card mt-2" style="max-width:480px;">
        <h2>Welcome, {{ auth.user()?.username }} 👋</h2>
        <p class="muted">JWT validated. Token stored in localStorage.</p>
        <div class="col">
          <button (click)="checkMe()" [disabled]="loading()">
            {{ loading() ? 'Checking...' : 'Validate JWT (/me)' }}
          </button>
          <p class="success-text" *ngIf="meResponse()">/me said: {{ meResponse() }}</p>
          <p class="error-text" *ngIf="error()">{{ error() }}</p>
          <button class="danger" (click)="logout()">Logout</button>
        </div>
      </div>
    </ng-template>
  `,
})
export class Q02AuthComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  mode = signal<Mode>('login');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  meResponse = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', [Validators.required, Validators.minLength(6)]],
  });

  passwordMismatch = computed(() => {
    const v = this.registerForm.getRawValue();
    return v.password.length > 0 && v.confirm_password.length > 0 && v.password !== v.confirm_password;
  });

  constructor() {
    this.registerForm.valueChanges.subscribe(() => this.passwordMismatch());
  }

  setMode(m: Mode): void {
    this.mode.set(m);
    this.error.set(null);
    this.success.set(null);
  }

  login(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.post<AuthResponse>('/q02/login', this.loginForm.getRawValue()).subscribe({
      next: (res) => {
        this.auth.setSession(res.data.token, { user_id: res.data.user_id, username: res.data.username });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'login failed');
        this.loading.set(false);
      },
    });
  }

  register(): void {
    if (this.passwordMismatch()) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    this.api.post<{ id: number; username: string }>('/q02/register', this.registerForm.getRawValue()).subscribe({
      next: (res) => {
        this.success.set(`Registered as ${res.data.username}. กรุณา login.`);
        this.loading.set(false);
        this.mode.set('login');
        this.loginForm.patchValue({ username: res.data.username });
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'register failed');
        this.loading.set(false);
      },
    });
  }

  checkMe(): void {
    this.loading.set(true);
    this.error.set(null);
    this.meResponse.set(null);
    this.api.get<{ user_id: number; username: string }>('/q02/me').subscribe({
      next: (res) => {
        this.meResponse.set(`user_id=${res.data.user_id}, username=${res.data.username}`);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'JWT validation failed');
        this.loading.set(false);
      },
    });
  }

  logout(): void {
    this.auth.clear();
    this.meResponse.set(null);
  }
}
