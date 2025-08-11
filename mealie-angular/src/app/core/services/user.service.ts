import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserProfile, UserPreferences } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private api: ApiService) { }

    /**
     * Get current user profile
     */
    getCurrentUserProfile(): Observable<UserProfile> {
        return this.api.get<UserProfile>('/users/self');
    }

    /**
     * Update user profile
     */
    updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
        return this.api.put<UserProfile>('/users/self', profile);
    }

    /**
     * Get user preferences
     */
    getUserPreferences(): Observable<UserPreferences> {
        return this.api.get<UserPreferences>('/users/preferences');
    }

    /**
     * Update user preferences
     */
    updateUserPreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
        return this.api.put<UserPreferences>('/users/preferences', preferences);
    }

    /**
     * Change password
     */
    changePassword(currentPassword: string, newPassword: string): Observable<void> {
        return this.api.post<void>('/users/password', {
            currentPassword,
            newPassword
        });
    }

    /**
     * Upload user avatar
     */
    uploadAvatar(file: File): Observable<UserProfile> {
        return this.api.upload<UserProfile>('/users/avatar', file);
    }

    /**
     * Delete user avatar
     */
    deleteAvatar(): Observable<void> {
        return this.api.delete<void>('/users/avatar');
    }

    /**
     * Get user by ID
     */
    getUserById(id: string): Observable<User> {
        return this.api.get<User>(`/users/${id}`);
    }

    /**
     * Get user by username
     */
    getUserByUsername(username: string): Observable<User> {
        return this.api.get<User>(`/users/username/${username}`);
    }

    /**
     * Get user by email
     */
    getUserByEmail(email: string): Observable<User> {
        return this.api.get<User>(`/users/email/${email}`);
    }

    /**
     * Reset user settings to defaults
     */
    resetUserSettings(): Observable<any> {
        return this.api.post<any>('/users/settings/reset', {});
    }

    /**
     * Export user data
     */
    exportUserData(): Observable<Blob> {
        return this.api.get<Blob>('/users/export');
    }

    /**
     * Delete user account
     */
    deleteUserAccount(): Observable<void> {
        return this.api.delete<void>('/users/self');
    }

    /**
     * Get all users (admin only)
     */
    getAllUsers(page = 1, perPage = -1, params: any = {}): Observable<any> {
        return this.api.get<any>('/admin/users', {
            page,
            perPage,
            orderBy: 'username',
            orderDirection: 'asc',
            ...params
        });
    }

    /**
     * Get user settings (profile and preferences)
     */
    getUserSettings(): Observable<{ profile: any; preferences: any }> {
        return this.api.get<{ profile: any; preferences: any }>('/users/self/settings');
    }

    /**
     * Update user settings
     */
    updateUserSettings(settings: { profile: any; preferences: any }): Observable<{ profile: any; preferences: any }> {
        return this.api.put<{ profile: any; preferences: any }>('/users/self/settings', settings);
    }

    deleteAccount(userId: string): Observable<void> {
        return this.api.delete<void>(`/users/${userId}`);
    }

    exportUserData(userId: string): Observable<any> {
        return this.api.get<any>(`/users/${userId}/export`);
    }
}