import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-loader" [ngClass]="skeletonClass" [style.width]="width" [style.height]="height">
      <div class="skeleton-shimmer"></div>
    </div>
  `,
  styles: [`
    .skeleton-loader {
      background: var(--bg-tertiary);
      border-radius: var(--radius-md);
      position: relative;
      overflow: hidden;
    }
    
    .skeleton-shimmer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    /* Preset classes */
    .skeleton-text {
      height: 1rem;
      margin-bottom: 0.5rem;
      border-radius: var(--radius-sm);
    }
    
    .skeleton-title {
      height: 1.5rem;
      width: 60%;
      margin-bottom: 1rem;
    }
    
    .skeleton-card {
      height: 200px;
      border-radius: var(--radius-lg);
    }
    
    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
    }
    
    .skeleton-button {
      width: 100px;
      height: 36px;
      border-radius: var(--radius-md);
    }
    
    /* Dark theme adjustments */
    [data-theme="dark"] .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.05),
        transparent
      );
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'title' | 'card' | 'avatar' | 'button' | 'custom' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = 'auto';
  @Input() count: number = 1;
  
  get skeletonClass(): string {
    return this.type !== 'custom' ? `skeleton-${this.type}` : '';
  }
}