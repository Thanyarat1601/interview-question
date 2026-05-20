import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

type Screen = 'main' | 'show' | 'reset';

@Component({
  selector: 'app-q05-queue',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header>
      <h1>No.5 — Queue Ticket</h1>
      <p class="muted">รับบัตรคิว A0 → Z9 (260 ตั๋ว). Backend ใช้ row-level lock กันการกดพร้อมกัน</p>
    </header>

    <div class="card mt-2" style="max-width:520px;">
      <!-- IT 05-1: main -->
      <ng-container *ngIf="screen() === 'main'">
        <h2>IT 05-1 — รับบัตรคิว</h2>
        <p class="muted">หมายเลขคิวล่าสุด: <strong>{{ current() }}</strong></p>
        <div class="row mt-2">
          <button class="primary" (click)="take()" [disabled]="loading()">
            {{ loading() ? 'กำลังออกบัตร...' : 'รับบัตรคิว' }}
          </button>
          <button class="danger" (click)="goReset()">ล้างคิว</button>
        </div>
        <p class="error-text" *ngIf="error()">{{ error() }}</p>
        <p class="mt-2 muted small">ลองกดรัวๆ จะเห็นว่าเลขรันต่อเนื่องไม่ซ้ำ — backend lock row ก่อน increment</p>
      </ng-container>

      <!-- IT 05-2: show ticket -->
      <ng-container *ngIf="screen() === 'show'">
        <h2>IT 05-2 — บัตรคิวของคุณ</h2>
        <div class="ticket">{{ current() }}</div>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button (click)="back()">← กลับหน้ารับบัตร</button>
        </div>
      </ng-container>

      <!-- IT 05-3: reset confirmed -->
      <ng-container *ngIf="screen() === 'reset'">
        <h2>IT 05-3 — ล้างคิว</h2>
        <p class="muted">ยืนยันล้างคิวทั้งหมด — หมายเลขจะกลับเป็น 00</p>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button (click)="back()">Cancel</button>
          <button class="danger" (click)="doReset()" [disabled]="loading()">
            {{ loading() ? 'Resetting...' : 'ยืนยันล้างคิว' }}
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .ticket {
      font-size: 4rem;
      font-weight: 700;
      text-align: center;
      padding: 2rem;
      background: var(--primary);
      color: #fff;
      border-radius: 12px;
      letter-spacing: 0.1em;
    }
    .small { font-size: 0.8rem; }
  `],
})
export class Q05QueueComponent implements OnInit {
  private api = inject(ApiService);
  screen = signal<Screen>('main');
  current = signal<string>('00');
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.api.get<{ current: string }>('/q05/queue/current').subscribe({
      next: (res) => this.current.set(res.data.current),
    });
  }

  take(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.post<{ current: string }>('/q05/queue/next', {}).subscribe({
      next: (res) => {
        this.current.set(res.data.current);
        this.loading.set(false);
        this.screen.set('show');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'failed');
        this.loading.set(false);
      },
    });
  }

  goReset(): void { this.screen.set('reset'); }
  back(): void { this.screen.set('main'); }

  doReset(): void {
    this.loading.set(true);
    this.api.post<{ current: string }>('/q05/queue/reset', {}).subscribe({
      next: (res) => {
        this.current.set(res.data.current);
        this.loading.set(false);
        this.screen.set('main');
      },
      error: () => this.loading.set(false),
    });
  }
}
