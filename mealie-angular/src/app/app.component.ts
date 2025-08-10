import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Mealie Angular';
  sidenavOpened = false;
  isAuthenticated = false;
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.getAuthState().subscribe(state => {
      this.isAuthenticated = state.user !== null;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  focusSearch(): void {
    // This will be implemented to focus the search input
    console.log('Focus search');
  }

  onLogin(): void {
    console.log('Login clicked');
    this.router.navigate(['/login']);
  }

  onRegister(): void {
    console.log('Register clicked');
    this.router.navigate(['/register']);
  }

  onLogout(): void {
    console.log('Logout clicked');
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onProfile(): void {
    if (this.isAuthenticated) {
      console.log('Profile clicked');
      // Navigate to profile page when implemented
    }
  }

  onSettings(): void {
    if (this.isAuthenticated) {
      console.log('Settings clicked');
      // Navigate to settings page when implemented
    }
  }
}