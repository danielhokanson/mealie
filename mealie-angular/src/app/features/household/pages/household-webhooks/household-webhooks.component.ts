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

    constructor() { }

    ngOnInit(): void {
        this.loadWebhooks();
    }

    loadWebhooks(): void {
        this.loading = true;
        // TODO: Implement webhooks loading logic
        setTimeout(() => {
            this.loading = false;
            this.webhooks = [
                {
                    id: '1',
                    name: 'Slack Integration',
                    url: 'https://hooks.slack.com/services/...',
                    type: 'slack',
                    enabled: true,
                    events: ['recipe_created', 'meal_plan_updated']
                },
                {
                    id: '2',
                    name: 'Discord Webhook',
                    url: 'https://discord.com/api/webhooks/...',
                    type: 'discord',
                    enabled: false,
                    events: ['shopping_list_updated']
                }
            ];
        }, 1000);
    }

    toggleWebhook(webhook: any): void {
        webhook.enabled = !webhook.enabled;
        // TODO: Implement toggle logic
    }

    editWebhook(webhook: any): void {
        // TODO: Implement edit logic
    }

    deleteWebhook(webhookId: string): void {
        // TODO: Implement delete logic
        this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
    }

    addWebhook(): void {
        // TODO: Implement add logic
    }

    testWebhook(webhook: any): void {
        // TODO: Implement test logic
    }
}
