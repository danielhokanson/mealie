export interface Recipe {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    servings: number;
    rating?: number;
    notes: RecipeNote[];
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    categories: RecipeCategory[];
    tags: RecipeTag[];
    tools: RecipeTool[];
    foods: RecipeFood[];
    groupId: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
    lastMade?: Date;
    favorite?: boolean;
    scale?: number;
    yield?: string;
    nutrition?: RecipeNutrition;
    assets?: RecipeAsset[];
    comments?: RecipeComment[];
    timeline?: RecipeTimelineEvent[];
}

export interface RecipeIngredient {
    id: string;
    title?: string;
    note?: string;
    unit?: string;
    food?: string;
    disableAmount?: boolean;
    quantity: number;
    recipeId: string;
    position: number;
}

export interface RecipeInstruction {
    id: string;
    text: string;
    position: number;
    recipeId: string;
}

export interface RecipeCategory {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export interface RecipeTag {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export interface RecipeTool {
    id: string;
    name: string;
    slug: string;
    onHand?: boolean;
}

export interface RecipeFood {
    id: string;
    name: string;
    slug: string;
    description?: string;
    labelId?: string;
}

export interface RecipeNote {
    id: string;
    title: string;
    text: string;
    recipeId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RecipeComment {
    id: string;
    text: string;
    recipeId: string;
    userId: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface RecipeNutrition {
    calories?: number;
    fat?: number;
    protein?: number;
    carbohydrates?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}

export interface RecipeAsset {
    id: string;
    name: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    recipeId: string;
    createdAt: Date;
}

export interface RecipeTimelineEvent {
    id: string;
    recipeId: string;
    userId: string;
    eventType: string;
    title: string;
    message: string;
    createdAt: Date;
}

export interface RecipeSearchParams {
    search?: string;
    categories?: string[];
    tags?: string[];
    tools?: string[];
    foods?: string[];
    rating?: number;
    time?: number;
    page?: number;
    perPage?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    requireAllCategories?: boolean;
    requireAllTags?: boolean;
    requireAllTools?: boolean;
    requireAllFoods?: boolean;
    households?: string[];
}

export interface RecipeSearchResponse {
    recipes: Recipe[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

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
} 