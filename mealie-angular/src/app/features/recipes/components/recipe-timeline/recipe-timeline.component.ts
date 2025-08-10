import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppLoaderComponent } from '../app-loader/app-loader.component';
import { RecipeTimelineItemComponent } from '../recipe-timeline-item/recipe-timeline-item.component';

export interface RecipeTimelineEvent {
    id: string;
    recipeId: string;
    subject: string;
    eventMessage: string;
    image?: string;
    timestamp: Date;
    eventType: TimelineEventType;
}

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    image?: string;
    // ... other recipe properties
}

export type TimelineEventType = 'created' | 'updated' | 'deleted' | 'favorited' | 'unfavorited' | 'made' | 'shared';

export interface TimelinePreferences {
    orderDirection: 'asc' | 'desc';
    types: TimelineEventType[];
}

export interface EventTypeOption {
    value: TimelineEventType;
    label: string;
    icon: string;
    checked: boolean;
}

@Component({
    selector: 'app-recipe-timeline',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatBadgeModule,
        MatMenuModule,
        MatCheckboxModule,
        MatDividerModule,
        MatProgressBarModule,
        AppLoaderComponent,
        RecipeTimelineItemComponent
    ],
    templateUrl: './recipe-timeline.component.html',
    styleUrls: ['./recipe-timeline.component.scss']
})
export class RecipeTimelineComponent implements OnInit, OnDestroy {
    @Input() modelValue = false;
    @Input() queryFilter = '';
    @Input() maxHeight?: number | string;
    @Input() showRecipeCards = false;

    @Output() modelValueChange = new EventEmitter<boolean>();

    loading = true;
    ready = false;
    page = 1;
    perPage = 32;
    hasMore = true;

    timelineEvents: RecipeTimelineEvent[] = [];
    recipes = new Map<string, Recipe>();

    preferences: TimelinePreferences = {
        orderDirection: 'desc',
        types: ['created', 'updated', 'deleted', 'favorited', 'unfavorited', 'made', 'shared']
    };

    eventTypeOptions: EventTypeOption[] = [
        { value: 'created', label: 'Created', icon: 'add', checked: true },
        { value: 'updated', label: 'Updated', icon: 'edit', checked: true },
        { value: 'deleted', label: 'Deleted', icon: 'delete', checked: true },
        { value: 'favorited', label: 'Favorited', icon: 'favorite', checked: true },
        { value: 'unfavorited', label: 'Unfavorited', icon: 'favorite_border', checked: true },
        { value: 'made', label: 'Made', icon: 'restaurant', checked: true },
        { value: 'shared', label: 'Shared', icon: 'share', checked: true }
    ];

    private scrollHandler?: () => void;

    get filterBadgeCount(): number {
        return this.eventTypeOptions.length - this.preferences.types.length;
    }

    get eventTypeFilterState(): EventTypeOption[] {
        return this.eventTypeOptions.map(option => ({
            ...option,
            checked: this.preferences.types.includes(option.value)
        }));
    }

    ngOnInit(): void {
        if (this.modelValue) {
            this.initializeTimelineEvents();
        }
        this.setupScrollHandler();
    }

    ngOnDestroy(): void {
        if (this.scrollHandler) {
            document.removeEventListener('scroll', this.scrollHandler);
        }
    }

    reverseSort(): void {
        if (this.loading) return;

        this.preferences.orderDirection = this.preferences.orderDirection === 'asc' ? 'desc' : 'asc';
        this.initializeTimelineEvents();
    }

    toggleEventTypeOption(option: TimelineEventType): void {
        if (this.loading) return;

        const index = this.preferences.types.indexOf(option);
        if (index === -1) {
            this.preferences.types.push(option);
        } else {
            this.preferences.types.splice(index, 1);
        }

        this.initializeTimelineEvents();
    }

    async updateTimelineEvent(index: number): Promise<void> {
        const event = this.timelineEvents[index];
        const payload = {
            subject: event.subject,
            eventMessage: event.eventMessage,
            image: event.image
        };

        try {
            // In a real app, you'd call the backend API
            // await this.recipeService.updateTimelineEvent(event.id, payload);
            console.log('Timeline event updated:', event.id, payload);
        } catch (error) {
            console.error('Failed to update timeline event:', error);
        }
    }

    async deleteTimelineEvent(index: number): Promise<void> {
        const event = this.timelineEvents[index];

        try {
            // In a real app, you'd call the backend API
            // await this.recipeService.deleteTimelineEvent(event.id);
            this.timelineEvents.splice(index, 1);
            console.log('Timeline event deleted:', event.id);
        } catch (error) {
            console.error('Failed to delete timeline event:', error);
        }
    }

    private async getRecipes(recipeIds: string[]): Promise<Recipe[]> {
        try {
            // In a real app, you'd call the backend API
            // const recipes = await this.recipeService.getRecipesByIds(recipeIds);
            return [];
        } catch (error) {
            console.error('Failed to get recipes:', error);
            return [];
        }
    }

    private async updateRecipes(events: RecipeTimelineEvent[]): Promise<void> {
        const recipeIds: string[] = [];
        events.forEach(event => {
            if (!recipeIds.includes(event.recipeId) && !this.recipes.has(event.recipeId)) {
                recipeIds.push(event.recipeId);
            }
        });

        const results = await this.getRecipes(recipeIds);
        results.forEach(result => {
            if (result?.id) {
                this.recipes.set(result.id, result);
            }
        });
    }

    private async scrollTimelineEvents(): Promise<void> {
        const orderBy = 'timestamp';
        const orderDirection = this.preferences.orderDirection === 'asc' ? 'asc' : 'desc';
        const eventTypeValue = `["${this.preferences.types.join('", "')}"]`;
        const queryFilter = `(${this.queryFilter}) AND eventType IN ${eventTypeValue}`;

        try {
            // In a real app, you'd call the backend API
            // const response = await this.recipeService.getAllTimelineEvents(
            //   this.page, this.perPage, { orderBy, orderDirection, queryFilter }
            // );

            // Simulate API response
            const events: RecipeTimelineEvent[] = [];

            this.page += 1;
            if (events.length < this.perPage) {
                this.hasMore = false;
                if (!events.length) return;
            }

            if (this.showRecipeCards) {
                await this.updateRecipes(events);
            }

            this.timelineEvents.push(...events);
        } catch (error) {
            console.error('Failed to load timeline events:', error);
        }
    }

    private async initializeTimelineEvents(): Promise<void> {
        this.loading = true;
        this.ready = false;

        this.page = 1;
        this.hasMore = true;
        this.timelineEvents = [];
        await this.scrollTimelineEvents();

        this.ready = true;
        this.loading = false;
    }

    private setupScrollHandler(): void {
        this.scrollHandler = () => {
            const timelineContainerElement = document.getElementById('timeline-container');
            if (timelineContainerElement) {
                const { clientHeight, scrollHeight } = timelineContainerElement;
                if (scrollHeight > clientHeight) {
                    return;
                }
            }

            const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight >=
                document.documentElement.offsetHeight - (window.innerHeight * 4);

            if (bottomOfWindow && this.hasMore && !this.loading) {
                this.loading = true;
                this.scrollTimelineEvents().finally(() => {
                    this.loading = false;
                });
            }
        };

        document.addEventListener('scroll', this.scrollHandler);
    }
} 