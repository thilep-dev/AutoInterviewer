import { Routes } from '@angular/router';
import { InterviewListComponent } from './interview-list/interview-list.component';
import { InterviewFormComponent } from './interview-form/interview-form.component';

export const routes: Routes = [
  { path: '', component: InterviewListComponent },
  { path: 'new', component: InterviewFormComponent },
  { path: 'edit/:id', component: InterviewFormComponent },
  { path: 'schedule/:candidateId', component: InterviewFormComponent }
]; 