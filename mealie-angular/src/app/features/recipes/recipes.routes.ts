import { Routes } from '@angular/router';

export const RECIPE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/recipe-explorer/recipe-explorer.component').then(m => m.RecipeExplorerComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./pages/recipe-create/recipe-create.component').then(m => m.RecipeCreateComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./pages/recipe-detail/recipe-detail.component').then(m => m.RecipeDetailComponent)
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./pages/recipe-edit/recipe-edit.component').then(m => m.RecipeEditComponent)
    },
    {
        path: 'favorites',
        loadComponent: () => import('./pages/recipe-favorites/recipe-favorites.component').then(m => m.RecipeFavoritesComponent)
    }
]; 