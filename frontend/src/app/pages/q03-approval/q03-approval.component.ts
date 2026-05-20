import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

type Status = 'pending' | 'approved' | 'rejected';

interface Document {
  id: number;
  title: string;
  description: string;
  status: Status;
  reason: string;
  decided_at: string | null;
}

@Component({
  selector: 'app-q03-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header>
      <h1>No.3 — Approval Workflow</h1>
      <p class="muted">อนุมัติ / ไม่อนุมัติ พร้อมเหตุผล — อนุมัติแล้วกดซ้ำไม่ได้</p>
    </header>

    <div class="card mt-2">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of docs(); let i = index">
            <td>{{ i + 1 }}</td>
            <td>{{ d.title }}</td>
            <td class="muted">{{ d.description }}</td>
            <td><span class="badge" [class]="d.status">{{ statusLabel(d.status) }}</span></td>
            <td class="muted">{{ d.reason || '—' }}</td>
            <td>
              <ng-container *ngIf="d.status === 'pending'; else done">
                <button class="success" (click)="open(d, 'approved')">Approve</button>
                <button class="danger" (click)="open(d, 'rejected')">Reject</button>
              </ng-container>
              <ng-template #done><span class="muted small">ตัดสินใจแล้ว</span></ng-template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-backdrop" *ngIf="dialog() as d" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>{{ d.action === 'approved' ? 'Confirm Approve' : 'Confirm Reject' }}</h2>
        <p class="muted">{{ d.doc.title }}</p>
        <label>
          Reason
          <textarea rows="4" [(ngModel)]="reason" placeholder="กรอกเหตุผล..."></textarea>
        </label>
        <p class="error-text" *ngIf="error()">{{ error() }}</p>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button (click)="close()">Cancel</button>
          <button [class.success]="d.action === 'approved'" [class.danger]="d.action === 'rejected'"
                  (click)="confirm()" [disabled]="!reason.trim() || saving()">
            {{ saving() ? 'Saving...' : (d.action === 'approved' ? 'Confirm Approve' : 'Confirm Reject') }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class Q03ApprovalComponent implements OnInit {
  private api = inject(ApiService);
  docs = signal<Document[]>([]);
  dialog = signal<{ doc: Document; action: Status } | null>(null);
  reason = '';
  saving = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<Document[]>('/q03/documents').subscribe({
      next: (res) => this.docs.set(res.data || []),
    });
  }

  statusLabel(s: Status): string {
    return s === 'pending' ? 'รออนุมัติ' : s === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ';
  }

  open(doc: Document, action: Status): void {
    this.reason = '';
    this.error.set(null);
    this.dialog.set({ doc, action });
  }
  close(): void {
    this.dialog.set(null);
  }

  confirm(): void {
    const d = this.dialog();
    if (!d || !this.reason.trim()) return;
    const path = `/q03/documents/${d.doc.id}/${d.action === 'approved' ? 'approve' : 'reject'}`;
    this.saving.set(true);
    this.error.set(null);
    this.api.patch<Document>(path, { reason: this.reason.trim() }).subscribe({
      next: (res) => {
        this.docs.update((list) => list.map((x) => (x.id === res.data.id ? res.data : x)));
        this.saving.set(false);
        this.close();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'failed');
        this.saving.set(false);
      },
    });
  }
}
