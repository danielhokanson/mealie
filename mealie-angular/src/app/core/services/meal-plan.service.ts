import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface MealPlan {
    id: string;
    date: Date;
    entryType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'side';
    title: string;
    text: string;
    recipeId?: string;
    recipe?: any; // Recipe model
    groupId: string;
    householdId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MealPlanRule {
    id: string;
    groupId: string;
    householdId?: string;
    day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | 'unset';
    entryType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'side';
    queryFilterString: string;
    categories?: any[];
    tags?: any[];
    households?: any[];
}

export interface MealPlanQuery {
    startDate?: Date;
    endDate?: Date;
    householdId?: string;
    groupId?: string;
    entryType?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MealPlanService {
    constructor(private api: ApiService) { }

    /**
     * Get meal plans for a date range
     */
    getMealPlans(query: MealPlanQuery): Observable<MealPlan[]> {
        const params: any = {};
        if (query.startDate) params.startDate = query.startDate.toISOString();
        if (query.endDate) params.endDate = query.endDate.toISOString();
        if (query.householdId) params.householdId = query.householdId;
        if (query.groupId) params.groupId = query.groupId;
        if (query.entryType) params.entryType = query.entryType;
        
        return this.api.get<MealPlan[]>('/meal-plans', params);
    }

    /**
     * Get meal plan by ID
     */
    getMealPlan(id: string): Observable<MealPlan> {
        return this.api.get<MealPlan>(`/meal-plans/${id}`);
    }

    /**
     * Get today's meal plans
     */
    getTodaysMealPlans(): Observable<MealPlan[]> {
        return this.api.get<MealPlan[]>('/meal-plans/today');
    }

    /**
     * Get this week's meal plans
     */
    getWeeklyMealPlans(weekOffset = 0): Observable<MealPlan[]> {
        return this.api.get<MealPlan[]>('/meal-plans/week', { weekOffset });
    }

    /**
     * Create a new meal plan
     */
    createMealPlan(mealPlan: Partial<MealPlan>): Observable<MealPlan> {
        return this.api.post<MealPlan>('/meal-plans', mealPlan);
    }

    /**
     * Update a meal plan
     */
    updateMealPlan(id: string, mealPlan: Partial<MealPlan>): Observable<MealPlan> {
        return this.api.put<MealPlan>(`/meal-plans/${id}`, mealPlan);
    }

    /**
     * Delete a meal plan
     */
    deleteMealPlan(id: string): Observable<void> {
        return this.api.delete<void>(`/meal-plans/${id}`);
    }

    /**
     * Bulk create meal plans
     */
    bulkCreateMealPlans(mealPlans: Partial<MealPlan>[]): Observable<MealPlan[]> {
        return this.api.post<MealPlan[]>('/meal-plans/bulk', { mealPlans });
    }

    /**
     * Copy meal plan to another date
     */
    copyMealPlan(id: string, targetDate: Date): Observable<MealPlan> {
        return this.api.post<MealPlan>(`/meal-plans/${id}/copy`, { 
            targetDate: targetDate.toISOString() 
        });
    }

    /**
     * Get meal plan rules
     */
    getMealPlanRules(): Observable<MealPlanRule[]> {
        return this.api.get<MealPlanRule[]>('/meal-plans/rules');
    }

    /**
     * Get meal plan rule by ID
     */
    getMealPlanRule(id: string): Observable<MealPlanRule> {
        return this.api.get<MealPlanRule>(`/meal-plans/rules/${id}`);
    }

    /**
     * Create meal plan rule
     */
    createMealPlanRule(rule: Partial<MealPlanRule>): Observable<MealPlanRule> {
        return this.api.post<MealPlanRule>('/meal-plans/rules', rule);
    }

    /**
     * Update meal plan rule
     */
    updateMealPlanRule(id: string, rule: Partial<MealPlanRule>): Observable<MealPlanRule> {
        return this.api.put<MealPlanRule>(`/meal-plans/rules/${id}`, rule);
    }

    /**
     * Delete meal plan rule
     */
    deleteMealPlanRule(id: string): Observable<void> {
        return this.api.delete<void>(`/meal-plans/rules/${id}`);
    }

    /**
     * Apply meal plan rules for a week
     */
    applyMealPlanRules(startDate: Date): Observable<MealPlan[]> {
        return this.api.post<MealPlan[]>('/meal-plans/rules/apply', {
            startDate: startDate.toISOString()
        });
    }

    /**
     * Get random meal suggestions
     */
    getRandomMealSuggestions(query: any = {}): Observable<any[]> {
        return this.api.get<any[]>('/meal-plans/suggestions', query);
    }

    /**
     * Export meal plans as PDF
     */
    exportMealPlans(query: MealPlanQuery): Observable<Blob> {
        const params: any = {};
        if (query.startDate) params.startDate = query.startDate.toISOString();
        if (query.endDate) params.endDate = query.endDate.toISOString();
        if (query.householdId) params.householdId = query.householdId;
        
        return this.api.get<Blob>('/meal-plans/export', params);
    }

    /**
     * Import meal plans from file
     */
    importMealPlans(file: File): Observable<MealPlan[]> {
        const formData = new FormData();
        formData.append('file', file);
        return this.api.post<MealPlan[]>('/meal-plans/import', formData);
    }
}