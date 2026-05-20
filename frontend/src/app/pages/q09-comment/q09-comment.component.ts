import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Comment {
  id: number;
  commenter_name: string;
  message: string;
  created_at: string;
}

@Component({
  selector: 'app-q09-comment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header>
      <h1>No.9 — Comment</h1>
      <p class="muted">พิมพ์ข้อความแล้วกด Enter จะถูกบันทึกและแสดงต่อท้าย</p>
    </header>

    <div class="card mt-2" style="max-width:640px;">
      <h3>Comment by Blend 285</h3>
      <input
        [(ngModel)]="draft"
        (keydown.enter)="submit()"
        placeholder="พิมพ์ข้อความแล้วกด Enter..."
        [disabled]="saving()"
        autofocus
      />
      <p class="error-text" *ngIf="error()">{{ error() }}</p>

      <ul class="comments mt-2">
        <li *ngIf="!comments().length" class="muted">ยังไม่มี comment</li>
        <li *ngFor="let c of comments()">
          <div class="row">
            <strong>{{ c.commenter_name }}</strong>
            <span class="muted small">{{ c.created_at | date: 'short' }}</span>
          </div>
          <div>{{ c.message }}</div>
        </li>
      </ul>
    </div>
  `,
  styles: [
    `
      .comments {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .comments li {
        background: #f9fafb;
        border-left: 3px solid var(--primary);
        padding: 0.6rem 0.8rem;
        border-radius: 6px;
      }
      .small { font-size: 0.8rem; }
    `,
  ],
})
export class Q09CommentComponent implements OnInit {
  private api = inject(ApiService);
  comments = signal<Comment[]>([]);
  draft = '';
  saving = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<Comment[]>('/q09/comments').subscribe({
      next: (res) => this.comments.set(res.data || []),
    });
  }

  submit(): void {
    const msg = this.draft.trim();
    if (!msg) return;
    this.saving.set(true);
    this.error.set(null);
    this.api.post<Comment>('/q09/comments', { message: msg }).subscribe({
      next: (res) => {
        this.comments.update((list) => [...list, res.data]);
        this.draft = '';
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'failed to post comment');
        this.saving.set(false);
      },
    });
  }
}
