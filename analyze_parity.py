#!/usr/bin/env python3
"""
Functional Parity Analysis Script for meALIE Frontend Migration

This script analyzes the Vue.js frontend components against the Angular application
to determine functional parity and mark deprecated files accordingly.
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple

class ParityAnalyzer:
    def __init__(self, workspace_path: str):
        self.workspace_path = Path(workspace_path)
        self.frontend_path = self.workspace_path / "frontend"
        self.angular_path = self.workspace_path / "mealie-angular"
        
        # Track analysis results
        self.deprecated_files: Set[str] = set()
        self.partial_parity_files: Set[str] = set()
        self.no_parity_files: Set[str] = set()
        
        # Component mapping analysis
        self.component_mapping = {
            # Recipe components with full parity
            "RecipeCard.vue": "mealie-angular/src/app/features/recipes/components/recipe-card/",
            "RecipeRating.vue": "mealie-angular/src/app/features/recipes/components/recipe-rating/",
            
            # Shopping list components with full parity
            "ShoppingListItemEditor.vue": "mealie-angular/src/app/features/shopping-lists/components/shopping-list-item-editor/",
            
            # Admin components with full parity
            "admin-manage": "mealie-angular/src/app/features/admin/pages/admin-manage/",
            
            # Components with partial parity
            "QueryFilterBuilder.vue": "mealie-angular/src/app/features/recipes/components/search-filter/",
            
            # Components with no parity
            "DefaultLayout.vue": "mealie-angular/src/app/app.component.html",
        }
    
    def analyze_component_parity(self, vue_file: Path) -> str:
        """Analyze functional parity for a single component."""
        filename = vue_file.name
        
        if filename in self.component_mapping:
            angular_path = self.component_mapping[filename]
            if self._has_full_parity(vue_file, angular_path):
                return "full"
            elif self._has_partial_parity(vue_file, angular_path):
                return "partial"
            else:
                return "none"
        
        # Default analysis based on file type and location
        return self._default_parity_analysis(vue_file)
    
    def _has_full_parity(self, vue_file: Path, angular_path: str) -> bool:
        """Check if Angular implementation has full functional parity."""
        angular_full_path = self.workspace_path / angular_path
        
        if not angular_full_path.exists():
            return False
        
        # Check if Angular component has comprehensive implementation
        if angular_full_path.is_dir():
            component_files = list(angular_full_path.glob("*.component.*"))
            return len(component_files) >= 2  # At least TS and HTML files
        
        return False
    
    def _has_partial_parity(self, vue_file: Path, angular_path: str) -> bool:
        """Check if Angular implementation has partial functional parity."""
        angular_full_path = self.workspace_path / angular_path
        
        if not angular_full_path.exists():
            return False
        
        # Check if Angular has basic implementation
        if angular_full_path.is_dir():
            component_files = list(angular_full_path.glob("*.component.*"))
            return len(component_files) >= 1  # At least one component file
        
        return False
    
    def _default_parity_analysis(self, vue_file: Path) -> str:
        """Default parity analysis based on file characteristics."""
        filename = vue_file.name
        
        # Check if it's a page component
        if "pages" in str(vue_file):
            return self._analyze_page_parity(vue_file)
        
        # Check if it's a domain component
        if "Domain" in str(vue_file):
            return self._analyze_domain_component_parity(vue_file)
        
        # Check if it's a layout component
        if "Layout" in str(vue_file):
            return self._analyze_layout_parity(vue_file)
        
        return "unknown"
    
    def _analyze_page_parity(self, vue_file: Path) -> str:
        """Analyze parity for page components."""
        filename = vue_file.name
        page_name = filename.replace(".vue", "")
        
        # Check if Angular has corresponding page
        angular_pages = list(self.angular_path.rglob(f"*{page_name}*"))
        
        if angular_pages:
            return "full" if len(angular_pages) >= 2 else "partial"
        
        return "none"
    
    def _analyze_domain_component_parity(self, vue_file: Path) -> str:
        """Analyze parity for domain components."""
        filename = vue_file.name
        component_name = filename.replace(".vue", "")
        
        # Check if Angular has corresponding component
        angular_components = list(self.angular_path.rglob(f"*{component_name}*"))
        
        if angular_components:
            return "full" if len(angular_components) >= 2 else "partial"
        
        return "none"
    
    def _analyze_layout_parity(self, vue_file: Path) -> str:
        """Analyze parity for layout components."""
        # Layout components typically have complex functionality
        # Check if Angular has equivalent layout structure
        angular_app_component = self.angular_path / "src/app/app.component.html"
        
        if angular_app_component.exists():
            return "partial"  # Basic layout exists but may lack advanced features
        
        return "none"
    
    def scan_and_analyze(self):
        """Scan all Vue files and analyze parity."""
        print("🔍 Scanning Vue.js frontend for functional parity analysis...")
        
        # Scan all Vue files
        vue_files = list(self.frontend_path.rglob("*.vue"))
        
        for vue_file in vue_files:
            relative_path = vue_file.relative_to(self.workspace_path)
            parity = self.analyze_component_parity(vue_file)
            
            if parity == "full":
                self.deprecated_files.add(str(relative_path))
                print(f"✅ {relative_path} - FULL PARITY (mark as deprecated)")
            elif parity == "partial":
                self.partial_parity_files.add(str(relative_path))
                print(f"⚠️  {relative_path} - PARTIAL PARITY")
            elif parity == "none":
                self.no_parity_files.add(str(relative_path))
                print(f"❌ {relative_path} - NO PARITY")
            else:
                print(f"❓ {relative_path} - UNKNOWN PARITY")
    
    def generate_report(self):
        """Generate comprehensive parity analysis report."""
        report = {
            "summary": {
                "total_vue_files": len(self.deprecated_files) + len(self.partial_parity_files) + len(self.no_parity_files),
                "full_parity": len(self.deprecated_files),
                "partial_parity": len(self.partial_parity_files),
                "no_parity": len(self.no_parity_files)
            },
            "deprecated_files": sorted(list(self.deprecated_files)),
            "partial_parity_files": sorted(list(self.partial_parity_files)),
            "no_parity_files": sorted(list(self.no_parity_files))
        }
        
        print("\n" + "="*80)
        print("📊 FUNCTIONAL PARITY ANALYSIS REPORT")
        print("="*80)
        print(f"Total Vue.js files analyzed: {report['summary']['total_vue_files']}")
        print(f"Full parity (can be deprecated): {report['summary']['full_parity']}")
        print(f"Partial parity: {report['summary']['partial_parity']}")
        print(f"No parity: {report['summary']['no_parity']}")
        
        print("\n" + "="*80)
        print("✅ FILES WITH FULL PARITY (MARK AS DEPRECATED)")
        print("="*80)
        for file in report['deprecated_files']:
            print(f"  {file}")
        
        print("\n" + "="*80)
        print("⚠️  FILES WITH PARTIAL PARITY")
        print("="*80)
        for file in report['partial_parity_files']:
            print(f"  {file}")
        
        print("\n" + "="*80)
        print("❌ FILES WITH NO PARITY")
        print("="*80)
        for file in report['no_parity_files']:
            print(f"  {file}")
        
        # Save report to file
        report_file = self.workspace_path / "parity_analysis_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: {report_file}")
        
        return report

def main():
    workspace_path = "/home/dhokanson/Dev/mealie"
    analyzer = ParityAnalyzer(workspace_path)
    
    try:
        analyzer.scan_and_analyze()
        analyzer.generate_report()
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
