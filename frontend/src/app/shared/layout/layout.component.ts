import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  number: number;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">
          <h2>example.com</h2>
          <p class="muted">Interview Test</p>
        </div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-no">📊</span> Dashboard
          </a>
          <a *ngFor="let item of navItems"
             [routerLink]="['/' + item.path]"
             routerLinkActive="active"
             class="nav-item">
            <span class="nav-no">No.{{ item.number }}</span> {{ item.label }}
          </a>
        </nav>
        <div class="auth-status">
          <ng-container *ngIf="auth.user() as u; else loggedOut">
            <small class="muted">Logged in as</small>
            <strong>{{ u.username }}</strong>
            <button (click)="auth.clear()">Logout</button>
          </ng-container>
          <ng-template #loggedOut>
            <small class="muted">Not logged in</small>
          </ng-template>
        </div>
      </aside>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        min-height: 100vh;
      }
      .sidebar {
        background: #0f172a;
        color: #e2e8f0;
        padding: 1.25rem 1rem;
        display: flex;
        flex-direction: column;
      }
      .brand h2 {
        margin: 0;
        font-size: 1.1rem;
        color: #fff;
      }
      .brand .muted {
        margin: 0;
        font-size: 0.8rem;
        color: #94a3b8;
      }
      nav {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.75rem;
        border-radius: 8px;
        color: #cbd5e1;
        font-size: 0.9rem;
      }
      .nav-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        text-decoration: none;
      }
      .nav-item.active {
        background: #2563eb;
        color: #fff;
      }
      .nav-no {
        font-size: 0.75rem;
        background: rgba(255, 255, 255, 0.08);
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        min-width: 40px;
        text-align: center;
      }
      .nav-item.active .nav-no {
        background: rgba(255, 255, 255, 0.18);
      }
      .auth-status {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 1rem;
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .auth-status button {
        background: transparent;
        color: #cbd5e1;
        border: 1px solid #334155;
      }
      .auth-status button:hover { background: rgba(255, 255, 255, 0.06); }
      .content { padding: 2rem; overflow-x: auto; }
    `,
  ],
})
export class LayoutComponent {
  auth = inject(AuthService);
  navItems: NavItem[] = [
    { path: 'q01-person', label: 'Person CRUD', number: 1 },
    { path: 'q02-auth', label: 'Auth / JWT', number: 2 },
    { path: 'q03-approval', label: 'Approval', number: 3 },
    { path: 'q04-profile', label: 'Profile Form', number: 4 },
    { path: 'q05-queue', label: 'Queue Ticket', number: 5 },
    { path: 'q06-barcode', label: 'Barcode', number: 6 },
    { path: 'q07-qrcode', label: 'QR Code', number: 7 },
    { path: 'q08-exam-management', label: 'Exam Mgmt', number: 8 },
    { path: 'q09-comment', label: 'Comment Box', number: 9 },
    { path: 'q10-exam', label: 'Take Exam', number: 10 },
  ];
}
