import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Person {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-q01-person',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header class="row">
      <div>
        <h1>No.1 — Person Management</h1>
        <p class="muted">CRUD ข้อมูลคน คำนวณอายุจากวันเกิด และดูแบบ read-only</p>
      </div>
      <div class="spacer"></div>
      <button class="primary" (click)="openAdd()">+ Add Person</button>
    </header>

    <div class="card mt-2">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Birth Date</th>
            <th>Age</th>
            <th>Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="!persons().length">
            <td colspan="7" class="muted" style="text-align:center;">No data — click Add Person</td>
          </tr>
          <tr *ngFor="let p of persons(); let i = index">
            <td>{{ i + 1 }}</td>
            <td>{{ p.first_name }}</td>
            <td>{{ p.last_name }}</td>
            <td>{{ p.birth_date }}</td>
            <td>{{ p.age }}</td>
            <td>{{ p.address }}</td>
            <td><button (click)="openView(p)">View</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Modal -->
    <div class="modal-backdrop" *ngIf="showAdd()" (click)="closeAdd()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>Add Person</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" class="col">
          <label>
            First Name
            <input formControlName="first_name" />
          </label>
          <label>
            Last Name
            <input formControlName="last_name" />
          </label>
          <label>
            Birth Date
            <input type="date" formControlName="birth_date" />
          </label>
          <label>
            Address
            <textarea rows="3" formControlName="address"></textarea>
          </label>
          <p class="error-text" *ngIf="error()">{{ error() }}</p>
          <div class="row mt-1">
            <div class="spacer"></div>
            <button type="button" (click)="closeAdd()">Cancel</button>
            <button type="submit" class="primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div class="modal-backdrop" *ngIf="viewing() as v" (click)="viewing.set(null)">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>View Person (Read-only)</h2>
        <div class="col">
          <div><strong>ID:</strong> {{ v.id }}</div>
          <div><strong>First Name:</strong> {{ v.first_name }}</div>
          <div><strong>Last Name:</strong> {{ v.last_name }}</div>
          <div><strong>Birth Date:</strong> {{ v.birth_date }}</div>
          <div><strong>Age:</strong> {{ v.age }}</div>
          <div><strong>Address:</strong> {{ v.address }}</div>
        </div>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button (click)="viewing.set(null)">Close</button>
        </div>
      </div>
    </div>
  `,
})
export class Q01PersonComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  persons = signal<Person[]>([]);
  showAdd = signal(false);
  viewing = signal<Person | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    birth_date: ['', [Validators.required]],
    address: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<Person[]>('/q01/persons').subscribe({
      next: (res) => this.persons.set(res.data || []),
      error: (err) => this.error.set(err?.error?.message || 'failed to load'),
    });
  }

  openAdd(): void {
    this.form.reset({ first_name: '', last_name: '', birth_date: '', address: '' });
    this.error.set(null);
    this.showAdd.set(true);
  }
  closeAdd(): void {
    this.showAdd.set(false);
  }
  openView(p: Person): void {
    this.viewing.set(p);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    this.api.post<Person>('/q01/persons', this.form.getRawValue()).subscribe({
      next: (res) => {
        this.persons.update((list) => [...list, res.data]);
        this.saving.set(false);
        this.closeAdd();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'failed to save');
        this.saving.set(false);
      },
    });
  }
}
