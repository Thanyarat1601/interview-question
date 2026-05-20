import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

const OCCUPATIONS = ['Developer', 'Tester', 'Business Analyst', 'Manager', 'Designer', 'DevOps'];
// DD/MM/YYYY where DD = 01..31, MM = 01..12, YYYY = 1900..2099
const BIRTH_DATE_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
const PHONE_REGEX = /^\+?[0-9\-\s]{8,20}$/;

@Component({
  selector: 'app-q04-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header>
      <h1>No.4 — Profile Form</h1>
      <p class="muted">Validate email/phone/birthday + profile รูปจะถูก convert เป็น Base64</p>
    </header>

    <div class="card mt-2" style="max-width:640px;">
      <form [formGroup]="form" (ngSubmit)="save()" class="col">
        <label>
          Full Name
          <input formControlName="full_name" />
          <small class="error-text" *ngIf="touched('full_name')">required</small>
        </label>
        <label>
          Email
          <input type="email" formControlName="email" />
          <small class="error-text" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
            invalid email
          </small>
        </label>
        <label>
          Phone
          <input formControlName="phone" placeholder="0812345678 หรือ +66812345678" />
          <small class="error-text" *ngIf="form.get('phone')?.invalid && form.get('phone')?.touched">
            invalid phone format
          </small>
        </label>
        <label>
          Birth Day (DD/MM/YYYY)
          <input formControlName="birth_date" placeholder="วัน/เดือน/ปี เช่น 01/06/1995" />
          <small class="error-text" *ngIf="form.get('birth_date')?.invalid && form.get('birth_date')?.touched">
            ต้องเป็นรูปแบบ DD/MM/YYYY
          </small>
        </label>
        <label>
          Occupation
          <select formControlName="occupation">
            <option value="">-- เลือกอาชีพ --</option>
            <option *ngFor="let o of occupations" [value]="o">{{ o }}</option>
          </select>
        </label>
        <label>
          Profile Image
          <input type="file" accept="image/*" (change)="onFileChange($event)" />
          <img *ngIf="form.get('image_data')?.value" [src]="form.get('image_data')?.value" class="preview" alt="preview"/>
        </label>

        <p class="error-text" *ngIf="error()">{{ error() }}</p>
        <p class="success-text" *ngIf="savedId()">
          save data success — ID: <strong>{{ savedId() }}</strong>
        </p>

        <div class="row mt-2">
          <div class="spacer"></div>
          <button type="button" (click)="clear()">Clear</button>
          <button type="submit" class="primary" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .preview { max-width: 140px; max-height: 140px; border-radius: 8px; margin-top: 0.5rem; }
  `],
})
export class Q04ProfileComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  occupations = OCCUPATIONS;
  savedId = signal<number | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_REGEX)]],
    birth_date: ['', [Validators.required, Validators.pattern(BIRTH_DATE_REGEX)]],
    occupation: ['', [Validators.required]],
    image_data: [''],
  });

  touched(key: string): boolean {
    const c = this.form.get(key);
    return !!c && c.invalid && c.touched;
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ image_data: reader.result as string });
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.savedId.set(null);
    this.api.post<{ id: number }>('/q04/profiles', this.form.getRawValue()).subscribe({
      next: (res) => {
        this.savedId.set(res.data.id);
        this.saving.set(false);
        this.clearFormOnly();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'save failed');
        this.saving.set(false);
      },
    });
  }

  clear(): void {
    this.clearFormOnly();
    this.savedId.set(null);
  }
  private clearFormOnly(): void {
    this.form.reset({
      full_name: '', email: '', phone: '', birth_date: '', occupation: '', image_data: '',
    });
  }
}
