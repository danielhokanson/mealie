import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
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
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = user !== null;
    });

    // Subscribe to router navigation events for logging
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log(`Navigation completed: ${event.url}`);
    });

    // Log current route on component init
    console.log('App component initialized');
    console.log('Current route:', this.router.url);
    console.log('Router config:', this.router.config);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
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
    this.router.navigate(['/auth/login']);
  }

  onRegister(): void {
    console.log('Register clicked');
    this.router.navigate(['/auth/register']);
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

  // Test method to debug router navigation
  testNavigation(route: string): void {
    console.log(`Testing navigation to: ${route}`);
    this.router.navigate([route]).then(success => {
      console.log(`Navigation to ${route} successful:`, success);
    }).catch(error => {
      console.error(`Navigation to ${route} failed:`, error);
    });
  }
}