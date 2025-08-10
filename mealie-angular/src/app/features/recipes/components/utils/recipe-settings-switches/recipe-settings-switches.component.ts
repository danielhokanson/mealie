import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

export interface RecipeSettings {
    public?: boolean;
    showNutrition?: boolean;
    showAssets?: boolean;
    landscapeView?: boolean;
    disableComments?: boolean;
    disableAmount?: boolean;
    locked?: boolean;
}

@Component({
    selector: 'app-recipe-settings-switches',
    standalone: true,
    imports: [
        CommonModule,
        MatSlideToggleModule,
        FormsModule
    ],
    templateUrl: './recipe-settings-switches.component.html',
    styleUrls: ['./recipe-settings-switches.component.scss']
})
export class RecipeSettingsSwitchesComponent {
    @Input() value!: RecipeSettings;
    @Input() isOwner = false;

    @Output() valueChange = new EventEmitter<RecipeSettings>();

    labels: Record<keyof RecipeSettings, string> = {
        public: 'Public Recipe',
        showNutrition: 'Show Nutrition Values',
        showAssets: 'Show Assets',
        landscapeView: 'Landscape View (Coming Soon)',
        disableComments: 'Disable Comments',
        disableAmount: 'Disable Amount',
        locked: 'Locked'
    };

    get settingsKeys(): (keyof RecipeSettings)[] {
        return Object.keys(this.value) as (keyof RecipeSettings)[];
    }

    onSettingChange(key: keyof RecipeSettings, checked: boolean): void {
        const newSettings = { ...this.value };
        newSettings[key] = checked;
        this.valueChange.emit(newSettings);
    }

    isDisabled(key: keyof RecipeSettings): boolean {
        return key === 'locked' && !this.isOwner;
    }
} 