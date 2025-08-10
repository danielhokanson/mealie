import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RecipeNote } from '../features/recipes/components/utils/recipe-notes/recipe-notes.component';
import { RecipeRating } from '../features/recipes/components/recipe-rating/recipe-rating.component';
import { User } from '../features/user/components/user-avatar/user-avatar.component';

export interface Recipe {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    servings: number;
    rating?: number;
    notes: RecipeNote[];
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    categories: RecipeCategory[];
    tags: RecipeTag[];
    groupId: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RecipeIngredient {
    id: string;
    title?: string;
    note?: string;
    unit?: string;
    food?: string;
    disableAmount?: boolean;
    quantity: number;
    recipeId: string;
}

export interface RecipeInstruction {
    id: string;
    text: string;
    position: number;
    recipeId: string;
}

export interface RecipeCategory {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export interface RecipeTag {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export interface RecipeComment {
    id: string;
    text: string;
    recipeId: string;
    userId: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface RecipeSearchParams {
    search?: string;
    categories?: string[];
    tags?: string[];
    rating?: number;
    time?: number;
    page?: number;
    perPage?: number;
}

export interface RecipeSearchResponse {
    recipes: Recipe[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class RecipeService {
    private apiUrl = 'http://localhost:5000/api'; // .NET backend URL

    constructor(private http: HttpClient) { }

    // Recipe CRUD
    getRecipes(params?: RecipeSearchParams): Observable<RecipeSearchResponse> {
        let url = `${this.apiUrl}/recipes`;
        if (params) {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.set('search', params.search);
            if (params.categories) queryParams.set('categories', params.categories.join(','));
            if (params.tags) queryParams.set('tags', params.tags.join(','));
            if (params.rating) queryParams.set('rating', params.rating.toString());
            if (params.time) queryParams.set('time', params.time.toString());
            if (params.page) queryParams.set('page', params.page.toString());
            if (params.perPage) queryParams.set('perPage', params.perPage.toString());

            const queryString = queryParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return this.http.get<RecipeSearchResponse>(url);
    }

    getRecipe(id: string): Observable<Recipe> {
        return this.http.get<Recipe>(`${this.apiUrl}/recipes/${id}`);
    }

    getRecipeBySlug(slug: string): Observable<Recipe> {
        return this.http.get<Recipe>(`${this.apiUrl}/recipes/slug/${slug}`);
    }

    createRecipe(recipe: Partial<Recipe>): Observable<Recipe> {
        return this.http.post<Recipe>(`${this.apiUrl}/recipes`, recipe);
    }

    updateRecipe(id: string, recipe: Partial<Recipe>): Observable<Recipe> {
        return this.http.put<Recipe>(`${this.apiUrl}/recipes/${id}`, recipe);
    }

    deleteRecipe(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/recipes/${id}`);
    }

    // Recipe Notes
    getRecipeNotes(recipeId: string): Observable<RecipeNote[]> {
        return this.http.get<RecipeNote[]>(`${this.apiUrl}/recipes/${recipeId}/notes`);
    }

    createRecipeNote(recipeId: string, note: Partial<RecipeNote>): Observable<RecipeNote> {
        return this.http.post<RecipeNote>(`${this.apiUrl}/recipes/${recipeId}/notes`, note);
    }

    updateRecipeNote(recipeId: string, noteId: string, note: Partial<RecipeNote>): Observable<RecipeNote> {
        return this.http.put<RecipeNote>(`${this.apiUrl}/recipes/${recipeId}/notes/${noteId}`, note);
    }

    deleteRecipeNote(recipeId: string, noteId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/recipes/${recipeId}/notes/${noteId}`);
    }

    // Recipe Ratings
    getRecipeRating(recipeId: string): Observable<RecipeRating | null> {
        return this.http.get<RecipeRating | null>(`${this.apiUrl}/recipes/${recipeId}/rating`);
    }

    saveRecipeRating(recipeId: string, rating: number): Observable<RecipeRating> {
        return this.http.post<RecipeRating>(`${this.apiUrl}/recipes/${recipeId}/rating`, { rating });
    }

    deleteRecipeRating(recipeId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/recipes/${recipeId}/rating`);
    }

    // Recipe Categories
    getCategories(): Observable<RecipeCategory[]> {
        return this.http.get<RecipeCategory[]>(`${this.apiUrl}/categories`);
    }

    createCategory(category: Partial<RecipeCategory>): Observable<RecipeCategory> {
        return this.http.post<RecipeCategory>(`${this.apiUrl}/categories`, category);
    }

    updateCategory(id: string, category: Partial<RecipeCategory>): Observable<RecipeCategory> {
        return this.http.put<RecipeCategory>(`${this.apiUrl}/categories/${id}`, category);
    }

    deleteCategory(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
    }

    // Recipe Tags
    getTags(): Observable<RecipeTag[]> {
        return this.http.get<RecipeTag[]>(`${this.apiUrl}/tags`);
    }

    createTag(tag: Partial<RecipeTag>): Observable<RecipeTag> {
        return this.http.post<RecipeTag>(`${this.apiUrl}/tags`, tag);
    }

    updateTag(id: string, tag: Partial<RecipeTag>): Observable<RecipeTag> {
        return this.http.put<RecipeTag>(`${this.apiUrl}/tags/${id}`, tag);
    }

    deleteTag(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tags/${id}`);
    }

    // Recipe Favorites
    getFavoriteRecipes(): Observable<Recipe[]> {
        return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/favorites`);
    }

    addToFavorites(recipeId: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/recipes/${recipeId}/favorite`, {});
    }

    removeFromFavorites(recipeId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/recipes/${recipeId}/favorite`);
    }

    // Recipe Images
    uploadRecipeImage(recipeId: string, file: File): Observable<{ imageUrl: string }> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/recipes/${recipeId}/image`, formData);
    }

    deleteRecipeImage(recipeId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/recipes/${recipeId}/image`);
    }

    // Recipe Sharing
    shareRecipe(recipeId: string, shareData: { email?: string; message?: string }): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/recipes/${recipeId}/share`, shareData);
    }

    // Recipe Import/Export
    exportRecipe(recipeId: string, format: 'json' | 'pdf'): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/recipes/${recipeId}/export?format=${format}`, { responseType: 'blob' });
    }

    importRecipe(file: File): Observable<Recipe> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<Recipe>(`${this.apiUrl}/recipes/import`, formData);
    }

    // Recipe Comments
    getRecipeComments(recipeId: string): Observable<RecipeComment[]> {
        return this.http.get<RecipeComment[]>(`${this.apiUrl}/recipes/${recipeId}/comments`);
    }

    createRecipeComment(recipeId: string, comment: Partial<RecipeComment>): Observable<RecipeComment> {
        return this.http.post<RecipeComment>(`${this.apiUrl}/recipes/${recipeId}/comments`, comment);
    }

    updateRecipeComment(recipeId: string, commentId: string, comment: Partial<RecipeComment>): Observable<RecipeComment> {
        return this.http.put<RecipeComment>(`${this.apiUrl}/recipes/${recipeId}/comments/${commentId}`, comment);
    }

    deleteRecipeComment(recipeId: string, commentId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/recipes/${recipeId}/comments/${commentId}`);
    }
} 