#!/usr/bin/env python3
"""
Script to fix remaining HTML issues in Angular components.
Focuses on detecting and fixing malformed self-closing tags and duplicate closings.
"""

import os
import re
import glob
from pathlib import Path

def fix_malformed_tags(content):
    """Fix malformed and duplicate closing tags."""
    
    # Fix malformed self-closing component tags (e.g., <app-something></app-somethin>)
    pattern = r'<(app-[a-z-]+)></\1[a-z]*>'
    content = re.sub(pattern, r'<\1></\1>', content)
    
    # Fix button tags that aren't closed properly
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Fix unclosed button tags
        if '<button' in line and '</button>' not in line:
            # Look for button content in next few lines
            button_content = []
            j = i + 1
            found_closing = False
            
            while j < min(i + 10, len(lines)):
                next_line = lines[j]
                if '</button>' in next_line or '<button' in next_line:
                    found_closing = '</button>' in next_line
                    break
                if next_line.strip() and not next_line.strip().startswith('</'):
                    button_content.append(next_line.strip())
                j += 1
            
            if not found_closing and button_content:
                # Reconstruct the button with proper closing
                fixed_line = line
                if button_content:
                    fixed_line += ' '.join(button_content) + '</button>'
                fixed_lines.append(fixed_line)
                i = j
                continue
        
        # Fix unclosed mat-icon tags
        if '<mat-icon' in line and '</mat-icon>' not in line:
            if '>' in line:
                # Extract icon name from next line if present
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line and not next_line.startswith('<'):
                        fixed_line = line.rstrip() + next_line + '</mat-icon>'
                        fixed_lines.append(fixed_line)
                        i += 2
                        continue
        
        fixed_lines.append(line)
        i += 1
    
    return '\n'.join(fixed_lines)

def fix_nested_forms(content):
    """Fix nested form and tab issues."""
    
    # Remove duplicate </mat-tab> closings
    content = re.sub(r'(</mat-tab>\s*){2,}', '</mat-tab>\n', content)
    
    # Remove duplicate </form> closings
    content = re.sub(r'(</form>\s*){2,}', '</form>\n', content)
    
    # Fix orphaned </mat-tab> without opening
    lines = content.split('\n')
    tab_count = 0
    fixed_lines = []
    
    for line in lines:
        if '<mat-tab' in line and not '</mat-tab>' in line:
            tab_count += 1
        elif '</mat-tab>' in line:
            if tab_count > 0:
                tab_count -= 1
                fixed_lines.append(line)
            else:
                # Orphaned closing tag, skip it
                continue
        else:
            fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_template_issues(content):
    """Fix ng-template and structural directive issues."""
    
    # Fix ng-template with 'else' references
    # Remove orphaned ng-template references that don't exist
    if 'else loadingTemplate' in content and '<ng-template #loadingTemplate>' not in content:
        content = content.replace('; else loadingTemplate', '')
    
    # Fix malformed ng-template blocks
    content = re.sub(r'<ng-template #(\w+)>\s*</ng-template>', '', content)
    
    return content

def validate_component_structure(content):
    """Validate and fix overall component structure."""
    
    # Ensure all components have matching open/close tags
    component_pattern = r'<(app-[a-z-]+|mat-[a-z-]+)'
    
    # Track opening tags
    stack = []
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Check for opening tags
        opening_matches = re.findall(r'<([a-z-]+(?:-[a-z-]+)*)[^/>]*(?<!/)>', line)
        for tag in opening_matches:
            if not tag.startswith('ng-') and tag not in ['br', 'hr', 'img', 'input']:
                stack.append(tag)
        
        # Check for closing tags
        closing_matches = re.findall(r'</([a-z-]+(?:-[a-z-]+)*)>', line)
        for tag in closing_matches:
            if stack and stack[-1] == tag:
                stack.pop()
            elif stack and tag in stack:
                # Tag is being closed out of order, fix it
                while stack and stack[-1] != tag:
                    fixed_lines.append(f'</{stack.pop()}>')
                if stack:
                    stack.pop()
        
        fixed_lines.append(line)
    
    # Close any remaining unclosed tags
    while stack:
        fixed_lines.append(f'</{stack.pop()}>')
    
    return '\n'.join(fixed_lines)

def fix_html_file_final(filepath):
    """Final comprehensive fix for HTML files."""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Apply all fixes
    content = fix_malformed_tags(content)
    content = fix_nested_forms(content)
    content = fix_template_issues(content)
    # Commenting out validate_component_structure as it might cause issues
    # content = validate_component_structure(content)
    
    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Main function to process problematic files."""
    
    # List of files that are known to have issues
    problem_files = [
        '/workspace/mealie-angular/src/app/features/user/pages/user-settings/user-settings.component.html',
        '/workspace/mealie-angular/src/app/features/user/pages/user-profile/user-profile.component.html',
        '/workspace/mealie-angular/src/app/features/recipes/pages/recipe-create/recipe-create.component.html',
        '/workspace/mealie-angular/src/app/features/recipes/pages/recipe-detail/recipe-detail.component.html',
        '/workspace/mealie-angular/src/app/features/recipes/pages/recipe-edit/recipe-edit.component.html',
        '/workspace/mealie-angular/src/app/features/recipes/pages/recipe-favorites/recipe-favorites.component.html',
        '/workspace/mealie-angular/src/app/features/shopping-lists/pages/shopping-list-create/shopping-list-create.component.html',
        '/workspace/mealie-angular/src/app/features/shopping-lists/pages/shopping-list-detail/shopping-list-detail.component.html',
    ]
    
    # Also process all component files
    all_files = glob.glob('/workspace/mealie-angular/src/app/**/*.component.html', recursive=True)
    
    print(f"Processing {len(all_files)} component files...")
    
    fixed_files = []
    for filepath in all_files:
        if os.path.exists(filepath):
            if fix_html_file_final(filepath):
                fixed_files.append(filepath)
                print(f"Fixed: {Path(filepath).name}")
    
    print(f"\nFixed {len(fixed_files)} files")
    
    if fixed_files:
        print("\nFiles fixed:")
        for f in fixed_files[:20]:  # Show first 20
            rel_path = Path(f).relative_to('/workspace/mealie-angular/src/app')
            print(f"  - {rel_path}")
        if len(fixed_files) > 20:
            print(f"  ... and {len(fixed_files) - 20} more")

if __name__ == "__main__":
    main()