# Custom Templates User Guide

## Overview

Custom Templates allow you to create personalized SOAP note templates tailored to your specific documentation needs. This feature gives you full control over the structure and content of your physical therapy documentation.

## Accessing Custom Templates

### Navigation
1. Click **"My Templates"** in the sidebar
2. Or navigate to `/templates` in your browser

## Creating a Custom Template

### Step 1: Click "Create New Template"
From the Custom Templates page, click the blue "Create New Template" button.

### Step 2: Fill in Basic Information

#### Required Fields
- **Template Name**: A descriptive name for your template (e.g., "Post-Surgical Knee Protocol")
- **Template Type**: A unique identifier (e.g., "custom-knee-postsurgical")

#### Optional Fields
- **Body Region**: Select the primary body region (knee, shoulder, back, etc.)
- **Session Type**: Choose the session type (evaluation, daily-note, progress, discharge)
- **Description**: Brief description of when to use this template

### Step 3: Configure SOAP Sections

#### Subjective Section
Add fields to capture patient-reported information:
- Click "+ Add Field"
- Enter field label (e.g., "Chief Complaint", "Surgery Date", "Pain Level")
- Select field type:
  - **Text**: Short text input
  - **Long Text**: Multiline text area
  - **Number**: Numeric input
  - **Date**: Date picker

**Example Subjective Fields:**
```
- Chief Complaint (Text)
- Surgery Date (Date)
- Pain Level 0-10 (Number)
- Functional Goals (Long Text)
```

#### Objective Section
Add measurements and observations:
- Click "+ Add Measurement"
- Enter measurement label (e.g., "ROM - Flexion", "Quad Strength")
- Specify unit if applicable (e.g., "degrees", "lbs")
- Select measurement type

**Example Objective Measurements:**
```
- ROM - Flexion (degrees)
- ROM - Extension (degrees)
- Quad Strength (scale 0-5)
- Gait Pattern (Text)
- Swelling Assessment (Text)
```

#### Assessment Section
Add prompts to guide your clinical assessment:
- Click "+ Add Prompt"
- Enter assessment question or prompt

**Example Assessment Prompts:**
```
- Progress since last visit
- Functional limitations
- Response to treatment
- Readiness for discharge
```

#### Plan Section
Add sections for your treatment plan:
- Click "+ Add Section"
- Enter section label

**Example Plan Sections:**
```
- Exercise Program
- Modalities
- Treatment Frequency
- Home Exercise Program
- Goals for Next Visit
```

### Step 4: Save Template
Click "Save Template" to create your custom template.

## Using a Custom Template

### During Session Creation

1. **Select Template**: On the main page, scroll to "My Custom Templates" section
2. **Click Your Template**: Your custom templates appear below system templates
3. **Record Session**: Proceed with recording as usual
4. **AI Generation**: The AI will generate a SOAP note following your custom structure

### Custom Template Features
- **Favorite Star**: Mark frequently-used templates as favorites
- **Visual Distinction**: Custom templates show a file icon and different styling
- **Usage Tracking**: See how many times you've used each template

## Managing Custom Templates

### Editing Templates
1. Go to "My Templates"
2. Click "Edit" on any template card
3. Make your changes
4. Click "Save Template"

### Duplicating Templates
1. Click the **Copy** icon on a template card
2. A duplicate will be created with "(Copy)" appended to the name
3. Edit the duplicate as needed

### Deleting Templates
1. Click the **Trash** icon on a template card
2. Confirm deletion in the popup
3. Template will be permanently removed

### Favoriting Templates
1. Click the **Star** icon on a template card (list view or selector)
2. Favorites appear first in the list
3. Click again to remove from favorites

## Best Practices

### Template Naming
- Use descriptive names: ✅ "Post-ACL Reconstruction Protocol"
- Avoid generic names: ❌ "Template 1"

### Field Design
- **Be Specific**: "Pain Level (0-10 scale)" vs "Pain"
- **Use Appropriate Types**: Number fields for measurements, dates for surgery dates
- **Logical Order**: Organize fields in the order you typically document

### Assessment Prompts
- Ask specific questions: "Has patient met short-term goals?"
- Guide clinical reasoning: "What are barriers to progress?"
- Ensure compliance: "Are there safety concerns?"

### Plan Sections
- Break down into categories: Exercises, Modalities, Education
- Include goals: "Short-term goals", "Long-term goals"
- Add frequency: "Treatment frequency and duration"

## Example: Post-Surgical Knee Template

```
Name: Post-Surgical Knee Protocol
Type: custom-knee-postsurgical
Region: knee
Session: evaluation

SUBJECTIVE:
- Chief Complaint (Text)
- Surgery Date (Date)
- Surgery Type (Text)
- Pain Level at Rest (Number)
- Pain Level with Activity (Number)
- Current Medications (Long Text)

OBJECTIVE:
- ROM - Flexion Active (degrees)
- ROM - Extension Active (degrees)
- ROM - Flexion Passive (degrees)
- ROM - Extension Passive (degrees)
- Quad Strength (0-5 scale)
- Hamstring Strength (0-5 scale)
- Patellar Mobility (Text)
- Swelling (Text)
- Incision Status (Text)
- Weight-bearing Status (Text)

ASSESSMENT:
- Surgical timeline and healing status
- ROM compared to expected norms
- Strength deficits and compensations
- Functional limitations
- Readiness for next phase

PLAN:
- ROM Exercises
- Strengthening Exercises
- Modalities
- Gait Training
- Home Exercise Program
- Treatment Frequency
- Next Visit Goals
```

## Troubleshooting

### Template Not Appearing in Selector
- Refresh the page
- Check that you're logged in
- Verify template was saved successfully

### AI Not Following Template Structure
- Ensure all required fields are filled in
- Check that field labels are descriptive
- Verify template configuration is saved correctly

### Can't Edit Template
- Confirm you're the template owner
- Check your internet connection
- Try refreshing the page

## Tips for Success

1. **Start Simple**: Create a basic template first, then refine it based on use
2. **Test with Examples**: Try the "Try Example" feature on system templates to understand structure
3. **Iterate**: Edit templates based on what works in your practice
4. **Organize**: Use clear naming conventions for easy identification
5. **Share Workflow**: If working in a group practice, create templates for common protocols

## Future Features (Phase 2)

Coming soon:
- Custom AI prompt engineering
- Template sharing within organizations
- Template marketplace
- Advanced validation rules
- Template analytics and insights

## Support

For questions or issues with custom templates:
- Check this documentation
- Review example system templates
- Contact support at [support@doctorsorders.app]

---

**Last Updated**: January 18, 2025
**Version**: 1.0.0

