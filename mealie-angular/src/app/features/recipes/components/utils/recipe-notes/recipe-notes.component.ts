import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';
import { BaseButtonComponent } from '../base-button/base-button.component';

export interface RecipeNote {
    id?: string;
    title: string;
    text: string;
    recipeId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

@Component({
    selector: 'app-recipe-notes',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        SafeMarkdownComponent,
        BaseButtonComponent
    ],
    templateUrl: './recipe-notes.component.html',
    styleUrls: ['./recipe-notes.component.scss']
})
export class RecipeNotesComponent {
    @Input() notes: RecipeNote[] = [];
    @Input() edit = true;
    @Input() recipeId = '';

    @Output() notesChange = new EventEmitter<RecipeNote[]>();

    notesForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.notesForm = this.fb.group({
            notes: this.fb.array([])
        });
    }

    get notesArray(): FormArray {
        return this.notesForm.get('notes') as FormArray;
    }

    ngOnInit(): void {
        this.initializeForm();
    }

    ngOnChanges(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        const notesArray = this.notesForm.get('notes') as FormArray;
        notesArray.clear();

        this.notes.forEach(note => {
            notesArray.push(this.createNoteFormGroup(note));
        });
    }

    private createNoteFormGroup(note: RecipeNote): FormGroup {
        return this.fb.group({
            id: [note.id || ''],
            title: [note.title, [Validators.required, Validators.maxLength(255)]],
            text: [note.text, [Validators.required, Validators.maxLength(5000)]]
        });
    }

    addNote(): void {
        const newNote: RecipeNote = {
            title: '',
            text: ''
        };

        this.notes = [...this.notes, newNote];
        this.notesChange.emit(this.notes);
        this.initializeForm();
    }

    removeNote(index: number): void {
        this.notes.splice(index, 1);
        this.notesChange.emit(this.notes);
        this.initializeForm();
    }

    updateNote(index: number, field: 'title' | 'text', value: string): void {
        if (this.notes[index]) {
            this.notes[index][field] = value;
            this.notesChange.emit(this.notes);
        }
    }

    saveNotes(): void {
        if (this.notesForm.valid) {
            const formValue = this.notesForm.value;
            this.notes = formValue.notes.map((note: any, index: number) => ({
                ...this.notes[index],
                ...note
            }));
            this.notesChange.emit(this.notes);
        }
    }

    getNoteFormGroup(index: number): FormGroup {
        return this.notesArray.at(index) as FormGroup;
    }

    getNoteTitleControl(index: number) {
        return this.getNoteFormGroup(index).get('title');
    }

    getNoteTextControl(index: number) {
        return this.getNoteFormGroup(index).get('text');
    }

    getFormErrors(control: any): string[] {
        if (!control || !control.errors || !control.touched) return [];

        const errors: string[] = [];

        if (control.errors['required']) {
            errors.push('This field is required');
        }

        if (control.errors['maxlength']) {
            const requiredLength = control.errors['maxlength'].requiredLength;
            errors.push(`Maximum length is ${requiredLength} characters`);
        }

        return errors;
    }
} 