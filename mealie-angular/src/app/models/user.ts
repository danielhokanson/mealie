export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    groupId: number;
    group?: Group;
    createdAt: string;
    updatedAt: string;
}

export interface Group {
    id: number;
    name: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface CreateUserRegistration {
    username: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    advancedOptions?: boolean;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: User;
}