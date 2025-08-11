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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './household-notifiers.component.html',
    styleUrl: './household-notifiers.component.css'
})
export class HouseholdNotifiersComponent implements OnInit {
    notifiers: any[] = [];
    loading = false;

    constructor() { }

    ngOnInit(): void {
        this.loadNotifiers();
    }

    loadNotifiers(): void {
        this.loading = true;
        // TODO: Implement notifiers loading logic
        setTimeout(() => {
            this.loading = false;
            this.notifiers = [
                {
                    id: '1',
                    name: 'Meal Plan Reminders',
                    type: 'email',
                    enabled: true,
                    schedule: 'daily'
                },
                {
                    id: '2',
                    name: 'Shopping List Updates',
                    type: 'push',
                    enabled: false,
                    schedule: 'weekly'
                }
            ];
        }, 1000);
    }

    toggleNotifier(notifier: any): void {
        notifier.enabled = !notifier.enabled;
        // TODO: Implement toggle logic
    }

    editNotifier(notifier: any): void {
        // TODO: Implement edit logic
    }

    deleteNotifier(notifierId: string): void {
        // TODO: Implement delete logic
        this.notifiers = this.notifiers.filter(n => n.id !== notifierId);
    }

    addNotifier(): void {
        // TODO: Implement add logic
    }
}
