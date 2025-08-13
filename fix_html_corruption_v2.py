#!/usr/bin/env python3
"""
Enhanced script to fix HTML corruption patterns from the changeset.
This version handles more complex patterns and nested tags.
"""

import os
import re
import glob
from pathlib import Path

def balance_tags(content):
    """Balance opening and closing tags in content."""
    
    # Track tag stack to ensure proper nesting
    tag_patterns = [
        # mat-icon tags that are often corrupted
        (r'<mat-icon([^>]*)>([^<]*)\n\s*</mat-icon>', r'<mat-icon\1>\2</mat-icon>'),
        
        # Fix double mat-icon closing tags
        (r'<mat-icon([^>]*)>([^<]*)</mat-icon>\s*</mat-icon>', r'<mat-icon\1>\2</mat-icon>'),
        
        # Fix mat-card-content tags
        (r'<mat-card-content([^>]*)>\s*</mat-card-content>\s*</mat-card-content>', r'<mat-card-content\1></mat-card-content>'),
        
        # Fix button tags with wrong closing
        (r'<button([^>]*)>((?:(?!</button>).)*?)</button>\s*</button>', r'<button\1>\2</button>'),
        
        # Fix td tags
        (r'<td([^>]*)>((?:(?!</td>).)*?)</td>\s*</td>', r'<td\1>\2</td>'),
        
        # Remove orphaned closing tags
        (r'^\s*</mat-icon>\s*$', ''),
        (r'^\s*</mat-card-content>\s*$', ''),
        (r'^\s*</div>\s*$', ''),
        (r'^\s*</button>\s*$', ''),
        (r'^\s*</td>\s*$', ''),
    ]
    
    for pattern, replacement in tag_patterns:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
    
    return content

def fix_specific_patterns(content):
    """Fix specific known corruption patterns."""
    
    # Fix patterns where mat-icon is not closed properly
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check for mat-icon opening without proper closing
        if '<mat-icon' in line and '</mat-icon>' not in line:
            # Look ahead for content and closing
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                # If next line is just icon text, combine
                if next_line and not next_line.startswith('<') and not next_line.startswith('</'):
                    if i + 2 < len(lines) and lines[i + 2].strip().startswith('</'):
                        # Combine the three lines
                        fixed_line = line + next_line + '</mat-icon>'
                        fixed_lines.append(fixed_line)
                        i += 3
                        continue
        
        # Check for orphaned closing tags at start of line
        if line.strip().startswith('</') and not line.strip().startswith('</ng-'):
            # Check if this might be an orphaned tag
            tag_name = re.match(r'</([^>]+)>', line.strip())
            if tag_name:
                tag = tag_name.group(1)
                # Look back to see if there's an unclosed opening tag
                found_opening = False
                for j in range(len(fixed_lines) - 1, max(0, len(fixed_lines) - 10), -1):
                    if f'<{tag}' in fixed_lines[j] and f'</{tag}>' not in fixed_lines[j]:
                        # Found potential unclosed tag, append closing to that line
                        fixed_lines[j] = fixed_lines[j].rstrip() + f'</{tag}>'
                        found_opening = True
                        i += 1
                        break
                
                if found_opening:
                    continue
        
        fixed_lines.append(line)
        i += 1
    
    return '\n'.join(fixed_lines)

def validate_and_fix_structure(content):
    """Validate and fix overall HTML structure."""
    
    # Ensure all self-closing app- components are properly closed
    content = re.sub(r'<(app-[^/>\s]+)([^>]*)>\s*(?!</\1>)', r'<\1\2></\1>', content)
    
    # Fix mat-card structure
    content = re.sub(r'<mat-card([^>]*)>\s*<mat-card-header([^>]*)>\s*</mat-card-header>\s*</mat-card-header>', 
                     r'<mat-card\1>\n  <mat-card-header\2></mat-card-header>', content)
    
    # Fix mat-card-content duplicates
    content = re.sub(r'</mat-card-content>\s*</mat-card-content>', r'</mat-card-content>', content)
    
    # Fix table structure
    content = re.sub(r'</td>\s*</td>', r'</td>', content)
    content = re.sub(r'</tr>\s*</tr>', r'</tr>', content)
    
    return content

def fix_html_file_enhanced(filepath):
    """Enhanced fix for HTML corruption patterns."""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Apply fixes in order
    content = balance_tags(content)
    content = fix_specific_patterns(content)
    content = validate_and_fix_structure(content)
    
    # Final cleanup - remove multiple blank lines
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Main function to process all Angular component HTML files."""
    
    # Find all component HTML files
    component_files = glob.glob('/workspace/mealie-angular/src/app/**/*.component.html', recursive=True)
    
    print(f"Found {len(component_files)} component HTML files")
    print("Running enhanced fixes...")
    
    fixed_files = []
    for filepath in component_files:
        if fix_html_file_enhanced(filepath):
            fixed_files.append(filepath)
            print(f"Fixed: {Path(filepath).name}")
    
    print(f"\nFixed {len(fixed_files)} files")
    
    if fixed_files:
        print("\nFiles fixed:")
        for f in fixed_files:
            rel_path = Path(f).relative_to('/workspace/mealie-angular/src/app')
            print(f"  - {rel_path}")

if __name__ == "__main__":
    main()