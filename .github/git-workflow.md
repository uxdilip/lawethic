# Git Workflow Guide for LawEthic

## 📋 Current Changes Analysis

### Feature: Questionnaire System (MAJOR)
**Status**: Ready for new branch
**Impact**: High - New feature with API routes, UI components, database setup

**Changed Files**:
- Documentation: `.github/copilot-instructions.md`, `Trademark_Questionnaire.md`
- API Routes: `apps/web/app/api/questionnaires/[orderId]/route.ts`, `send/route.ts`, `submit/route.ts`
- Admin UI: `apps/web/app/admin/cases/[id]/page.tsx`, `components/admin/SendQuestionnaireButton.tsx`
- Customer UI: `apps/web/app/orders/[id]/page.tsx`, `components/customer/QuestionnaireForm.tsx`
- UI Components: `components/ui/alert.tsx`, `checkbox.tsx`, `radio-group.tsx`, `textarea.tsx`
- Data Layer: `data/questionnaires/index.ts`, `types.ts`, `trademark.ts`
- Config: `packages/appwrite/config.ts`, `apps/web/package.json`, `package-lock.json`
- Scripts: `scripts/setup-questionnaires.ts`

---

## 🚀 Recommended Branching Strategy

### 1. **Create Feature Branch NOW**
```bash
# Create and switch to new feature branch
git checkout -b feature/questionnaire-system

# Verify you're on the new branch
git branch --show-current
```

### 2. **Stage and Commit Changes Logically**

#### Commit 1: Database & Config Setup
```bash
git add packages/appwrite/config.ts
git add scripts/setup-questionnaires.ts
git commit -m "feat(questionnaires): add Appwrite collection config and setup script

- Add questionnaire_requests collection to config
- Create setup script for database initialization
- Configure permissions and indexes for questionnaire data"
```

#### Commit 2: Type Definitions & Data Layer
```bash
git add apps/web/data/questionnaires/
git commit -m "feat(questionnaires): implement questionnaire data layer and types

- Define QuestionnaireTemplate and QuestionField types
- Create trademark registration questionnaire template
- Add questionnaire registry with helper functions
- Support multiple field types (text, select, radio, checkbox, etc.)"
```

#### Commit 3: UI Components
```bash
git add apps/web/components/ui/alert.tsx
git add apps/web/components/ui/checkbox.tsx
git add apps/web/components/ui/radio-group.tsx
git add apps/web/components/ui/textarea.tsx
git add apps/web/package.json
git add package-lock.json
git commit -m "feat(ui): add form components for questionnaire system

- Add Alert component for notifications
- Add Checkbox and RadioGroup for multi-choice questions
- Add Textarea for long-form responses
- Install required Radix UI dependencies"
```

#### Commit 4: API Routes
```bash
git add apps/web/app/api/questionnaires/
git commit -m "feat(api): implement questionnaire API endpoints

- GET /api/questionnaires/[orderId] - Fetch questionnaires for order
- POST /api/questionnaires/send - Admin sends questionnaire to client
- POST /api/questionnaires/submit - Client submits completed questionnaire
- Add validation, notifications, and timeline updates"
```

#### Commit 5: Customer UI
```bash
git add apps/web/components/customer/QuestionnaireForm.tsx
git add apps/web/app/orders/[id]/page.tsx
git commit -m "feat(customer): add questionnaire form UI for customers

- Create dynamic form renderer with progress tracking
- Add questionnaires tab to order detail page
- Support all field types with validation
- Auto-switch to questionnaires tab when pending"
```

#### Commit 6: Admin UI
```bash
git add apps/web/components/admin/SendQuestionnaireButton.tsx
git add apps/web/app/admin/cases/[id]/page.tsx
git commit -m "feat(admin): add questionnaire management for operations team

- Create SendQuestionnaireButton component with template selection
- Add questionnaires tab to admin case detail page
- Display submitted responses in section-wise format
- Show pending/submitted status indicators"
```

#### Commit 7: Documentation
```bash
git add .github/copilot-instructions.md
git add Trademark_Questionnaire.md
git commit -m "docs: update documentation for questionnaire feature

- Update Copilot instructions with new patterns
- Add trademark questionnaire reference document
- Document questionnaire system architecture"
```

