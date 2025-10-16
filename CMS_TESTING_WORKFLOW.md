# CMS Testing Workflow

## Overview
This document outlines the testing workflow between each CMS implementation step to ensure proper deployment and testing.

## Workflow Steps

### 1. After Each Implementation Step

```bash
# 1. Commit the current work
./scripts/commit-cms-step.sh "Phase X.Y: Description"

# 2. Test the implementation
./scripts/test-cms-step.sh
```

### 2. Testing Script Actions

The `test-cms-step.sh` script will:

1. **Kill all development servers**
   - `pkill -f "vite"`
   - `pkill -f "npm run start"`
   - `npm run db:stop`

2. **Redeploy Supabase**
   - Check if Supabase is running
   - If not: `npm run db:reset`
   - If running: `npm run db:generate`

3. **Check for errors**
   - Run linting checks
   - Build the project to catch compilation errors

4. **Start development server**
   - `npm start`
   - Provides URLs for testing

### 3. Testing URLs

When the development server starts, test these URLs:

- **Public site**: http://localhost:3000
- **Admin panel**: http://localhost:3000/manage
- **CMS Assets**: http://localhost:3000/manage/cms/assets
- **CMS Pages**: http://localhost:3000/manage/cms/pages
- **CMS Blocks**: http://localhost:3000/manage/cms/blocks
- **CMS Menus**: http://localhost:3000/manage/cms/menus

### 4. What to Test

For each implementation step, test:

#### Phase 1.1: Asset Upload (Basic) ✅
- [x] Drag and drop file upload
- [x] File selection via button
- [x] Multiple file upload
- [x] Grid/list view toggle
- [x] Asset filtering by type
- [x] Asset search
- [x] Asset deletion
- [x] Pagination (if many assets)

#### Phase 1.2: Asset Variants Generation (Next)
- [ ] Automatic thumbnail generation
- [ ] Multiple size variants (small, medium, large)
- [ ] Variant display in asset list
- [ ] Variant selection in asset picker

#### Phase 1.3: Asset Optimization (Future)
- [ ] Image compression
- [ ] WebP conversion
- [ ] File size validation
- [ ] Optimization stats display

#### Phase 1.4: Asset Editing (Future)
- [ ] Image crop functionality
- [ ] Image resize functionality
- [ ] Image rotate functionality
- [ ] Version management for edits

### 5. Troubleshooting

If something doesn't work:

1. **Check Supabase status**:
   ```bash
   npm run db:ensure
   ```

2. **Reset database**:
   ```bash
   npm run db:reset
   ```

3. **Check logs**:
   ```bash
   npm run db:logs
   ```

4. **Verify storage bucket**:
   - Check if `cms-assets` bucket exists in Supabase Storage
   - Verify RLS policies are set up

### 6. Git Workflow

```bash
# After testing and confirming everything works:
git add .
git commit -m "feat(cms): Phase X.Y: Description - tested and working"
git push origin feature/cms-implementation
```

## Current Status

- ✅ **Phase 1.1**: Asset Upload (Basic) - COMPLETED & TESTED
- 🔄 **Phase 1.2**: Asset Variants Generation - IN PROGRESS
- ⏳ **Phase 1.3**: Asset Optimization - PENDING
- ⏳ **Phase 1.4**: Asset Editing - PENDING

## Next Steps

1. Test Phase 1.1 implementation
2. Start Phase 1.2: Asset Variants Generation
3. Follow the same testing workflow
4. Continue incrementally through all phases
