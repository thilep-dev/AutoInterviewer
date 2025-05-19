import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { MeetingComponent } from './features/meeting/meeting.component';

const routes: Routes = [
  {
    path: 'meeting/:roomId',
    component: MeetingComponent
  },
  {
    path: 'interview/:id',
    loadChildren: () => import('./features/interview/interview.module').then(m => m.InterviewModule)
  },
  {
    path: '',
    redirectTo: 'interview/new',
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 