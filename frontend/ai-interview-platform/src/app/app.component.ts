import { Component } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  template: '<app-dashboard></app-dashboard>',
  standalone: true,
  imports: [DashboardComponent],
  styles: []
})
export class AppComponent {
  title = 'AI Interview Platform';
}
