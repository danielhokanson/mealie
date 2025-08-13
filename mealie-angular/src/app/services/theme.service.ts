import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'mealie-theme';
  private currentTheme$ = new BehaviorSubject<Theme>('dark');
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
    }
  }
  
  private initializeTheme(): void {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    
    // Check system preference if no saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark theme as requested
    const theme = savedTheme || (prefersDark ? 'dark' : 'dark');
    
    this.setTheme(theme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  setTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem(this.THEME_KEY, theme);
      this.currentTheme$.next(theme);
    }
  }
  
  toggleTheme(): void {
    const currentTheme = this.currentTheme$.value;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  getTheme(): Observable<Theme> {
    return this.currentTheme$.asObservable();
  }
  
  getCurrentTheme(): Theme {
    return this.currentTheme$.value;
  }
  
  isDarkTheme(): boolean {
    return this.currentTheme$.value === 'dark';
  }
}