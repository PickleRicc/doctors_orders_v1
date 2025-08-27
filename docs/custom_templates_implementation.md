# Custom Templates Implementation Plan

## Overview
This document outlines the planned implementation approach for allowing users to create custom templates in the PT SOAP Generator app.

## Selected Approach: Template Cloning (MVP)

We've decided to implement the Template Cloning approach as it provides the simplest path forward while still offering robust customization options to users.

### How It Will Work

1. **User Flow**:
   - User selects an existing template they want to customize
   - User clicks "Clone Template" button
   - System creates a copy of the template with all fields and structured_data
   - User can edit the template contents
   - System saves as a new custom template linked to the user's account

2. **Technical Implementation**:
   - Store custom templates in the same database table as default templates
   - Set `user_id` to the specific user who created the template
   - Set `is_default` to false for custom templates
   - Maintain the same structured_data JSON schema as default templates
   - Automatically extract and sync placeholders between text and structured_data

3. **UI Components Needed**:
   - Template selection interface showing both default and custom templates
   - Clone template button/action
   - Template editor interface for each SOAP section
   - Preview functionality to show how template will appear when used
   - Template management screen to list, edit, and delete custom templates

4. **Data Validation**:
   - Ensure placeholders in text match those in structured_data
   - Verify JSON structure integrity
   - Check for required fields (goals, patient education, next appointment)

### Future Enhancements

For future iterations, we may consider:

1. **Advanced Template Builder**:
   - Schema-based builder with drag-and-drop components
   - Specialized clinical section templates
   - Field type definitions (text, numeric, select, etc.)

2. **Template Sharing**:
   - Allow users to share templates with other users
   - Template marketplace or library

3. **Version Control**:
   - Track template revision history
   - Template versioning

## Conclusion

The Template Cloning approach provides a straightforward implementation path while still offering powerful customization. We'll revisit this plan after completing the reformatting of all default templates to ensure consistency across the system.
