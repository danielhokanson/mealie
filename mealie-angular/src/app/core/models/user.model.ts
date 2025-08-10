export interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    groupId: string;
    householdId?: string;
    createdAt: Date;
    updatedAt: Date;
    avatar?: string;
    admin?: boolean;
    lockedAt?: Date;
    loginAttempts?: number;
}

export interface Group {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
    households: Household[];
}

export interface Household {
    id: string;
    name: string;
    slug: string;
    description?: string;
    groupId: string;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
}

export interface UserProfile {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatar?: string;
    group: Group;
    household?: Household;
    preferences: UserPreferences;
}

export interface UserPreferences {
    id: string;
    userId: string;
    theme?: string;
    language?: string;
    timezone?: string;
    units?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: User;
    accessToken?: string;
    refreshToken?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
} 