import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface ToastOptions {
  duration?: number;
  action?: string;
  panelClass?: string[];
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private defaultOptions: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    panelClass: ['custom-snackbar']
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, options?: ToastOptions) {
    this.show(message, {
      ...options,
      panelClass: ['toast-success']
    });
  }

  error(message: string, options?: ToastOptions) {
    this.show(message, {
      ...options,
      duration: 5000, // Errors stay longer
      panelClass: ['toast-error']
    });
  }

  warning(message: string, options?: ToastOptions) {
    this.show(message, {
      ...options,
      panelClass: ['toast-warning']
    });
  }

  info(message: string, options?: ToastOptions) {
    this.show(message, {
      ...options,
      panelClass: ['toast-info']
    });
  }

  private show(message: string, options?: ToastOptions) {
    const config: MatSnackBarConfig = {
      ...this.defaultOptions,
      ...options,
      panelClass: [
        ...(this.defaultOptions.panelClass || []),
        ...(options?.panelClass || [])
      ]
    };

    return this.snackBar.open(
      message,
      options?.action || 'Dismiss',
      config
    );
  }

  // Show a loading toast that doesn't auto-dismiss
  loading(message: string = 'Loading...') {
    return this.snackBar.open(message, '', {
      ...this.defaultOptions,
      duration: undefined,
      panelClass: ['toast-loading']
    });
  }
}