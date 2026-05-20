import {
  AfterViewChecked, Component, ElementRef, OnInit, QueryList, ViewChildren, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import JsBarcode from 'jsbarcode';
import { ApiService } from '../../core/services/api.service';

interface Product {
  id: number;
  product_code: string;
}

const CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

@Component({
  selector: 'app-q06-barcode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header>
      <h1>No.6 — Product Code + Barcode (Code 39)</h1>
      <p class="muted">Format: <code>XXXX-XXXX-XXXX-XXXX</code> (A–Z, 0–9), 16 ตัวอักษร</p>
    </header>

    <div class="card mt-2" style="max-width:760px;">
      <div class="row">
        <input
          [(ngModel)]="draft"
          placeholder="ABCD-1234-EFGH-5678"
          (input)="draft = draft.toUpperCase()"
          style="flex:1;"
        />
        <button class="primary" (click)="add()" [disabled]="saving()">
          {{ saving() ? 'Saving...' : 'Add' }}
        </button>
      </div>
      <p class="error-text" *ngIf="error()">{{ error() }}</p>
      <p class="muted small">ตัวอย่าง: ABCD-1234-EFGH-5678</p>
    </div>

    <div class="card mt-2">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Product Code</th>
            <th>Barcode (Code 39)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="!products().length">
            <td colspan="4" class="muted" style="text-align:center;">ยังไม่มีรายการ</td>
          </tr>
          <tr *ngFor="let p of products(); let i = index">
            <td>{{ i + 1 }}</td>
            <td><code>{{ p.product_code }}</code></td>
            <td>
              <svg #barcode [attr.data-code]="rawCode(p.product_code)"></svg>
            </td>
            <td><button class="danger" (click)="askDelete(p)">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-backdrop" *ngIf="confirming() as c" (click)="confirming.set(null)">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>Confirm Delete</h2>
        <p>คุณต้องการลบรหัส <strong>{{ c.product_code }}</strong> ใช่หรือไม่?</p>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button (click)="confirming.set(null)">Cancel</button>
          <button class="danger" (click)="doDelete(c)">Confirm Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    code { font-family: 'Consolas', monospace; }
    .small { font-size: 0.8rem; }
    svg { background: #fff; }
  `],
})
export class Q06BarcodeComponent implements OnInit, AfterViewChecked {
  private api = inject(ApiService);
  @ViewChildren('barcode') svgRefs!: QueryList<ElementRef<SVGElement>>;

  products = signal<Product[]>([]);
  draft = '';
  saving = signal(false);
  error = signal<string | null>(null);
  confirming = signal<Product | null>(null);

  ngOnInit(): void { this.load(); }

  ngAfterViewChecked(): void {
    this.svgRefs?.forEach((ref) => {
      const code = ref.nativeElement.getAttribute('data-code') ?? '';
      if (!code) return;
      try {
        JsBarcode(ref.nativeElement, code, {
          format: 'CODE39',
          height: 50,
          width: 1.2,
          fontSize: 12,
          margin: 4,
        });
      } catch {
        /* ignore */
      }
    });
  }

  rawCode(formatted: string): string {
    return formatted.replace(/-/g, '');
  }

  load(): void {
    this.api.get<Product[]>('/q06/products').subscribe({
      next: (res) => this.products.set(res.data || []),
    });
  }

  add(): void {
    const code = this.draft.trim().toUpperCase();
    if (!CODE_REGEX.test(code)) {
      this.error.set('format ต้องเป็น XXXX-XXXX-XXXX-XXXX (A–Z, 0–9)');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.api.post<Product>('/q06/products', { product_code: code }).subscribe({
      next: (res) => {
        this.products.update((list) => [...list, res.data]);
        this.draft = '';
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'failed');
        this.saving.set(false);
      },
    });
  }

  askDelete(p: Product): void { this.confirming.set(p); }

  doDelete(p: Product): void {
    this.api.delete(`/q06/products/${p.id}`).subscribe({
      next: () => {
        this.products.update((list) => list.filter((x) => x.id !== p.id));
        this.confirming.set(null);
      },
    });
  }
}
