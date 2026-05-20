import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';
import { ApiService } from '../../core/services/api.service';

interface Product {
  id: number;
  product_code: string;
}

const CODE_REGEX = /^[A-Z0-9]{5}(-[A-Z0-9]{5}){5}$/;

@Component({
  selector: 'app-q07-qrcode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header>
      <h1>No.7 — Product Code + QR Code</h1>
      <p class="muted">Format: <code>XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</code> (30 ตัว + 5 ขีด) — ห้ามซ้ำ</p>
    </header>

    <div class="card mt-2" style="max-width:760px;">
      <div class="row">
        <input
          [(ngModel)]="draft"
          placeholder="AB12C-DE34F-GH56I-JK78L-MN90O-PQ12R"
          (input)="draft = draft.toUpperCase()"
          style="flex:1;"
        />
        <button class="primary" (click)="add()" [disabled]="saving()">
          {{ saving() ? 'Saving...' : 'Add' }}
        </button>
      </div>
      <p class="error-text" *ngIf="error()">{{ error() }}</p>
    </div>

    <div class="card mt-2">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Product Code</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="!products().length">
            <td colspan="3" class="muted" style="text-align:center;">ยังไม่มีรายการ</td>
          </tr>
          <tr *ngFor="let p of products(); let i = index">
            <td>{{ i + 1 }}</td>
            <td><code>{{ p.product_code }}</code></td>
            <td class="row">
              <button (click)="showQR(p)">QR</button>
              <button class="danger" (click)="askDelete(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- QR modal -->
    <div class="modal-backdrop" *ngIf="qrShown() as q" (click)="qrShown.set(null)">
      <div class="modal" style="text-align:center;" (click)="$event.stopPropagation()">
        <h2>QR Code</h2>
        <p class="muted"><code>{{ q.product_code }}</code></p>
        <img [src]="qrDataUrl()" alt="QR" *ngIf="qrDataUrl()" style="width:240px;height:240px;"/>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button (click)="qrShown.set(null)">Close</button>
        </div>
      </div>
    </div>

    <!-- Delete modal -->
    <div class="modal-backdrop" *ngIf="confirming() as c" (click)="confirming.set(null)">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>Confirm Delete</h2>
        <p>ลบรหัส <strong>{{ c.product_code }}</strong> ?</p>
        <div class="row mt-2">
          <div class="spacer"></div>
          <button (click)="confirming.set(null)">Cancel</button>
          <button class="danger" (click)="doDelete(c)">Confirm Delete</button>
        </div>
      </div>
    </div>
  `,
})
export class Q07QrcodeComponent implements OnInit {
  private api = inject(ApiService);
  products = signal<Product[]>([]);
  draft = '';
  saving = signal(false);
  error = signal<string | null>(null);
  qrShown = signal<Product | null>(null);
  qrDataUrl = signal<string>('');
  confirming = signal<Product | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<Product[]>('/q07/products').subscribe({
      next: (res) => this.products.set(res.data || []),
    });
  }

  add(): void {
    const code = this.draft.trim().toUpperCase();
    if (!CODE_REGEX.test(code)) {
      this.error.set('format ต้องเป็น XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX (A–Z, 0–9)');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.api.post<Product>('/q07/products', { product_code: code }).subscribe({
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

  showQR(p: Product): void {
    this.qrShown.set(p);
    this.qrDataUrl.set('');
    QRCode.toDataURL(p.product_code, { width: 240, margin: 1 }).then((url) =>
      this.qrDataUrl.set(url),
    );
  }

  askDelete(p: Product): void { this.confirming.set(p); }

  doDelete(p: Product): void {
    this.api.delete(`/q07/products/${p.id}`).subscribe({
      next: () => {
        this.products.update((list) => list.filter((x) => x.id !== p.id));
        this.confirming.set(null);
      },
    });
  }
}
