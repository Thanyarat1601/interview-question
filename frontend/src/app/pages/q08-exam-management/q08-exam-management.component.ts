import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Exam {
  no: number;
  id: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: string;
}

@Component({
  selector: 'app-q08-exam-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header>
      <h1>No.8 — Exam Management</h1>
      <p class="muted">เพิ่ม/ลบข้อสอบ — เลขข้อ (No.) จะ re-number ใหม่หลังลบ</p>
    </header>

    <ng-container *ngIf="mode() === 'list'">
      <div class="row mt-2">
        <div class="spacer"></div>
        <button class="primary" (click)="goAdd()">+ เพิ่มข้อสอบ</button>
      </div>

      <div class="card mt-2">
        <table>
          <thead>
            <tr><th>No.</th><th>Question</th><th>Choices</th><th>Correct</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngIf="!exams().length"><td colspan="5" class="muted" style="text-align:center;">ยังไม่มีข้อสอบ</td></tr>
            <tr *ngFor="let e of exams()">
              <td><strong>{{ e.no }}</strong></td>
              <td>{{ e.question_text }}</td>
              <td class="muted small">
                A: {{ e.choice_a }}<br>
                B: {{ e.choice_b }}<br>
                C: {{ e.choice_c }}<br>
                D: {{ e.choice_d }}
              </td>
              <td><span class="badge approved">{{ e.correct_answer }}</span></td>
              <td><button class="danger" (click)="del(e)">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <ng-container *ngIf="mode() === 'add'">
      <div class="card mt-2" style="max-width:680px;">
        <h2>เพิ่มข้อสอบ</h2>
        <form [formGroup]="form" (ngSubmit)="save()" class="col">
          <label>Question
            <textarea rows="3" formControlName="question_text"></textarea>
          </label>
          <label>Choice A <input formControlName="choice_a" /></label>
          <label>Choice B <input formControlName="choice_b" /></label>
          <label>Choice C <input formControlName="choice_c" /></label>
          <label>Choice D <input formControlName="choice_d" /></label>
          <label>Correct Answer
            <select formControlName="correct_answer">
              <option value="">-- เลือก --</option>
              <option value="A">A</option><option value="B">B</option>
              <option value="C">C</option><option value="D">D</option>
            </select>
          </label>
          <p class="error-text" *ngIf="error()">{{ error() }}</p>
          <div class="row mt-2">
            <div class="spacer"></div>
            <button type="button" (click)="cancel()">Cancel</button>
            <button type="submit" class="primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </ng-container>
  `,
  styles: [`.small { font-size: 0.8rem; }`],
})
export class Q08ExamManagementComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  mode = signal<'list' | 'add'>('list');
  exams = signal<Exam[]>([]);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    question_text: ['', Validators.required],
    choice_a: ['', Validators.required],
    choice_b: ['', Validators.required],
    choice_c: ['', Validators.required],
    choice_d: ['', Validators.required],
    correct_answer: ['', Validators.required],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<Exam[]>('/q08/exams').subscribe({
      next: (res) => this.exams.set(res.data || []),
    });
  }

  goAdd(): void {
    this.form.reset({
      question_text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: '',
    });
    this.error.set(null);
    this.mode.set('add');
  }
  cancel(): void { this.mode.set('list'); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    this.api.post('/q08/exams', this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.mode.set('list');
        this.load();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'failed');
        this.saving.set(false);
      },
    });
  }

  del(e: Exam): void {
    if (!confirm(`ลบข้อ "${e.question_text}" ?`)) return;
    this.api.delete(`/q08/exams/${e.id}`).subscribe({
      next: () => this.load(),
    });
  }
}
