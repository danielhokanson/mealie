import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { Household } from '../models/household.model';
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
    getHouseholdMembers(householdId: string, page = 1, perPage = -1, params: any = {}): Observable<PaginationData<User>> {
        return this.api.get<PaginationData<User>>(`/households/${householdId}/members`, {
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
     * Invite member to household
     */
    inviteMember(householdId: string, memberData: any): Observable<any> {
        return this.api.post<any>(`/households/${householdId}/invitations`, memberData);
    }

    /**
     * Update member role in household
     */
    updateMemberRole(householdId: string, memberId: string, role: string): Observable<any> {
        return this.api.put<any>(`/households/${householdId}/members/${memberId}/role`, { role });
    }

    /**
     * Remove member from household
     */
    removeMemberFromHousehold(householdId: string, memberId: string): Observable<void> {
        return this.api.delete<void>(`/households/${householdId}/members/${memberId}`);
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
     * Create invitation
     */
    createInvitation(payload: any): Observable<any> {
        return this.api.post<any>('/households/invitations', payload);
    }

    exportHouseholdData(householdId: string): Observable<any> {
        return this.api.get<any>(`/households/${householdId}/export`);
    }

    getWebhooks(): Observable<any[]> {
        return this.api.get<any[]>('/households/webhooks');
    }

    createWebhook(webhook: any): Observable<any> {
        return this.api.post<any>('/households/webhooks', webhook);
    }

    updateWebhook(webhookId: string, webhook: any): Observable<any> {
        return this.api.put<any>(`/households/webhooks/${webhookId}`, webhook);
    }

    deleteWebhook(webhookId: string): Observable<void> {
        return this.api.delete<void>(`/households/webhooks/${webhookId}`);
    }

    testWebhook(webhookId: string): Observable<any> {
        return this.api.post<any>(`/households/webhooks/${webhookId}/test`, {});
    }

    getNotifiers(): Observable<any[]> {
        return this.api.get<any[]>('/households/notifiers');
    }

    createNotifier(notifier: any): Observable<any> {
        return this.api.post<any>('/households/notifiers', notifier);
    }

    updateNotifier(notifierId: string, notifier: any): Observable<any> {
        return this.api.put<any>(`/households/notifiers/${notifierId}`, notifier);
    }

    deleteNotifier(notifierId: string): Observable<void> {
        return this.api.delete<void>(`/households/notifiers/${notifierId}`);
    }
}