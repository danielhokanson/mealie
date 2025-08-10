import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';

export interface ReportSummary {
    id: string;
    category: string;
    name: string;
    timestamp: string;
    status: string;
}

@Component({
    selector: 'app-report-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatSortModule,
        MatPaginatorModule
    ],
    templateUrl: './report-table.component.html',
    styleUrls: ['./report-table.component.scss']
})
export class ReportTableComponent {
    @Input() items: ReportSummary[] = [];

    @Output() delete = new EventEmitter<string>();

    displayedColumns: string[] = ['category', 'name', 'timestamp', 'status', 'actions'];

    constructor(private router: Router) { }

    onRowClick(item: ReportSummary): void {
        if (item.status === 'in-progress') {
            return;
        }
        this.router.navigate([`/group/reports/${item.id}`]);
    }

    onDelete(id: string): void {
        this.delete.emit(id);
    }

    capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatDate(timestamp: string): string {
        return new Date(timestamp).toLocaleDateString();
    }
} 