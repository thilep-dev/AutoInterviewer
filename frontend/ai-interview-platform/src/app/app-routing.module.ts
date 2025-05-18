import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.module').then(m => m.routes)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'job-descriptions',
    loadChildren: () => import('./components/job-descriptions/job-descriptions.module').then(m => m.JobDescriptionsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'candidates',
    loadChildren: () => import('./components/candidates/candidates.module').then(m => m.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'interviews',
    loadChildren: () => import('./components/interviews/interviews.module').then(m => m.routes),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
]; 