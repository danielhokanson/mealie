import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

@Component({
    selector: 'app-meal-plans-list',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatTooltipModule
    ],
    template: `
    <div class="meal-plans-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Meal Plans</mat-card-title>
          <mat-card-subtitle>Plan your meals for the week</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="meal-plans-content">
            <p>Meal planning feature is coming soon!</p>
            <p>This will allow you to:</p>
            <ul>
              <li>Create weekly meal plans</li>
              <li>Drag and drop recipes into your schedule</li>
              <li>Generate shopping lists from your meal plans</li>
              <li>Share meal plans with your household</li>
            </ul>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="createMealPlan()">
            <mat-icon>add</mat-icon>
            Create Meal Plan
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
    styles: [`
    .meal-plans-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .meal-plans-content {
      margin: 20px 0;
    }
    
    .meal-plans-content ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .meal-plans-content li {
      margin: 5px 0;
    }
    
    mat-card-actions {
      padding: 16px;
    }
  `]
})
export class MealPlansListComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void {
        console.log('Meal Plans List Component loaded');
    }

    createMealPlan(): void {
        console.log('Create meal plan clicked');
        // TODO: Navigate to meal plan creation when implemented
    }
}

