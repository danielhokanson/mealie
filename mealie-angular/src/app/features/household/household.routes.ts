import { Routes } from '@angular/router';

export const HOUSEHOLD_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/household-dashboard/household-dashboard.component').then(m => m.HouseholdDashboardComponent)
    },
    {
        path: 'members',
        loadComponent: () => import('./pages/household-members/household-members.component').then(m => m.HouseholdMembersComponent)
    },
    {
        path: 'mealplan',
        loadComponent: () => import('./pages/household-mealplan/household-mealplan.component').then(m => m.HouseholdMealplanComponent)
    },
    {
        path: 'notifiers',
        loadComponent: () => import('./pages/household-notifiers/household-notifiers.component').then(m => m.HouseholdNotifiersComponent)
    },
    {
        path: 'webhooks',
        loadComponent: () => import('./pages/household-webhooks/household-webhooks.component').then(m => m.HouseholdWebhooksComponent)
    }
]; 