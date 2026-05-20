import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Question {
  number: number;
  path: string;
  title: string;
  summary: string;
  status: 'done' | 'todo';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header>
      <h1>Application Test Dashboard</h1>
      <p class="muted">
        Interview test for example.com — single full-stack project (Go + Angular + PostgreSQL)
        containing all 10 questions as modules.
      </p>
    </header>

    <div class="grid">
      <a *ngFor="let q of questions" [routerLink]="['/' + q.path]" class="tile">
        <div class="tile-head">
          <span class="num">No.{{ q.number }}</span>
          <span class="status" [class.done]="q.status === 'done'">
            {{ q.status === 'done' ? 'Implemented' : 'Skeleton' }}
          </span>
        </div>
        <h3>{{ q.title }}</h3>
        <p class="muted">{{ q.summary }}</p>
      </a>
    </div>
  `,
  styles: [
    `
      header { margin-bottom: 1.5rem; }
      h1 { margin: 0 0 0.25rem; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }
      .tile {
        background: var(--surface);
        border-radius: var(--radius);
        padding: 1.25rem;
        box-shadow: var(--shadow);
        color: var(--text);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .tile:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        text-decoration: none;
      }
      .tile-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .num {
        font-weight: 600;
        color: var(--primary);
        font-size: 0.85rem;
      }
      .status {
        font-size: 0.75rem;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        background: #fef3c7;
        color: #92400e;
      }
      .status.done { background: #d1fae5; color: #065f46; }
      h3 { margin: 0; font-size: 1.05rem; }
      .muted { margin: 0; font-size: 0.85rem; }
    `,
  ],
})
export class DashboardComponent {
  questions: Question[] = [
    { number: 1, path: 'q01-person', title: 'Person CRUD', summary: 'เพิ่ม/ดูข้อมูลคน คำนวณอายุ + View modal', status: 'done' },
    { number: 2, path: 'q02-auth', title: 'Auth / JWT', summary: 'Register + Login พร้อม hash password และ JWT', status: 'done' },
    { number: 3, path: 'q03-approval', title: 'Approval Workflow', summary: 'อนุมัติ/ไม่อนุมัติ พร้อมเหตุผล', status: 'done' },
    { number: 4, path: 'q04-profile', title: 'Profile Form', summary: 'Form validation + Profile Base64', status: 'done' },
    { number: 5, path: 'q05-queue', title: 'Queue Ticket', summary: 'รับบัตรคิว A0–Z9 (concurrency safe)', status: 'done' },
    { number: 6, path: 'q06-barcode', title: 'Product + Barcode', summary: '16-char product code + Code 39 barcode', status: 'done' },
    { number: 7, path: 'q07-qrcode', title: 'Product + QR', summary: '30-char unique product code + QR modal', status: 'done' },
    { number: 8, path: 'q08-exam-management', title: 'Exam Management', summary: 'จัดการข้อสอบ + running number ใหม่หลังลบ', status: 'done' },
    { number: 9, path: 'q09-comment', title: 'Comment Box', summary: 'พิมพ์ + Enter แสดง comment (Blend 285)', status: 'done' },
    { number: 10, path: 'q10-exam', title: 'Take Exam', summary: 'ทำข้อสอบ บันทึกผู้สอบ + คะแนน', status: 'done' },
  ];
}
