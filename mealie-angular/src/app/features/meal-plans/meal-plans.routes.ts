import { Routes } from '@angular/router';

export const MEAL_PLANS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/meal-plans-list/meal-plans-list.component').then(m => m.MealPlansListComponent)
    }
];
