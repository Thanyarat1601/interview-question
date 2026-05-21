import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Question {
  id: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
}

interface Submission {
  id: number;
  student_name: string;
  score: number;
  total_count: number;
  created_at: string;
}

type Phase = 'name' | 'exam' | 'result';

@Component({
  selector: 'app-q10-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header>
      <h1>No.10 — Take Exam</h1>
      <p class="muted">เลือกคำตอบได้ 1 ข้อ ต่อคำถาม. ส่งแล้วระบบคำนวณคะแนนและบันทึก</p>
    </header>

    <!-- Phase: enter name -->
    <ng-container *ngIf="phase() === 'name'">
      <div class="card mt-2" style="max-width:480px;">
        <h3>เริ่มสอบ</h3>
        <label>ชื่อผู้สอบ
          <input [(ngModel)]="studentName" placeholder="กรอกชื่อของคุณ" />
        </label>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button class="primary" (click)="start()" [disabled]="!studentName.trim()">เริ่มทำข้อสอบ</button>
        </div>
      </div>
    </ng-container>

    <!-- Phase: exam -->
    <ng-container *ngIf="phase() === 'exam'">
      <div class="card mt-2">
        <p class="muted">ผู้สอบ: <strong>{{ studentName }}</strong> — ทั้งหมด {{ questions().length }} ข้อ</p>
        <ol class="qlist">
          <li *ngFor="let q of questions(); let i = index">
            <strong>{{ q.question_text }}</strong>
            <div class="choices">
              <label *ngFor="let opt of ['A','B','C','D']">
                <input type="radio" [name]="'q' + q.id" [value]="opt" [(ngModel)]="answers[q.id]" />
                <span>{{ opt }}. {{ choiceText(q, opt) }}</span>
              </label>
            </div>
          </li>
        </ol>
        <p class="error-text" *ngIf="error()">{{ error() }}</p>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button class="primary" (click)="submit()" [disabled]="saving() || !allAnswered()">
            {{ saving() ? 'Submitting...' : 'Submit Exam' }}
          </button>
        </div>
      </div>
    </ng-container>

    <!-- Phase: result -->
    <ng-container *ngIf="phase() === 'result'">
      <div class="card mt-2" style="max-width:520px; text-align:center;">
        <h2>ผลการสอบ</h2>
        <div class="score-circle">
          <span>{{ result()?.score }}</span>
          <small>/ {{ result()?.total_count }}</small>
        </div>
        <p class="muted">ผู้สอบ: <strong>{{ result()?.student_name }}</strong></p>
        <p class="muted small">วันที่: {{ result()?.created_at | date: 'medium' }}</p>
        <button class="primary mt-2" (click)="restart()">สอบอีกครั้ง</button>
      </div>
    </ng-container>
  `,
  styles: [`
    .qlist { padding-left: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .qlist li { line-height: 1.6; }
    .choices { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.4rem; }
    .choices label { display: flex; gap: 0.5rem; align-items: center; cursor: pointer; padding: 0.3rem 0.5rem; border-radius: 6px; }
    .choices label:hover { background: #f1f5f9; }
    .score-circle {
      width: 140px; height: 140px; border-radius: 50%;
      background: var(--primary); color: #fff; margin: 1rem auto;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .score-circle span { font-size: 3rem; font-weight: 700; line-height: 1; }
    .score-circle small { font-size: 1rem; opacity: 0.85; }
    .small { font-size: 0.8rem; }
  `],
})
export class Q10ExamComponent implements OnInit {
  private api = inject(ApiService);

  phase = signal<Phase>('name');
  studentName = '';
  questions = signal<Question[]>([]);
  answers: Record<number, string> = {};
  saving = signal(false);
  error = signal<string | null>(null);
  result = signal<Submission | null>(null);

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.api.get<Question[]>('/q10/questions').subscribe({
      next: (res) => this.questions.set(res.data || []),
    });
  }

  choiceText(q: Question, opt: string): string {
    return ({ A: q.choice_a, B: q.choice_b, C: q.choice_c, D: q.choice_d } as Record<string, string>)[opt];
  }

  start(): void {
    if (!this.studentName.trim()) return;
    this.answers = {};
    this.phase.set('exam');
  }

  allAnswered(): boolean {
    return this.questions().every((q) => !!this.answers[q.id]);
  }

  submit(): void {
    if (!this.allAnswered()) {
      this.error.set('กรุณาตอบให้ครบทุกข้อ');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const payload = {
      student_name: this.studentName.trim(),
      answers: Object.entries(this.answers).map(([qid, ans]) => ({
        question_id: Number(qid),
        chosen_answer: ans,
      })),
    };
    this.api.post<Submission>('/q10/submissions', payload).subscribe({
      next: (res) => {
        this.result.set(res.data);
        this.phase.set('result');
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'submit failed');
        this.saving.set(false);
      },
    });
  }

  restart(): void {
    this.studentName = '';
    this.answers = {};
    this.result.set(null);
    this.phase.set('name');
    this.loadQuestions();
  }
}
