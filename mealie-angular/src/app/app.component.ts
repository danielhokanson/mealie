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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './core/services/auth.service';
import { ThemeService, Theme } from './services/theme.service';
import { ToastService } from './services/toast.service';
import { Subscription, filter } from 'rxjs';

// Import new UI components
import { BreadcrumbComponent } from './shared/components/ui/breadcrumb/breadcrumb.component';
import { OfflineIndicatorComponent } from './shared/components/ui/offline-indicator/offline-indicator.component';
import { ScrollToTopComponent } from './shared/components/ui/scroll-to-top/scroll-to-top.component';
import { KeyboardShortcutsDirective } from './directives/keyboard-shortcuts.directive';

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
    MatSlideToggleModule,
    MatSnackBarModule,
    // New UI components
    BreadcrumbComponent,
    OfflineIndicatorComponent,
    ScrollToTopComponent,
    KeyboardShortcutsDirective
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
    private themeService: ThemeService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Initialize theme
    this.themeSubscription = this.themeService.getTheme().subscribe(theme => {
      this.currentTheme = theme;
      this.isDarkTheme = theme === 'dark';
    });

    // Listen for theme toggle keyboard shortcut
    window.addEventListener('toggle-theme', () => {
      this.toggleTheme();
    });

    // Listen for keyboard shortcuts help
    window.addEventListener('show-keyboard-shortcuts', (event: any) => {
      this.showKeyboardShortcuts(event.detail);
    });

    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = user !== null;
      if (user) {
        this.toastService.success(`Welcome back, ${user.username}!`);
      }
    });

    // Subscribe to router navigation events
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Close sidenav on mobile after navigation
      if (window.innerWidth < 768) {
        this.sidenavOpened = false;
      }
    });

    // Show welcome toast on first load
    if (!sessionStorage.getItem('welcomed')) {
      setTimeout(() => {
        this.toastService.info('Press Shift+? to see keyboard shortcuts');
        sessionStorage.setItem('welcomed', 'true');
      }, 2000);
    }
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
    window.removeEventListener('toggle-theme', () => {});
    window.removeEventListener('show-keyboard-shortcuts', () => {});
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    const newTheme = this.themeService.getCurrentTheme();
    this.toastService.info(`Switched to ${newTheme} theme`);
  }

  focusSearch(): void {
    // Focus the search input when implemented
    const searchInput = document.querySelector('.search-input, input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  onLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  onLogout(): void {
    const loadingToast = this.toastService.loading('Logging out...');
    this.authService.logout().subscribe({
      next: () => {
        loadingToast.dismiss();
        this.toastService.success('Logged out successfully');
        this.router.navigate(['/']);
      },
      error: () => {
        loadingToast.dismiss();
        this.toastService.error('Error logging out');
      }
    });
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

  private showKeyboardShortcuts(shortcuts: any[]): void {
    // Create a formatted message with shortcuts
    let message = 'Keyboard Shortcuts:\n';
    shortcuts.forEach(shortcut => {
      const keys = [];
      if (shortcut.ctrl) keys.push('Ctrl');
      if (shortcut.alt) keys.push('Alt');
      if (shortcut.shift) keys.push('Shift');
      keys.push(shortcut.key.toUpperCase());
      message += `${keys.join('+')} - ${shortcut.description}\n`;
    });
    
    // For now, show in console - in production, this would open a dialog
    console.log(message);
    this.toastService.info('Keyboard shortcuts logged to console');
  }
}