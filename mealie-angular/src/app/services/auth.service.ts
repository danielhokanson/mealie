import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, CreateUserRegistration, User } from '../models/user';
import { environment } from '../../environments/environment';

export interface AuthState {
    user: User | null;
    token: string | null;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface LoginRequest {
    username: string;
    password: string;
    remember_me: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly AUTH_TOKEN_KEY = 'mealie.access_token';
    private readonly API_URL = `${environment.apiUrl}/auth`;
    private authState = new BehaviorSubject<AuthState>({
        user: null,
        token: null
    });

    constructor(private http: HttpClient) {
        this.restoreAuthState();
    }

    private restoreAuthState(): void {
        // Try to get the token from sessionStorage
        const token = sessionStorage.getItem(this.AUTH_TOKEN_KEY) || localStorage.getItem(this.AUTH_TOKEN_KEY);

        if (token) {
            // If we have a token, fetch the user details
            this.fetchCurrentUser(token).subscribe({
                next: (user) => {
                    this.authState.next({
                        user,
                        token
                    });
                },
                error: () => {
                    // If fetching user fails, clear the token
                    this.clearAuth();
                }
            });
        }
    }

    login(username: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
        const loginData = {
            username,
            password
        };

        return this.http.post<LoginResponse>(`${this.API_URL}/login`, loginData).pipe(
            tap(response => {
                const token = response.access_token;

                // Store token in appropriate storage
                if (rememberMe) {
                    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
                } else {
                    sessionStorage.setItem(this.AUTH_TOKEN_KEY, token);
                }

                // Fetch user details
                this.fetchCurrentUser(token).subscribe(user => {
                    this.authState.next({
                        user,
                        token
                    });
                });
            })
        );
    }

    private fetchCurrentUser(token: string): Observable<User> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<User>(`${environment.apiUrl}/users/me`, { headers });
    }

    register(userData: CreateUserRegistration): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData).pipe(
            tap(response => {
                if (!response.success) {
                    throw new Error(response.message || 'Registration failed');
                }
            })
        );
    }

    logout(): void {
        // Call logout endpoint
        this.http.post(`${this.API_URL}/logout`, {}).subscribe({
            complete: () => this.clearAuth()
        });
    }

    private clearAuth(): void {
        // Clear state
        this.authState.next({
            user: null,
            token: null
        });

        // Clear storage
        sessionStorage.removeItem(this.AUTH_TOKEN_KEY);
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return this.authState.value.user !== null;
    }

    getCurrentUser(): User | null {
        return this.authState.value.user;
    }

    getAuthState(): Observable<AuthState> {
        return this.authState.asObservable();
    }

    getToken(): string | null {
        return this.authState.value.token;
    }
}