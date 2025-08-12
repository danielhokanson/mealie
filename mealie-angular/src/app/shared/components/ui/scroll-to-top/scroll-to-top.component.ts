import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button 
      *ngIf="showButton"
      mat-fab
      class="scroll-to-top-btn"
      [class.fade-in]="showButton"
      (click)="scrollToTop()"
      aria-label="Scroll to top">
      <mat-icon>keyboard_arrow_up</mat-icon>
    </button>
  `,
  styles: [`
    .scroll-to-top-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: var(--z-fixed);
      background-color: var(--primary-600);
      color: white;
      transition: all var(--transition-fast);
      
      &:hover {
        background-color: var(--primary-700);
        transform: translateY(-2px);
      }
      
      mat-icon {
        transform: scale(1.2);
      }
    }
    
    @media (max-width: 768px) {
      .scroll-to-top-btn {
        bottom: 16px;
        right: 16px;
        transform: scale(0.9);
        
        &:hover {
          transform: scale(0.9) translateY(-2px);
        }
      }
    }
  `]
})
export class ScrollToTopComponent {
  showButton = false;
  private scrollThreshold = 300;

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showButton = scrollPosition > this.scrollThreshold;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}