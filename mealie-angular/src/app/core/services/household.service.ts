import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Household, User } from '../models/user.model';
import { PaginationData } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class HouseholdService {
    constructor(private api: ApiService) { }

    /**
     * Get the current user's household
     */
    getCurrentUserHousehold(): Observable<Household> {
        return this.api.get<Household>('/households/self');
    }

    /**
     * Get all households (admin only)
     */
    getAllHouseholds(page = 1, perPage = -1, params: any = {}): Observable<PaginationData<Household>> {
        return this.api.get<PaginationData<Household>>('/admin/households', {
            page,
            perPage,
            orderBy: 'name',
            orderDirection: 'asc',
            ...params
        });
    }

    /**
     * Get household by ID
     */
    getHouseholdById(id: string): Observable<Household> {
        return this.api.get<Household>(`/admin/households/${id}`);
    }

    /**
     * Create a new household
     */
    createHousehold(household: Partial<Household>): Observable<Household> {
        return this.api.post<Household>('/admin/households', household);
    }

    /**
     * Update a household
     */
    updateHousehold(id: string, household: Partial<Household>): Observable<Household> {
        return this.api.put<Household>(`/admin/households/${id}`, household);
    }

    /**
     * Delete a household
     */
    deleteHousehold(id: string): Observable<void> {
        return this.api.delete<void>(`/admin/households/${id}`);
    }

    /**
     * Get household members
     */
    getHouseholdMembers(page = 1, perPage = -1, params: any = {}): Observable<PaginationData<User>> {
        return this.api.get<PaginationData<User>>('/households/members', {
            page,
            perPage,
            ...params
        });
    }

    /**
     * Add member to household
     */
    addMember(email: string): Observable<User> {
        return this.api.post<User>('/households/members', {
            email
        });
    }

    /**
     * Update member permissions in household
     */
    updateMemberPermissions(userId: string, permissions: any): Observable<User> {
        return this.api.put<User>(`/households/members/${userId}/permissions`, permissions);
    }

    /**
     * Remove member from household
     */
    removeMember(userId: string): Observable<void> {
        return this.api.delete<void>(`/households/members/${userId}`);
    }

    /**
     * Get household preferences
     */
    getHouseholdPreferences(): Observable<any> {
        return this.api.get<any>('/households/preferences');
    }

    /**
     * Update household preferences
     */
    updateHouseholdPreferences(preferences: any): Observable<any> {
        return this.api.put<any>('/households/preferences', preferences);
    }

    /**
     * Get household statistics
     */
    getHouseholdStatistics(): Observable<any> {
        return this.api.get<any>('/households/statistics');
    }

    /**
     * Create household invitation token
     */
    createInvitation(payload: any): Observable<any> {
        return this.api.post<any>('/households/invitations', payload);
    }
}