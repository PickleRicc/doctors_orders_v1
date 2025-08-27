import React from 'react';
import { TemplateTestMode } from '../../components/testing/TemplateTestMode';

/**
 * Test Page for Template Hook System
 * 
 * Navigate to /test/template-hooks to access this comprehensive testing interface.
 * This page allows you to test the entire new template hook system before running
 * the final database migration.
 * 
 * Features:
 * - Test all 6 template types with realistic sample transcripts
 * - Verify AI generation works correctly
 * - Test the unified SOAP editor interface
 * - Test export functionality (PDF and clipboard)
 * - Run comprehensive test suite across all templates
 * 
 * Use this to ensure everything works perfectly before removing the old template system.
 */

export default function TemplateHooksTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-grey-50">
      <TemplateTestMode />
    </div>
  );
}
