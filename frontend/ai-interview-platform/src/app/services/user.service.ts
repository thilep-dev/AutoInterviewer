import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser = {
    name: 'Alice Brown', // Replace with real user data
    avatarUrl: '',      // Replace with real user data or leave empty for initials
    role: 'Candidate'   // or 'Interviewer'
  };

  getInitials(): string {
    const names = this.currentUser.name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  }
} 