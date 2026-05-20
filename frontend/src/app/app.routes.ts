import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'q01-person',
        loadComponent: () =>
          import('./pages/q01-person/q01-person.component').then((m) => m.Q01PersonComponent),
      },
      {
        path: 'q02-auth',
        loadComponent: () =>
          import('./pages/q02-auth/q02-auth.component').then((m) => m.Q02AuthComponent),
      },
      {
        path: 'q03-approval',
        loadComponent: () =>
          import('./pages/q03-approval/q03-approval.component').then((m) => m.Q03ApprovalComponent),
      },
      {
        path: 'q04-profile',
        loadComponent: () =>
          import('./pages/q04-profile/q04-profile.component').then((m) => m.Q04ProfileComponent),
      },
      {
        path: 'q05-queue',
        loadComponent: () =>
          import('./pages/q05-queue/q05-queue.component').then((m) => m.Q05QueueComponent),
      },
      {
        path: 'q06-barcode',
        loadComponent: () =>
          import('./pages/q06-barcode/q06-barcode.component').then((m) => m.Q06BarcodeComponent),
      },
      {
        path: 'q07-qrcode',
        loadComponent: () =>
          import('./pages/q07-qrcode/q07-qrcode.component').then((m) => m.Q07QrcodeComponent),
      },
      {
        path: 'q08-exam-management',
        loadComponent: () =>
          import('./pages/q08-exam-management/q08-exam-management.component').then(
            (m) => m.Q08ExamManagementComponent,
          ),
      },
      {
        path: 'q09-comment',
        loadComponent: () =>
          import('./pages/q09-comment/q09-comment.component').then((m) => m.Q09CommentComponent),
      },
      {
        path: 'q10-exam',
        loadComponent: () =>
          import('./pages/q10-exam/q10-exam.component').then((m) => m.Q10ExamComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
