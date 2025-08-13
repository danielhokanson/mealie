import { Directive, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description?: string;
}

@Directive({
  selector: '[appKeyboardShortcuts]',
  standalone: true
})
export class KeyboardShortcutsDirective implements OnInit, OnDestroy {
  private shortcuts: Map<string, ShortcutConfig> = new Map();
  private globalShortcuts: ShortcutConfig[] = [];

  constructor(private router: Router) {
    this.setupGlobalShortcuts();
  }

  ngOnInit() {
    // Register global shortcuts
    this.globalShortcuts.forEach(shortcut => {
      const key = this.getShortcutKey(shortcut);
      this.shortcuts.set(key, shortcut);
    });
  }

  ngOnDestroy() {
    this.shortcuts.clear();
  }

  private setupGlobalShortcuts() {
    this.globalShortcuts = [
      // Navigation shortcuts
      {
        key: 'h',
        alt: true,
        action: () => this.router.navigate(['/']),
        description: 'Go to Home'
      },
      {
        key: 'r',
        alt: true,
        action: () => this.router.navigate(['/recipes']),
        description: 'Go to Recipes'
      },
      {
        key: 'm',
        alt: true,
        action: () => this.router.navigate(['/meal-plans']),
        description: 'Go to Meal Plans'
      },
      {
        key: 's',
        alt: true,
        action: () => this.router.navigate(['/shopping-lists']),
        description: 'Go to Shopping Lists'
      },
      // Search shortcut
      {
        key: '/',
        action: () => this.focusSearch(),
        description: 'Focus search'
      },
      // Create shortcuts
      {
        key: 'n',
        ctrl: true,
        action: () => this.createNew(),
        description: 'Create new item'
      },
      // Theme toggle
      {
        key: 't',
        ctrl: true,
        shift: true,
        action: () => this.toggleTheme(),
        description: 'Toggle theme'
      },
      // Help
      {
        key: '?',
        shift: true,
        action: () => this.showHelp(),
        description: 'Show keyboard shortcuts'
      }
    ];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true') {
      // Exception for search shortcut
      if (event.key !== '/') {
        return;
      }
    }

    const key = this.getEventKey(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  private getShortcutKey(shortcut: ShortcutConfig): string {
    const parts = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.alt) parts.push('alt');
    if (shortcut.shift) parts.push('shift');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  private getEventKey(event: KeyboardEvent): string {
    const parts = [];
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  private focusSearch() {
    const searchInput = document.querySelector('.search-input, input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  private createNew() {
    // Determine what to create based on current route
    const currentUrl = this.router.url;
    if (currentUrl.includes('recipes')) {
      this.router.navigate(['/recipes/create']);
    } else if (currentUrl.includes('shopping-lists')) {
      this.router.navigate(['/shopping-lists/create']);
    } else if (currentUrl.includes('meal-plans')) {
      this.router.navigate(['/meal-plans/create']);
    }
  }

  private toggleTheme() {
    // Dispatch custom event that theme service can listen to
    window.dispatchEvent(new CustomEvent('toggle-theme'));
  }

  private showHelp() {
    // Dispatch event to show help dialog
    window.dispatchEvent(new CustomEvent('show-keyboard-shortcuts', {
      detail: this.globalShortcuts
    }));
  }

  // Method to register custom shortcuts
  registerShortcut(shortcut: ShortcutConfig) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  // Method to unregister shortcuts
  unregisterShortcut(shortcut: ShortcutConfig) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }
}