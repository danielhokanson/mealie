import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-safe-markdown',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './safe-markdown.component.html',
    styleUrls: ['./safe-markdown.component.scss']
})
export class SafeMarkdownComponent implements OnInit, OnDestroy {
    @Input() markdown: string = '';
    @Input() sanitize: boolean = true;
    @Input() allowHtml: boolean = false;
    @Input() highlightCode: boolean = true;

    @Output() linkClick = new EventEmitter<string>();

    sanitizedHtml: SafeHtml = '';
    private marked: any = null;

    constructor(private sanitizer: DomSanitizer) { }

    async ngOnInit(): Promise<void> {
        await this.loadMarked();
        this.parseMarkdown();
    }

    ngOnDestroy(): void {
        // Cleanup if needed
    }

    private async loadMarked(): Promise<void> {
        try {
            // In a real implementation, you would import marked
            // this.marked = await import('marked');
            // For now, we'll use a basic implementation
            this.marked = {
                parse: (text: string) => this.basicMarkdownParse(text)
            };
        } catch (error) {
            console.error('Failed to load marked library:', error);
        }
    }

    private parseMarkdown(): void {
        if (!this.markdown) {
            this.sanitizedHtml = '';
            return;
        }

        let html = '';

        if (this.marked) {
            html = this.marked.parse(this.markdown);
        } else {
            html = this.basicMarkdownParse(this.markdown);
        }

        if (this.sanitize) {
            html = this.sanitizeHtml(html);
        }

        this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }

    private basicMarkdownParse(text: string): string {
        // Basic markdown parsing implementation
        return text
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Lists
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    private sanitizeHtml(html: string): string {
        // Basic HTML sanitization
        const allowedTags = this.allowHtml ?
            ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'blockquote'] :
            ['p', 'br', 'strong', 'em', 'code', 'pre'];

        const allowedAttributes = ['href', 'target', 'rel'];

        // Remove all tags except allowed ones
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const sanitizeNode = (node: Node): void => {
            if (node.nodeType === Node.TEXT_NODE) {
                return;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const tagName = element.tagName.toLowerCase();

                if (!allowedTags.includes(tagName)) {
                    // Replace disallowed tags with their text content
                    const textContent = element.textContent || '';
                    const textNode = document.createTextNode(textContent);
                    element.parentNode?.replaceChild(textNode, element);
                    return;
                }

                // Remove disallowed attributes
                const attributes = Array.from(element.attributes);
                attributes.forEach(attr => {
                    if (!allowedAttributes.includes(attr.name)) {
                        element.removeAttribute(attr.name);
                    }
                });

                // Sanitize href attributes
                if (tagName === 'a' && element.hasAttribute('href')) {
                    const href = element.getAttribute('href') || '';
                    if (!href.startsWith('http://') && !href.startsWith('https://')) {
                        element.removeAttribute('href');
                    }
                }
            }

            // Recursively sanitize child nodes
            const children = Array.from(node.childNodes);
            children.forEach(child => sanitizeNode(child));
        };

        sanitizeNode(tempDiv);
        return tempDiv.innerHTML;
    }

    onLinkClick(event: Event): void {
        const target = event.target as HTMLAnchorElement;
        if (target.tagName === 'A' && target.href) {
            event.preventDefault();
            this.linkClick.emit(target.href);
        }
    }
} 