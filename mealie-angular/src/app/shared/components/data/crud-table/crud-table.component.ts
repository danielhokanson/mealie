import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../base-button/base-button.component';
import { BaseButtonGroupComponent } from '../base-button-group/base-button-group.component';
import { BaseOverflowButtonComponent } from '../base-overflow-button/base-overflow-button.component';

export interface TableConfig {
    hideColumns: boolean;
    canExport: boolean;
}

export interface TableHeaders {
    text: string;
    value: string;
    show: boolean;
    align?: string;
    sortable?: boolean;
    sort?: (a: any, b: any) => number;
}

export interface BulkAction {
    icon: string;
    text: string;
    event: string;
}

@Component({
    selector: 'app-crud-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatSortModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatMenuModule,
        MatCardModule,
        MatDividerModule,
        FormsModule,
        BaseButtonComponent,
        BaseButtonGroupComponent,
        BaseOverflowButtonComponent
    ],
    templateUrl: './crud-table.component.html',
    styleUrls: ['./crud-table.component.scss']
})
export class CrudTableComponent implements OnInit, OnDestroy {
    @Input() tableConfig: TableConfig = {
        hideColumns: false,
        canExport: false
    };
    @Input() headers: TableHeaders[] = [];
    @Input() data: any[] = [];
    @Input() bulkActions: BulkAction[] = [];
    @Input() initialSort: string = 'id';
    @Input() initialSortDesc: boolean = false;

    @Output() deleteOne = new EventEmitter<any>();
    @Output() editOne = new EventEmitter<any>();

    search: string = '';
    selected: any[] = [];
    localHeaders: TableHeaders[] = [];
    sortBy: Sort[] = [];

    ngOnInit(): void {
        this.localHeaders = [...this.headers];
        this.sortBy = [{
            active: this.initialSort,
            direction: this.initialSortDesc ? 'desc' : 'asc'
        }];
    }

    ngOnDestroy(): void {
        // Cleanup if needed
    }

    get filteredHeaders(): string[] {
        return this.localHeaders
            .filter(header => header.show)
            .map(header => header.value);
    }

    get headersWithoutActions(): TableHeaders[] {
        return this.localHeaders
            .filter(header => this.filteredHeaders.includes(header.value))
            .map(header => ({
                ...header,
                text: header.text // In a real app, this would be translated
            }));
    }

    get activeHeaders(): TableHeaders[] {
        return [
            ...this.headersWithoutActions,
            { text: '', value: 'actions', show: true, align: 'end' }
        ];
    }

    get filteredData(): any[] {
        if (!this.search) {
            return this.data;
        }
        return this.data.filter(item => {
            return Object.values(item).some(value =>
                value?.toString().toLowerCase().includes(this.search.toLowerCase())
            );
        });
    }

    onSelectionChange(selection: any[]): void {
        this.selected = selection;
    }

    onSortChange(sort: Sort): void {
        this.sortBy = [sort];
    }

    onPageChange(event: PageEvent): void {
        // Handle pagination if needed
    }

    onSearchChange(): void {
        // Search is handled by the filteredData getter
    }

    onHeaderVisibilityChange(header: TableHeaders, show: boolean): void {
        header.show = show;
    }

    onBulkAction(event: string): void {
        // Handle bulk actions
        console.log('Bulk action:', event, 'on items:', this.selected);
    }

    onEditItem(item: any): void {
        this.editOne.emit(item);
    }

    onDeleteItem(item: any): void {
        this.deleteOne.emit(item);
    }

    downloadAsJson(data: any[], filename: string): void {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    getBulkActionItems(): any[] {
        return this.bulkActions.map(action => ({
            icon: action.icon,
            text: action.text,
            event: action.event
        }));
    }

    trackByValue(index: number, item: any): any {
        return item.id || index;
    }

    // Selection methods
    selection = {
        selected: [] as any[],
        hasValue: () => this.selected.length > 0,
        isSelected: (item: any) => this.selected.includes(item),
        toggle: (item: any) => {
            const index = this.selected.indexOf(item);
            if (index > -1) {
                this.selected.splice(index, 1);
            } else {
                this.selected.push(item);
            }
        }
    };

    isAllSelected(): boolean {
        return this.selected.length === this.filteredData.length;
    }

    masterToggle(): void {
        if (this.isAllSelected()) {
            this.selected = [];
        } else {
            this.selected = [...this.filteredData];
        }
    }

    onActionClick(event: string, item: any): void {
        if (event === 'edit') {
            this.onEditItem(item);
        } else if (event === 'delete') {
            this.onDeleteItem(item);
        }
    }

    onRowClick(item: any): void {
        // Handle row click if needed
        console.log('Row clicked:', item);
    }
} 