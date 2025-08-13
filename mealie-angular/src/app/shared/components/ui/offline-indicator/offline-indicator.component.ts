import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div *ngIf="!isOnline" 
         class="offline-indicator slide-in-down"
         [class.pulse]="!isOnline">
      <mat-icon>wifi_off</mat-icon>
      <span>You are currently offline</span>
      <small>Some features may be limited</small>
    </div>
    
    <div *ngIf="isOnline && showOnlineMessage" 
         class="online-indicator slide-in-down fade-out">
      <mat-icon>wifi</mat-icon>
      <span>Back online</span>
    </div>
  `,
  styles: [`
    .offline-indicator, .online-indicator {
      position: fixed;
      top: 64px;
      left: 50%;
      transform: translateX(-50%);
      z-index: var(--z-tooltip);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      box-shadow: var(--shadow-lg);
    }
    
    .offline-indicator {
      background-color: var(--color-warning);
      color: white;
      
      small {
        opacity: 0.9;
        margin-left: var(--spacing-sm);
      }
    }
    
    .online-indicator {
      background-color: var(--color-success);
      color: white;
      animation-delay: 2s;
      animation-fill-mode: forwards;
    }
    
    mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    @media (max-width: 640px) {
      .offline-indicator, .online-indicator {
        top: auto;
        bottom: 80px;
        
        small {
          display: none;
        }
      }
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOnline = true;
  showOnlineMessage = false;
  private subscription?: Subscription;
  private onlineMessageTimeout?: any;

  ngOnInit() {
    // Check initial status
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    
    this.subscription = merge(online$, offline$, of(navigator.onLine))
      .subscribe(isOnline => {
        const wasOffline = !this.isOnline;
        this.isOnline = isOnline;
        
        // Show "back online" message briefly
        if (isOnline && wasOffline) {
          this.showOnlineMessage = true;
          
          // Hide the message after 3 seconds
          this.onlineMessageTimeout = setTimeout(() => {
            this.showOnlineMessage = false;
          }, 3000);
        }
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    if (this.onlineMessageTimeout) {
      clearTimeout(this.onlineMessageTimeout);
    }
  }
}