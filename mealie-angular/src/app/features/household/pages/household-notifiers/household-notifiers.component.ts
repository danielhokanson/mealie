import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HouseholdService } from '../../../../core/services/household.service';

@Component({
    selector: 'app-household-notifiers',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './household-notifiers.component.html',
    styleUrls: ['./household-notifiers.component.css']
})
export class HouseholdNotifiersComponent implements OnInit {
    notifiers: any[] = [];
    loading = false;

    constructor(
        private householdService: HouseholdService,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadNotifiers();
    }

    loadNotifiers(): void {
        this.loading = true;
        this.householdService.getNotifiers().subscribe({
            next: (notifiers) => {
                this.notifiers = notifiers;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading notifiers:', error);
                this.notifiers = [];
                this.loading = false;
            }
        });
    }

    toggleNotifier(notifier: any): void {
        notifier.enabled = !notifier.enabled;
        this.householdService.updateNotifier(notifier.id, { enabled: notifier.enabled }).subscribe({
            next: () => {
                this.snackBar.open(`Notifier ${notifier.enabled ? 'enabled' : 'disabled'}`, 'Close', { duration: 2000 });
            },
            error: (error) => {
                console.error('Error updating notifier:', error);
                notifier.enabled = !notifier.enabled; // Revert on error
                this.snackBar.open('Failed to update notifier', 'Close', { duration: 3000 });
            }
        });
    }

    editNotifier(notifier: any): void {
        this.router.navigate(['/household/notifiers', notifier.id, 'edit']);
    }

    deleteNotifier(notifierId: string): void {
        if (confirm('Are you sure you want to delete this notifier?')) {
            this.householdService.deleteNotifier(notifierId).subscribe({
                next: () => {
                    this.notifiers = this.notifiers.filter(n => n.id !== notifierId);
                    this.snackBar.open('Notifier deleted successfully', 'Close', { duration: 3000 });
                },
                error: (error) => {
                    console.error('Error deleting notifier:', error);
                    this.snackBar.open('Failed to delete notifier', 'Close', { duration: 3000 });
                }
            });
        }
    }

    addNotifier(): void {
        this.router.navigate(['/household/notifiers/create']);
    }
}
