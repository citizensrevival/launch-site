# Database Schema Validation Tests

This directory contains comprehensive unit tests that ensure TypeScript objects conform to the database schema and that all code references use the correct database object structures.

## Test Files

### 1. SimpleSchemaValidation.test.ts
- **Purpose**: Basic validation of database object structures
- **Tests**: 17 tests
- **Coverage**: Validates that all database objects have the correct structure, field types, and required fields

### 2. CodeAudit.test.ts
- **Purpose**: Comprehensive audit of database object structures
- **Tests**: 19 tests
- **Coverage**: Validates system_sites, leads_submissions, analytics_users, cms_pages, cms_blocks, cms_menus, cms_assets, system_user_permissions, and system_audit_log objects

### 3. CodeReferenceAudit.test.ts
- **Purpose**: Audits actual code references to ensure they use correct database structures
- **Tests**: 18 tests
- **Coverage**: Validates all table references found in the codebase use correct field names and structures

### 4. CmsSchemaValidation.test.ts
- **Purpose**: CMS-specific schema validation using Zod
- **Tests**: 17 tests
- **Coverage**: Validates CMS schemas match database types with proper validation

## Key Features

### Database Object Structure Validation
- ✅ Validates all required fields are present
- ✅ Validates field types are correct
- ✅ Validates enum values are valid
- ✅ Validates UUID format for ID fields
- ✅ Validates email format for leads
- ✅ Validates timestamp format

### Code Reference Validation
- ✅ Ensures all table references use correct field names
- ✅ Ensures no unnecessary type aliases are used
- ✅ Ensures consistent naming conventions
- ✅ Validates all required fields are present in code

### Data Integrity
- ✅ Validates UUID format: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- ✅ Validates email format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- ✅ Validates timestamp format: `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/`
- ✅ Validates enum values for status, asset kinds, and lead kinds

## Tables Covered

1. **system_sites** - Site configuration and settings
2. **leads_submissions** - Lead capture and form submissions
3. **analytics_users** - User analytics tracking
4. **analytics_sessions** - Session analytics
5. **analytics_pageviews** - Page view tracking
6. **analytics_events** - Event tracking
7. **cms_pages** - CMS page management
8. **cms_page_versions** - Page versioning
9. **cms_blocks** - Reusable content blocks
10. **cms_block_versions** - Block versioning
11. **cms_menus** - Navigation menus
12. **cms_menu_versions** - Menu versioning
13. **cms_assets** - Media and file assets
14. **cms_asset_versions** - Asset versioning
15. **system_user_permissions** - User permission management
16. **system_audit_log** - Audit trail logging

## Running Tests

```bash
# Run all database tests
npm test -- --run src/__tests__/database/

# Run specific test file
npm test -- --run src/__tests__/database/SimpleSchemaValidation.test.ts
```

## Test Results

All tests pass successfully:
- ✅ 71 tests passed
- ✅ 4 test files passed
- ✅ 0 failures

## Benefits

1. **Type Safety**: Ensures all database objects conform to the expected schema
2. **Code Consistency**: Validates that all code references use correct field names
3. **Data Integrity**: Validates data formats and constraints
4. **Maintainability**: Easy to identify when database changes break code
5. **Documentation**: Tests serve as living documentation of expected database structures
