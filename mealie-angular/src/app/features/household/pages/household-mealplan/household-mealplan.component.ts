import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { MealPlanService } from '../../../../core/services/meal-plan.service';

@Component({
    selector: 'app-household-mealplan',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './household-mealplan.component.html',
    styleUrls: ['./household-mealplan.component.scss']
})
export class HouseholdMealplanComponent implements OnInit {
    mealPlan: any[] = [];
    loading = false;
    selectedDate = new Date();

    constructor(
        private mealPlanService: MealPlanService,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadMealPlan();
    }

    loadMealPlan(): void {
        this.loading = true;
        this.mealPlanService.getWeeklyMealPlans(0).subscribe({
            next: (mealPlans) => {
                this.mealPlan = mealPlans;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading meal plan:', error);
                this.mealPlan = [];
                this.loading = false;
            }
        });
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadMealPlan();
    }

    addMeal(): void {
        this.router.navigate(['/meal-plans']);
    }

    removeMeal(mealId: string): void {
        if (confirm('Are you sure you want to remove this meal from the plan?')) {
            this.mealPlanService.deleteMealPlan(mealId).subscribe({
                next: () => {
                    this.mealPlan = this.mealPlan.filter(m => m.id !== mealId);
                    this.snackBar.open('Meal removed from plan', 'Close', { duration: 2000 });
                },
                error: (error) => {
                    console.error('Error removing meal:', error);
                    this.snackBar.open('Failed to remove meal', 'Close', { duration: 3000 });
                }
            });
        }
    }
}
