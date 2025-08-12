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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from './core/services/auth.service';
import { ThemeService, Theme } from './services/theme.service';
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
    MatTooltipModule,
    MatSlideToggleModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Mealie Angular';
  sidenavOpened = false;
  isAuthenticated = false;
  currentTheme: Theme = 'dark';
  isDarkTheme = true;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private themeSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Initialize theme
    this.themeSubscription = this.themeService.getTheme().subscribe(theme => {
      this.currentTheme = theme;
      this.isDarkTheme = theme === 'dark';
    });

    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = user !== null;
    });

    // Subscribe to router navigation events
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Navigation tracking can be added here if needed
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  focusSearch(): void {
    // Focus the search input when implemented
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  onLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onProfile(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/user/profile']);
    }
  }

  onSettings(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/user/settings']);
    }
  }
}