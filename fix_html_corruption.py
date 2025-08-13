#!/usr/bin/env python3
"""
Script to fix common HTML corruption patterns from the changeset.
This script identifies and fixes misplaced closing tags in Angular component HTML files.
"""

import os
import re
import glob
from pathlib import Path

def fix_html_file(filepath):
    """Fix common HTML corruption patterns in a file."""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    fixes_made = []
    
    # Common patterns to fix:
    # 1. Button tags closed with </div> instead of </button>
    content = re.sub(r'(<button[^>]*>(?:(?!</button>).)*?)</div>', r'\1</button>', content, flags=re.DOTALL)
    
    # 2. mat-icon tags not properly closed
    content = re.sub(r'(<mat-icon[^>]*>(?:(?!</mat-icon>).)*?)\n\s*</div>', r'\1</mat-icon>', content, flags=re.DOTALL)
    content = re.sub(r'(<mat-icon[^>]*>(?:(?!</mat-icon>).)*?)\n\s*</mat-icon>', r'\1</mat-icon>', content, flags=re.DOTALL)
    
    # 3. mat-form-field not properly closed
    content = re.sub(r'(</textarea>)\s*</mat-form-field>', r'\1\n      </mat-form-field>', content)
    
    # 4. Fix mat-chip tags
    content = re.sub(r'(<mat-chip[^>]*>(?:(?!</mat-chip>).)*?)\n\s*<mat-chip', r'\1</mat-chip>\n    <mat-chip', content, flags=re.DOTALL)
    
    # 5. Fix app- component tags
    content = re.sub(r'(<app-[^>]*>)\s*</div>', r'\1</\1>', content)
    content = re.sub(r'(<app-[^/>]*[^/]>)\s*\n', r'\1</\1>\n', content)
    
    # 6. Fix mat-list-item tags
    content = re.sub(r'(<mat-list-item[^>]*>(?:(?!</mat-list-item>).)*?)\n\s*</mat-list>', r'\1</mat-list-item>\n    </mat-list>', content, flags=re.DOTALL)
    
    # 7. Fix self-closing component tags
    for match in re.finditer(r'<(app-[^>\s]+)([^>]*)>\s*$', content, re.MULTILINE):
        tag_name = match.group(1)
        attrs = match.group(2)
        if not attrs.endswith('/'):
            old_tag = match.group(0)
            new_tag = f'<{tag_name}{attrs}></{tag_name}>'
            content = content.replace(old_tag, new_tag)
    
    # 8. Fix mat-menu related tags
    content = re.sub(r'</mat-menu>\s*</button>', r'</button>\n  </mat-menu>', content)
    
    # 9. Fix mat-card related tags  
    content = re.sub(r'class="card">([^<]*)</mat-card', r'>\1</mat-card', content)
    
    # 10. Remove duplicate class attributes
    content = re.sub(r'class="([^"]*)"([^>]*)class="([^"]*)"', r'class="\1 \3"\2', content)
    
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
    
    fixed_files = []
    for filepath in component_files:
        if fix_html_file(filepath):
            fixed_files.append(filepath)
            print(f"Fixed: {Path(filepath).name}")
    
    print(f"\nFixed {len(fixed_files)} files")
    
    if fixed_files:
        print("\nFiles fixed:")
        for f in fixed_files:
            print(f"  - {Path(f).relative_to('/workspace/mealie-angular/src/app')}")

if __name__ == "__main__":
    main()