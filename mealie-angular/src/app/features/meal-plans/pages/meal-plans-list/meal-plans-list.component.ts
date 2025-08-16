import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MealPlanService, MealPlan } from '../../../../core/services/meal-plan.service';
import { RecipeService } from '../../../../core/services/recipe.service';

interface DayPlan {
    date: Date;
    dayName: string;
    breakfast: MealPlan[];
    lunch: MealPlan[];
    dinner: MealPlan[];
    snack: MealPlan[];
}

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
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatDialogModule,
        MatSnackBarModule,
        MatMenuModule,
        DragDropModule
    ],
    template: `
    <div class="meal-plans-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-row">
              <span>Meal Plans</span>
              <div class="header-actions">
                <button mat-icon-button (click)="previousWeek()" matTooltip="Previous Week">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <button mat-button (click)="goToToday()">Today</button>
                <button mat-icon-button (click)="nextWeek()" matTooltip="Next Week">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-title>
          <mat-card-subtitle>{{ getWeekRange() }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="loading-container" *ngIf="loading">
            <mat-spinner></mat-spinner>
          </div>

          <div class="week-view" *ngIf="!loading">
            <div class="day-column" *ngFor="let day of weekDays">
              <div class="day-header" [class.today]="isToday(day.date)">
                <h3>{{ day.dayName }}</h3>
                <span class="date">{{ day.date | date:'MMM d' }}</span>
              </div>

              <div class="meal-sections">
                <!-- Breakfast -->
                <div class="meal-section">
                  <div class="meal-type-header">
                    <mat-icon>free_breakfast</mat-icon>
                    <span>Breakfast</span>
                  </div>
                  <div class="meal-items"
                       cdkDropList
                       [cdkDropListData]="day.breakfast"
                       [cdkDropListConnectedTo]="getConnectedLists('breakfast')"
                       (cdkDropListDropped)="drop($event, day, 'breakfast')">
                    <div class="meal-item" 
                         *ngFor="let meal of day.breakfast"
                         cdkDrag>
                      <mat-card class="meal-card">
                        <div class="meal-content">
                          <span class="meal-title">{{ meal.title || meal.recipe?.name || 'Untitled' }}</span>
                          <button mat-icon-button [matMenuTriggerFor]="mealMenu" class="meal-menu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          <mat-menu #mealMenu="matMenu">
                            <button mat-menu-item (click)="editMeal(meal)">
                              <mat-icon>edit</mat-icon>
                              <span>Edit</span>
                            </button>
                            <button mat-menu-item (click)="deleteMeal(meal)">
                              <mat-icon>delete</mat-icon>
                              <span>Delete</span>
                            </button>
                          </mat-menu>
                        </div>
                      </mat-card>
                    </div>
                    <button mat-stroked-button class="add-meal-btn" (click)="addMeal(day.date, 'breakfast')">
                      <mat-icon>add</mat-icon>
                      Add Breakfast
                    </button>
                  </div>
                </div>

                <!-- Lunch -->
                <div class="meal-section">
                  <div class="meal-type-header">
                    <mat-icon>lunch_dining</mat-icon>
                    <span>Lunch</span>
                  </div>
                  <div class="meal-items"
                       cdkDropList
                       [cdkDropListData]="day.lunch"
                       [cdkDropListConnectedTo]="getConnectedLists('lunch')"
                       (cdkDropListDropped)="drop($event, day, 'lunch')">
                    <div class="meal-item" 
                         *ngFor="let meal of day.lunch"
                         cdkDrag>
                      <mat-card class="meal-card">
                        <div class="meal-content">
                          <span class="meal-title">{{ meal.title || meal.recipe?.name || 'Untitled' }}</span>
                          <button mat-icon-button [matMenuTriggerFor]="mealMenu" class="meal-menu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          <mat-menu #mealMenu="matMenu">
                            <button mat-menu-item (click)="editMeal(meal)">
                              <mat-icon>edit</mat-icon>
                              <span>Edit</span>
                            </button>
                            <button mat-menu-item (click)="deleteMeal(meal)">
                              <mat-icon>delete</mat-icon>
                              <span>Delete</span>
                            </button>
                          </mat-menu>
                        </div>
                      </mat-card>
                    </div>
                    <button mat-stroked-button class="add-meal-btn" (click)="addMeal(day.date, 'lunch')">
                      <mat-icon>add</mat-icon>
                      Add Lunch
                    </button>
                  </div>
                </div>

                <!-- Dinner -->
                <div class="meal-section">
                  <div class="meal-type-header">
                    <mat-icon>dinner_dining</mat-icon>
                    <span>Dinner</span>
                  </div>
                  <div class="meal-items"
                       cdkDropList
                       [cdkDropListData]="day.dinner"
                       [cdkDropListConnectedTo]="getConnectedLists('dinner')"
                       (cdkDropListDropped)="drop($event, day, 'dinner')">
                    <div class="meal-item" 
                         *ngFor="let meal of day.dinner"
                         cdkDrag>
                      <mat-card class="meal-card">
                        <div class="meal-content">
                          <span class="meal-title">{{ meal.title || meal.recipe?.name || 'Untitled' }}</span>
                          <button mat-icon-button [matMenuTriggerFor]="mealMenu" class="meal-menu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          <mat-menu #mealMenu="matMenu">
                            <button mat-menu-item (click)="editMeal(meal)">
                              <mat-icon>edit</mat-icon>
                              <span>Edit</span>
                            </button>
                            <button mat-menu-item (click)="deleteMeal(meal)">
                              <mat-icon>delete</mat-icon>
                              <span>Delete</span>
                            </button>
                          </mat-menu>
                        </div>
                      </mat-card>
                    </div>
                    <button mat-stroked-button class="add-meal-btn" (click)="addMeal(day.date, 'dinner')">
                      <mat-icon>add</mat-icon>
                      Add Dinner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="generateShoppingList()">
            <mat-icon>shopping_cart</mat-icon>
            Generate Shopping List
          </button>
          <button mat-button (click)="exportMealPlans()">
            <mat-icon>download</mat-icon>
            Export
          </button>
          <button mat-button (click)="applyRules()">
            <mat-icon>auto_awesome</mat-icon>
            Apply Rules
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
    styles: [`
    .meal-plans-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .week-view {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 16px;
      margin-top: 20px;
    }

    .day-column {
      min-width: 180px;
    }

    .day-header {
      text-align: center;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px 8px 0 0;
      margin-bottom: 8px;
    }

    .day-header.today {
      background: #3f51b5;
      color: white;
    }

    .day-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .date {
      font-size: 12px;
      opacity: 0.8;
    }

    .meal-sections {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .meal-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px;
    }

    .meal-type-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      margin-bottom: 8px;
    }

    .meal-type-header mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .meal-items {
      min-height: 60px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .meal-card {
      padding: 8px;
      cursor: move;
    }

    .meal-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .meal-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meal-title {
      font-size: 13px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meal-menu {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .meal-menu mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .add-meal-btn {
      width: 100%;
      font-size: 12px;
      height: 32px;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0.5;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .meal-items.cdk-drop-list-dragging .meal-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      gap: 8px;
    }

    @media (max-width: 1200px) {
      .week-view {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 768px) {
      .week-view {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .week-view {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MealPlansListComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    loading = false;
    weekOffset = 0;
    weekDays: DayPlan[] = [];
    currentWeekStart!: Date;
    currentWeekEnd!: Date;

    constructor(
        private router: Router,
        private mealPlanService: MealPlanService,
        private recipeService: RecipeService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadWeeklyMealPlans();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadWeeklyMealPlans(): void {
        this.loading = true;
        this.initializeWeek();

        this.mealPlanService.getWeeklyMealPlans(this.weekOffset)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (mealPlans) => {
                    this.populateWeekWithMealPlans(mealPlans);
                    this.loading = false;
                },
                error: (error) => {
                    this.snackBar.open('Failed to load meal plans', 'Close', { duration: 3000 });
                    this.loading = false;
                }
            });
    }

    initializeWeek(): void {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (this.weekOffset * 7));
        this.currentWeekStart = startOfWeek;
        
        this.weekDays = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            this.weekDays.push({
                date: date,
                dayName: dayNames[i],
                breakfast: [],
                lunch: [],
                dinner: [],
                snack: []
            });
        }
        
        this.currentWeekEnd = new Date(startOfWeek);
        this.currentWeekEnd.setDate(startOfWeek.getDate() + 6);
    }

    populateWeekWithMealPlans(mealPlans: MealPlan[]): void {
        mealPlans.forEach(plan => {
            const planDate = new Date(plan.date);
            const dayIndex = this.weekDays.findIndex(day => 
                day.date.toDateString() === planDate.toDateString()
            );
            
            if (dayIndex !== -1) {
                const entryType = plan.entryType as 'breakfast' | 'lunch' | 'dinner' | 'snack';
                if (this.weekDays[dayIndex][entryType]) {
                    this.weekDays[dayIndex][entryType].push(plan);
                }
            }
        });
    }

    getWeekRange(): string {
        if (!this.currentWeekStart || !this.currentWeekEnd) return '';
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${this.currentWeekStart.toLocaleDateString('en-US', options)} - ${this.currentWeekEnd.toLocaleDateString('en-US', options)}`;
    }

    isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    previousWeek(): void {
        this.weekOffset--;
        this.loadWeeklyMealPlans();
    }

    nextWeek(): void {
        this.weekOffset++;
        this.loadWeeklyMealPlans();
    }

    goToToday(): void {
        this.weekOffset = 0;
        this.loadWeeklyMealPlans();
    }

    drop(event: CdkDragDrop<MealPlan[]>, day: DayPlan, mealType: string): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            const meal = event.previousContainer.data[event.previousIndex];
            
            // Update the meal plan with new date and type
            const updatedMeal = { ...meal, date: day.date, entryType: mealType };
            
            this.mealPlanService.updateMealPlan(meal.id, {
                date: day.date,
                entryType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'side'
            }).subscribe({
                next: () => {
                    transferArrayItem(
                        event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex
                    );
                    this.snackBar.open('Meal plan updated', 'Close', { duration: 2000 });
                },
                error: () => {
                    this.snackBar.open('Failed to update meal plan', 'Close', { duration: 3000 });
                }
            });
        }
    }

    getConnectedLists(mealType: string): string[] {
        // Return IDs of all drop lists for the same meal type
        return [];
    }

    addMeal(date: Date, mealType: string): void {
        // Open dialog to add a new meal
        // For now, create a simple meal
        const newMeal = {
            date: date,
            entryType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'side',
            title: 'New Meal',
            text: ''
        };

        this.mealPlanService.createMealPlan(newMeal).subscribe({
            next: (meal) => {
                const dayIndex = this.weekDays.findIndex(day => 
                    day.date.toDateString() === date.toDateString()
                );
                
                if (dayIndex !== -1) {
                    const entryType = mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack';
                    this.weekDays[dayIndex][entryType].push(meal);
                }
                
                this.snackBar.open('Meal added', 'Close', { duration: 2000 });
            },
            error: () => {
                this.snackBar.open('Failed to add meal', 'Close', { duration: 3000 });
            }
        });
    }

    editMeal(meal: MealPlan): void {
        // Open dialog to edit meal
        // For now, just navigate to recipe if it exists
        if (meal.recipeId) {
            this.router.navigate(['/recipes', meal.recipeId]);
        }
    }

    deleteMeal(meal: MealPlan): void {
        if (confirm('Are you sure you want to delete this meal?')) {
            this.mealPlanService.deleteMealPlan(meal.id).subscribe({
                next: () => {
                    // Remove from UI
                    this.weekDays.forEach(day => {
                        ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
                            const type = mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack';
                            const index = day[type].findIndex(m => m.id === meal.id);
                            if (index !== -1) {
                                day[type].splice(index, 1);
                            }
                        });
                    });
                    
                    this.snackBar.open('Meal deleted', 'Close', { duration: 2000 });
                },
                error: () => {
                    this.snackBar.open('Failed to delete meal', 'Close', { duration: 3000 });
                }
            });
        }
    }

    generateShoppingList(): void {
        // Collect all recipes from the week and generate shopping list
        const recipeIds: string[] = [];
        this.weekDays.forEach(day => {
            ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
                const type = mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack';
                day[type].forEach(meal => {
                    if (meal.recipeId) {
                        recipeIds.push(meal.recipeId);
                    }
                });
            });
        });

        if (recipeIds.length === 0) {
            this.snackBar.open('No recipes in meal plan to generate shopping list', 'Close', { duration: 3000 });
            return;
        }

        // Navigate to shopping list creation with recipe IDs
        this.router.navigate(['/shopping-lists/create'], { 
            queryParams: { recipes: recipeIds.join(',') } 
        });
    }

    exportMealPlans(): void {
        this.mealPlanService.exportMealPlans({
            startDate: this.currentWeekStart,
            endDate: this.currentWeekEnd
        }).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `meal-plan-${this.currentWeekStart.toISOString().split('T')[0]}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
                
                this.snackBar.open('Meal plans exported', 'Close', { duration: 2000 });
            },
            error: () => {
                this.snackBar.open('Failed to export meal plans', 'Close', { duration: 3000 });
            }
        });
    }

    applyRules(): void {
        if (confirm('This will apply your meal planning rules to this week. Continue?')) {
            this.mealPlanService.applyMealPlanRules(this.currentWeekStart).subscribe({
                next: (mealPlans) => {
                    this.populateWeekWithMealPlans(mealPlans);
                    this.snackBar.open('Rules applied successfully', 'Close', { duration: 2000 });
                },
                error: () => {
                    this.snackBar.open('Failed to apply rules', 'Close', { duration: 3000 });
                }
            });
        }
    }
}

