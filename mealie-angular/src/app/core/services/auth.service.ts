import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private api: ApiService) {
        this.loadUserFromStorage();
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isAuthenticated(): boolean {
        return !!this.currentUserSubject.value;
    }

    get token(): string | null {
        return localStorage.getItem('accessToken');
    }

    get redirectUrl(): string | null {
        return localStorage.getItem('redirectUrl');
    }

    set redirectUrl(url: string | null) {
        if (url) {
            localStorage.setItem('redirectUrl', url);
        } else {
            localStorage.removeItem('redirectUrl');
        }
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('/auth/login', request).pipe(
            tap(response => {
                if (response.success && response.accessToken) {
                    this.setToken(response.accessToken);
                    if (response.user) {
                        this.setCurrentUser(response.user);
                    }
                }
            })
        );
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('/auth/register', request).pipe(
            tap(response => {
                if (response.success && response.accessToken) {
                    this.setToken(response.accessToken);
                    if (response.user) {
                        this.setCurrentUser(response.user);
                    }
                }
            })
        );
    }

    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.currentUserSubject.next(null);
    }

    refreshToken(): Observable<AuthResponse> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        return this.api.post<AuthResponse>('/auth/refresh', { refreshToken });
    }

    getCurrentUser(): Observable<User> {
        return this.api.get<User>('/auth/me').pipe(
            tap(user => this.setCurrentUser(user))
        );
    }

    updateProfile(userData: Partial<User>): Observable<User> {
        return this.api.put<User>('/auth/profile', userData).pipe(
            tap(user => this.setCurrentUser(user))
        );
    }

    changePassword(currentPassword: string, newPassword: string): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('/auth/change-password', {
            currentPassword,
            newPassword
        });
    }

    forgotPassword(email: string): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('/auth/forgot-password', { email });
    }

    resetPassword(token: string, newPassword: string): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('/auth/reset-password', {
            token,
            newPassword
        });
    }

    private setToken(token: string): void {
        localStorage.setItem('accessToken', token);
    }

    private setCurrentUser(user: User): void {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    private loadUserFromStorage(): void {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                this.currentUserSubject.next(user);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                this.logout();
            }
        }
    }
} 