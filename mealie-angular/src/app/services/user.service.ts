import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../features/user/components/user-avatar/user-avatar.component';
import { RegistrationData } from '../features/user/components/user-registration-form/user-registration-form.component';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: User;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:5000/api'; // .NET backend URL

    constructor(private http: HttpClient) { }

    // Authentication
    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
    }

    register(userData: RegistrationData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData);
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/auth/logout`, {});
    }

    refreshToken(refreshToken: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken });
    }

    // User Management
    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/me`);
    }

    updateProfile(userId: string, userData: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData);
    }

    changePassword(userId: string, currentPassword: string, newPassword: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/users/${userId}/change-password`, {
            currentPassword,
            newPassword
        });
    }

    resetPassword(email: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/reset-password`, { email });
    }

    // User Validation
    checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
        return this.http.get<{ available: boolean }>(`${this.apiUrl}/users/check-username?username=${username}`);
    }

    checkEmailAvailability(email: string): Observable<{ available: boolean }> {
        return this.http.get<{ available: boolean }>(`${this.apiUrl}/users/check-email?email=${email}`);
    }

    // User Profile Image
    uploadProfileImage(userId: string, file: File): Observable<{ imageUrl: string }> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/users/${userId}/profile-image`, formData);
    }

    getProfileImage(userId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/users/${userId}/profile-image`, { responseType: 'blob' });
    }

    // Group Users
    getGroupUsers(groupId: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/groups/${groupId}/users`);
    }

    inviteUser(groupId: string, email: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/groups/${groupId}/invite`, { email });
    }

    removeUserFromGroup(groupId: string, userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/groups/${groupId}/users/${userId}`);
    }
} 