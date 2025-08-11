import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HouseholdService } from '../../../../core/services/household.service';

@Component({
    selector: 'app-household-webhooks',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './household-webhooks.component.html',
    styleUrl: './household-webhooks.component.css'
})
export class HouseholdWebhooksComponent implements OnInit {
    webhooks: any[] = [];
    loading = false;

    constructor(
        private householdService: HouseholdService,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadWebhooks();
    }

    loadWebhooks(): void {
        this.loading = true;
        this.householdService.getWebhooks().subscribe({
            next: (webhooks) => {
                this.webhooks = webhooks;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading webhooks:', error);
                this.webhooks = [];
                this.loading = false;
            }
        });
    }

    toggleWebhook(webhook: any): void {
        webhook.enabled = !webhook.enabled;
        this.householdService.updateWebhook(webhook.id, { enabled: webhook.enabled }).subscribe({
            next: () => {
                this.snackBar.open(`Webhook ${webhook.enabled ? 'enabled' : 'disabled'}`, 'Close', { duration: 2000 });
            },
            error: (error) => {
                console.error('Error updating webhook:', error);
                webhook.enabled = !webhook.enabled; // Revert on error
                this.snackBar.open('Failed to update webhook', 'Close', { duration: 3000 });
            }
        });
    }

    editWebhook(webhook: any): void {
        // For now, navigate to edit page
        this.router.navigate(['/household/webhooks', webhook.id, 'edit']);
    }

    deleteWebhook(webhookId: string): void {
        if (confirm('Are you sure you want to delete this webhook?')) {
            this.householdService.deleteWebhook(webhookId).subscribe({
                next: () => {
                    this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
                    this.snackBar.open('Webhook deleted successfully', 'Close', { duration: 3000 });
                },
                error: (error) => {
                    console.error('Error deleting webhook:', error);
                    this.snackBar.open('Failed to delete webhook', 'Close', { duration: 3000 });
                }
            });
        }
    }

    addWebhook(): void {
        this.router.navigate(['/household/webhooks/create']);
    }

    testWebhook(webhook: any): void {
        this.householdService.testWebhook(webhook.id).subscribe({
            next: (result) => {
                this.snackBar.open(`Webhook test ${result.success ? 'successful' : 'failed'}`, 'Close', { duration: 3000 });
            },
            error: (error) => {
                console.error('Error testing webhook:', error);
                this.snackBar.open('Failed to test webhook', 'Close', { duration: 3000 });
            }
        });
    }
}
