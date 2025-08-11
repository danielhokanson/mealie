import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-settings-redirect',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="settings-redirect">
      <p>Redirecting to settings...</p>
    </div>
  `,
    styles: [`
    .settings-redirect {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      font-size: 18px;
      color: #666;
    }
  `]
})
export class SettingsRedirectComponent implements OnInit {

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        console.log('Settings redirect component loaded');

        // Redirect to appropriate settings page based on user role
        // For now, redirect to user settings
        this.router.navigate(['/user/settings']);
    }
}

