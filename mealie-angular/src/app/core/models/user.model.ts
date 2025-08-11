export interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    groupId: string;
    householdId?: string;
    role: string;
    isActive: boolean;
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
    households: import('./household.model').Household[];
}

export interface UserProfile {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatar?: string;
    bio: string;
    location?: string;
    website?: string;
    socialLinks?: SocialLinks;
    group: Group;
    household?: import('./household.model').Household;
    preferences: UserPreferences;
}

export interface UserPreferences {
    id: string;
    userId: string;
    theme?: string;
    language?: string;
    timezone?: string;
    units?: string;
    dietaryRestrictions: string[];
    allergies: string[];
    cuisinePreferences: string[];
    cookingSkill: 'beginner' | 'intermediate' | 'advanced';
    emailNotifications: boolean;
    pushNotifications?: boolean;
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

export interface SocialLinks {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
} 