---

## 🎯 When to Create New Branches

### Create NEW Branch When:
1. **New Feature** - Any feature that takes >1 day or >5 commits
2. **Breaking Changes** - Changes that affect existing functionality
3. **Experimental Work** - Testing new approaches or libraries
4. **Multi-file Refactoring** - Large-scale code reorganization

### Stay on CURRENT Branch When:
1. **Bug Fixes** - Small, isolated fixes (1-2 files)
2. **Documentation** - README updates, comments
3. **Config Tweaks** - Environment variables, build settings
4. **Hotfixes** - Critical production fixes

---

## 🔄 Branch Lifecycle

### Feature Branch Pattern:
```
feature/<feature-name>     # New features
bugfix/<bug-description>   # Bug fixes
refactor/<refactor-scope>  # Code refactoring
chore/<task-description>   # Maintenance tasks
docs/<doc-update>          # Documentation only
```

### Typical Flow:
```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes & commit frequently
git add <files>
git commit -m "feat: descriptive message"

# 3. Push to remote
git push -u origin feature/my-feature

# 4. Create Pull Request on GitHub

# 5. After PR is merged, delete local branch
git checkout main
git pull origin main
git branch -d feature/my-feature
```

---

## 🗑️ When to Delete Branches

### Delete LOCAL Branch When:
```bash
# After PR is merged to main
git branch -d feature/branch-name

# Force delete if not merged (use with caution)
git branch -D feature/branch-name
```

### Delete REMOTE Branch When:
```bash
# After PR is merged
git push origin --delete feature/branch-name

# Or use GitHub's "Delete branch" button after PR merge
```

### Branches to NEVER Delete:
- `main` - Production/stable branch
- `phase2` - Major version branches
- Active feature branches with open PRs

---

## 💡 Commit Message Conventions

### Format:
```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Performance improvement
- `test` - Adding tests
- `chore` - Maintenance tasks, dependency updates

### Examples:
```bash
# Good
git commit -m "feat(questionnaires): add trademark template with 9 sections"
git commit -m "fix(api): handle missing templateId in questionnaire send endpoint"
git commit -m "docs: update README with questionnaire setup instructions"

# Avoid
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "wip"
```

---

## 🎬 Quick Commands for Current Situation

```bash
# Option 1: Create feature branch and commit everything
git checkout -b feature/questionnaire-system
git add .
git commit -m "feat(questionnaires): implement complete questionnaire system

- Add Appwrite collection config and setup script
- Create questionnaire data layer with trademark template
- Implement API routes for send/submit operations
- Add admin UI for sending questionnaires
- Add customer UI for filling questionnaires
- Install required UI components (Alert, Checkbox, RadioGroup)
- Update documentation and Copilot instructions"
git push -u origin feature/questionnaire-system

# Option 2: Commit in logical chunks (recommended - see section 2 above)

# Option 3: Stash changes and commit documentation separately
git stash
git checkout -b docs/update-copilot-instructions
git add .github/copilot-instructions.md
git commit -m "docs: enhance Copilot instructions with complete architecture guide"
git push -u origin docs/update-copilot-instructions
git checkout main
git stash pop
# Then follow Option 1 or 2 for feature commits
```

---

## 🔍 Useful Git Commands

```bash
# Check current status
git status

# View uncommitted changes
git diff

# View changes in a specific file
git diff apps/web/app/api/questionnaires/send/route.ts

# View commit history
git log --oneline -10

# View branches
git branch -a

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all uncommitted changes (DANGEROUS)
git reset --hard HEAD

# Show changes in last commit
git show HEAD

# Interactive staging (choose which changes to commit)
git add -p

# Check which files will be committed
git diff --cached --name-only
```

---

## 📦 Current Recommendation

**For your questionnaire feature:**

1. ✅ Create `feature/questionnaire-system` branch
2. ✅ Commit in 7 logical chunks (see section 2)
3. ✅ Push to remote
4. ✅ Create PR with description
5. ✅ Merge to main after review
6. ✅ Delete feature branch

This keeps history clean and makes code review easier!
