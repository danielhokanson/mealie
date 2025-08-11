import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Recipe, RecipeCategory, RecipeTag, RecipeTool, RecipeFood } from '../models/recipe.model';
import { PaginationData } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class RecipeService {
    constructor(private api: ApiService) { }

    /**
     * Get all recipes
     */
    getAllRecipes(page = 1, perPage = 20, params: any = {}): Observable<PaginationData<Recipe>> {
        return this.api.get<PaginationData<Recipe>>('/recipes', {
            page,
            perPage,
            ...params
        });
    }

    /**
     * Get recipe by ID
     */
    getRecipe(id: string): Observable<Recipe> {
        return this.api.get<Recipe>(`/recipes/${id}`);
    }

    /**
     * Get recipe by slug
     */
    getRecipeBySlug(slug: string): Observable<Recipe> {
        return this.api.get<Recipe>(`/recipes/${slug}`);
    }

    /**
     * Create a new recipe
     */
    createRecipe(recipe: Partial<Recipe>): Observable<Recipe> {
        return this.api.post<Recipe>('/recipes', recipe);
    }

    /**
     * Update a recipe
     */
    updateRecipe(slug: string, recipe: Partial<Recipe>): Observable<Recipe> {
        return this.api.put<Recipe>(`/recipes/${slug}`, recipe);
    }

    /**
     * Delete a recipe
     */
    deleteRecipe(slug: string): Observable<void> {
        return this.api.delete<void>(`/recipes/${slug}`);
    }

    /**
     * Search recipes
     */
    searchRecipes(query: string, page = 1, perPage = 20, filters: any = {}): Observable<PaginationData<Recipe>> {
        return this.api.get<PaginationData<Recipe>>('/recipes', {
            search: query,
            page,
            perPage,
            ...filters
        });
    }

    /**
     * Get recipes with search parameters (used by recipe explorer)
     */
    getRecipes(params?: any): Observable<PaginationData<Recipe>> {
        return this.api.get<PaginationData<Recipe>>('/recipes', params);
    }

    /**
     * Get random recipe
     */
    getRandomRecipe(): Observable<Recipe> {
        return this.api.get<Recipe>('/recipes/random');
    }

    /**
     * Get recipe categories
     */
    getCategories(): Observable<RecipeCategory[]> {
        return this.api.get<RecipeCategory[]>('/recipes/categories');
    }

    /**
     * Get recipe tags
     */
    getTags(): Observable<RecipeTag[]> {
        return this.api.get<RecipeTag[]>('/recipes/tags');
    }

    /**
     * Get recipe tools
     */
    getTools(): Observable<RecipeTool[]> {
        return this.api.get<RecipeTool[]>('/recipes/tools');
    }

    /**
     * Get recipe foods
     */
    getFoods(): Observable<RecipeFood[]> {
        return this.api.get<RecipeFood[]>('/recipes/foods');
    }

    /**
     * Get user's favorite recipes
     */
    getFavoriteRecipes(page = 1, perPage = 20): Observable<PaginationData<Recipe>> {
        return this.api.get<PaginationData<Recipe>>('/recipes', {
            favorite: true,
            page,
            perPage
        });
    }

    /**
     * Toggle recipe favorite status
     */
    toggleFavorite(slug: string): Observable<Recipe> {
        return this.api.post<Recipe>(`/recipes/${slug}/favorite`, {});
    }

    /**
     * Get recipe timeline
     */
    getRecipeTimeline(slug: string): Observable<any[]> {
        return this.api.get<any[]>(`/recipes/${slug}/timeline`);
    }

    /**
     * Add recipe to meal plan
     */
    addToMealPlan(slug: string, date: string): Observable<any> {
        return this.api.post<any>(`/recipes/${slug}/meal-plan`, { date });
    }

    /**
     * Export recipe
     */
    exportRecipe(slug: string, format: string): Observable<Blob> {
        return this.api.get<Blob>(`/recipes/${slug}/exports/${format}`);
    }

    /**
     * Upload recipe image
     */
    uploadRecipeImage(slug: string, file: File): Observable<Recipe> {
        return this.api.upload<Recipe>(`/recipes/${slug}/image`, file);
    }

    /**
     * Scale recipe
     */
    scaleRecipe(slug: string, scale: number): Observable<Recipe> {
        return this.api.get<Recipe>(`/recipes/${slug}`, { scale });
    }

    /**
     * Get recipe comments
     */
    getRecipeComments(slug: string): Observable<any[]> {
        return this.api.get<any[]>(`/recipes/${slug}/comments`);
    }

    /**
     * Create recipe comment
     */
    createRecipeComment(slug: string, comment: any): Observable<any> {
        return this.api.post<any>(`/recipes/${slug}/comments`, comment);
    }

    /**
     * Update recipe comment
     */
    updateRecipeComment(commentId: string, comment: any): Observable<any> {
        return this.api.put<any>(`/comments/${commentId}`, comment);
    }

    /**
     * Delete recipe comment
     */
    deleteRecipeComment(commentId: string): Observable<void> {
        return this.api.delete<void>(`/comments/${commentId}`);
    }

    /**
     * Create recipe from URL
     */
    createRecipeFromUrl(url: string, includeTags = false): Observable<string> {
        return this.api.post<string>('/recipes/create/url', { url, includeTags });
    }

    /**
     * Test scrape URL
     */
    testScrapeUrl(url: string, useOpenAI = false): Observable<Recipe | null> {
        return this.api.post<Recipe | null>('/recipes/test-scrape-url', { url, useOpenAI });
    }

    /**
     * Parse ingredient
     */
    parseIngredient(ingredient: string, parser = 'nlp'): Observable<any> {
        return this.api.post<any>('/parser/ingredient', { ingredient, parser });
    }

    /**
     * Parse ingredients
     */
    parseIngredients(ingredients: string[], parser = 'nlp'): Observable<any[]> {
        return this.api.post<any[]>('/parser/ingredients', { ingredients, parser });
    }

    /**
     * Get recipe suggestions
     */
    getRecipeSuggestions(query: any, foods?: string[], tools?: string[]): Observable<any> {
        return this.api.get<any>('/recipes/suggestions', { ...query, foods, tools });
    }

    /**
     * Create recipe asset
     */
    createRecipeAsset(slug: string, asset: File): Observable<any> {
        return this.api.upload<any>(`/recipes/${slug}/assets`, asset);
    }

    /**
     * Update recipe image by URL
     */
    updateRecipeImageByUrl(slug: string, url: string): Observable<any> {
        return this.api.post<any>(`/recipes/${slug}/image`, { url });
    }

    /**
     * Get recipe export token
     */
    getRecipeExportToken(slug: string): Observable<any> {
        return this.api.post<any>(`/recipes/${slug}/exports`, {});
    }

    /**
     * Update recipe last made
     */
    updateRecipeLastMade(slug: string, timestamp: string): Observable<Recipe> {
        return this.api.patch<Recipe>(`/recipes/${slug}/last-made`, { timestamp });
    }

    /**
     * Create timeline event
     */
    createTimelineEvent(payload: any): Observable<any> {
        return this.api.post<any>('/recipes/timeline/events', payload);
    }

    /**
     * Update timeline event
     */
    updateTimelineEvent(eventId: string, payload: any): Observable<any> {
        return this.api.put<any>(`/recipes/timeline/events/${eventId}`, payload);
    }

    /**
     * Delete timeline event
     */
    deleteTimelineEvent(eventId: string): Observable<any> {
        return this.api.delete<any>(`/recipes/timeline/events/${eventId}`);
    }

    /**
     * Get all timeline events
     */
    getAllTimelineEvents(page = 1, perPage = -1, params: any = {}): Observable<any> {
        return this.api.get<any>('/recipes/timeline/events', { page, perPage, ...params });
    }

    /**
     * Bulk update recipes
     */
    bulkUpdateRecipes(recipes: Recipe[]): Observable<Recipe[]> {
        return this.api.put<Recipe[]>('/recipes', recipes);
    }

    /**
     * Bulk delete recipes
     */
    bulkDeleteRecipes(recipeIds: string[]): Observable<void> {
        return this.api.post<void>('/recipes/bulk/delete', { ids: recipeIds });
    }

    /**
     * Bulk export recipes
     */
    bulkExportRecipes(recipeIds: string[], format = 'json'): Observable<Blob> {
        return this.api.get<Blob>('/recipes/bulk/export', { ids: recipeIds, format });
    }

    /**
     * Bulk add category to recipes
     */
    bulkAddCategory(recipeIds: string[], categoryId: string): Observable<any> {
        return this.api.post<any>('/recipes/bulk/category', { recipeIds, categoryId, action: 'add' });
    }

    /**
     * Bulk remove category from recipes
     */
    bulkRemoveCategory(recipeIds: string[], categoryId: string): Observable<any> {
        return this.api.post<any>('/recipes/bulk/category', { recipeIds, categoryId, action: 'remove' });
    }

    /**
     * Bulk add tag to recipes
     */
    bulkAddTag(recipeIds: string[], tagId: string): Observable<any> {
        return this.api.post<any>('/recipes/bulk/tag', { recipeIds, tagId, action: 'add' });
    }

    /**
     * Bulk remove tag from recipes
     */
    bulkRemoveTag(recipeIds: string[], tagId: string): Observable<any> {
        return this.api.post<any>('/recipes/bulk/tag', { recipeIds, tagId, action: 'remove' });
    }

    /**
     * Share a recipe
     */
    shareRecipe(id: string, options: any): Observable<any> {
        return this.api.post<any>(`/recipes/${id}/share`, options);
    }

    /**
     * Remove recipe from favorites
     */
    removeFromFavorites(id: string): Observable<Recipe> {
        return this.api.delete<Recipe>(`/recipes/${id}/favorite`);
    }

    /**
     * Add recipe to favorites
     */
    addToFavorites(id: string): Observable<Recipe> {
        return this.api.post<Recipe>(`/recipes/${id}/favorite`, {});
    }

    /**
     * Create a recipe note
     */
    createRecipeNote(id: string, note: any): Observable<any> {
        return this.api.post<any>(`/recipes/${id}/notes`, note);
    }

    /**
     * Save recipe rating
     */
    saveRecipeRating(id: string, rating: number): Observable<any> {
        return this.api.post<any>(`/recipes/${id}/rating`, { rating });
    }
}