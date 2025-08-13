import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter, distinctUntilChanged } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <nav aria-label="Breadcrumb" class="breadcrumb-nav fade-in">
      <ol class="flex items-center gap-sm text-sm">
        <li>
          <a routerLink="/" class="flex items-center gap-xs text-secondary hover:text-primary transition-colors">
            <mat-icon class="text-lg">home</mat-icon>
            <span class="sr-only">Home</span>
          </a>
        </li>
        
        <li *ngFor="let breadcrumb of breadcrumbs; let last = last" class="flex items-center gap-sm">
          <mat-icon class="text-tertiary text-lg">chevron_right</mat-icon>
          
          <a *ngIf="!last" 
             [routerLink]="breadcrumb.url"
             class="flex items-center gap-xs text-secondary hover:text-primary transition-colors">
            <mat-icon *ngIf="breadcrumb.icon" class="text-lg">{{ breadcrumb.icon }}</mat-icon>
            {{ breadcrumb.label }}
          </a>
          
          <span *ngIf="last" 
                class="flex items-center gap-xs text-primary font-medium">
            <mat-icon *ngIf="breadcrumb.icon" class="text-lg">{{ breadcrumb.icon }}</mat-icon>
            {{ breadcrumb.label }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-primary);
      margin-bottom: var(--spacing-md);
    }
    
    @media (max-width: 640px) {
      .breadcrumb-nav {
        display: none;
      }
    }
  `]
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];
  
  private routeIcons: { [key: string]: string } = {
    'recipes': 'restaurant',
    'meal-plans': 'calendar_today',
    'shopping-lists': 'shopping_cart',
    'settings': 'settings',
    'admin': 'admin_panel_settings',
    'user': 'person',
    'profile': 'account_circle',
    'create': 'add',
    'edit': 'edit',
    'favorites': 'favorite'
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumb(this.activatedRoute.root);
      });
  }

  private buildBreadcrumb(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    let label = route.routeConfig?.data?.['breadcrumb'] || '';
    let path = route.routeConfig?.path || '';
    
    const nextUrl = path ? `${url}/${path}` : url;
    
    if (label) {
      // Try to get an icon for this route segment
      const icon = this.getIconForPath(path);
      breadcrumbs.push({ label, url: nextUrl, icon });
    }
    
    if (route.firstChild) {
      return this.buildBreadcrumb(route.firstChild, nextUrl, breadcrumbs);
    }
    
    return breadcrumbs;
  }
  
  private getIconForPath(path: string): string | undefined {
    // Check if the path matches any of our known icons
    for (const [key, icon] of Object.entries(this.routeIcons)) {
      if (path.includes(key)) {
        return icon;
      }
    }
    return undefined;
  }
}