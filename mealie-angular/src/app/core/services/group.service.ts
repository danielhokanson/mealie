import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Group, User } from '../models/user.model';
import { PaginationData } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class GroupService {
    constructor(private api: ApiService) { }

    /**
     * Get the current user's group
     */
    getCurrentUserGroup(): Observable<Group> {
        return this.api.get<Group>('/groups/self');
    }

    /**
     * Get all groups (admin only)
     */
    getAllGroups(page = 1, perPage = -1, params: any = {}): Observable<PaginationData<Group>> {
        return this.api.get<PaginationData<Group>>('/admin/groups', {
            page,
            perPage,
            orderBy: 'name',
            orderDirection: 'asc',
            ...params
        });
    }

    /**
     * Get group by ID
     */
    getGroupById(id: string): Observable<Group> {
        return this.api.get<Group>(`/admin/groups/${id}`);
    }

    /**
     * Create a new group
     */
    createGroup(group: Partial<Group>): Observable<Group> {
        return this.api.post<Group>('/admin/groups', group);
    }

    /**
     * Update a group
     */
    updateGroup(id: string, group: Partial<Group>): Observable<Group> {
        return this.api.put<Group>(`/admin/groups/${id}`, group);
    }

    /**
     * Delete a group
     */
    deleteGroup(id: string): Observable<void> {
        return this.api.delete<void>(`/admin/groups/${id}`);
    }

    /**
     * Get group members
     */
    getGroupMembers(page = 1, perPage = -1, params: any = {}): Observable<PaginationData<User>> {
        return this.api.get<PaginationData<User>>('/groups/members', {
            page,
            perPage,
            ...params
        });
    }

    /**
     * Add member to group
     */
    addMember(email: string, admin = false): Observable<User> {
        return this.api.post<User>('/groups/members', {
            email,
            admin
        });
    }

    /**
     * Update member permissions
     */
    updateMemberPermissions(userId: string, permissions: any): Observable<User> {
        return this.api.put<User>(`/groups/members/${userId}/permissions`, permissions);
    }

    /**
     * Remove member from group
     */
    removeMember(userId: string): Observable<void> {
        return this.api.delete<void>(`/groups/members/${userId}`);
    }

    /**
     * Get group preferences
     */
    getGroupPreferences(): Observable<any> {
        return this.api.get<any>('/groups/preferences');
    }

    /**
     * Update group preferences
     */
    updateGroupPreferences(preferences: any): Observable<any> {
        return this.api.put<any>('/groups/preferences', preferences);
    }

    /**
     * Get group storage information
     */
    getGroupStorage(): Observable<any> {
        return this.api.get<any>('/groups/storage');
    }
}