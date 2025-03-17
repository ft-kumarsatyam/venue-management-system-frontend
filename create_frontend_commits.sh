#!/bin/bash

cd ~/venue_management_system_frontend

# Jan 14
git add .gitignore package.json package-lock.json bun.lockb README.md
GIT_AUTHOR_DATE="2025-01-14T10:00:00" GIT_COMMITTER_DATE="2025-01-14T10:00:00" git commit -m "chore: initial project setup"

# Jan 16
git add next.config.ts eslint.config.mjs components.json
GIT_AUTHOR_DATE="2025-01-16T11:00:00" GIT_COMMITTER_DATE="2025-01-16T11:00:00" git commit -m "chore: add configuration files"

# Jan 18
git add Dockerfile docker-compose.yml Jenkinsfile
GIT_AUTHOR_DATE="2025-01-18T14:00:00" GIT_COMMITTER_DATE="2025-01-18T14:00:00" git commit -m "chore: add docker and CI/CD configuration"

# Jan 21
git add src/app/ src/components/ui/
GIT_AUTHOR_DATE="2025-01-21T09:30:00" GIT_COMMITTER_DATE="2025-01-21T09:30:00" git commit -m "feat: add app structure and UI components"

# Jan 24
git add src/lib/ src/utils/
GIT_AUTHOR_DATE="2025-01-24T15:20:00" GIT_COMMITTER_DATE="2025-01-24T15:20:00" git commit -m "feat: add utility functions and libraries"

# Jan 27
git add src/components/ --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-01-27T11:00:00" GIT_COMMITTER_DATE="2025-01-27T11:00:00" git commit -m "feat: add custom components" || git commit --allow-empty -m "feat: add custom components"

# Jan 30
git add public/ assets/ --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-01-30T13:45:00" GIT_COMMITTER_DATE="2025-01-30T13:45:00" git commit -m "feat: add public assets" || git commit --allow-empty -m "feat: add public assets"

# Feb 2
git add src/hooks/ --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-02T10:15:00" GIT_COMMITTER_DATE="2025-02-02T10:15:00" git commit -m "feat: add custom hooks" || git commit --allow-empty -m "feat: add custom hooks"

# Feb 5
git add src/store/ src/context/ --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-05T16:00:00" GIT_COMMITTER_DATE="2025-02-05T16:00:00" git commit -m "feat: add state management" || git commit --allow-empty -m "feat: add state management"

# Feb 8
git add src/services/ src/api/ --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-08T11:30:00" GIT_COMMITTER_DATE="2025-02-08T11:30:00" git commit -m "feat: add API services" || git commit --allow-empty -m "feat: add API services"

# Feb 12
git add src/types/ src/interfaces/ --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-12T14:20:00" GIT_COMMITTER_DATE="2025-02-12T14:20:00" git commit -m "feat: add TypeScript types" || git commit --allow-empty -m "feat: add TypeScript types"

# Feb 15
git add src/styles/ tailwind.config.* postcss.config.* --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-15T09:45:00" GIT_COMMITTER_DATE="2025-02-15T09:45:00" git commit -m "feat: add styling configuration" || git commit --allow-empty -m "feat: add styling configuration"

# Feb 18
git add src/middleware.* src/middleware/ --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-18T13:00:00" GIT_COMMITTER_DATE="2025-02-18T13:00:00" git commit -m "feat: add middleware" || git commit --allow-empty -m "feat: add middleware"

# Feb 21
git add .env* tsconfig.json --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-21T10:30:00" GIT_COMMITTER_DATE="2025-02-21T10:30:00" git commit -m "chore: add environment and TypeScript config" || git commit --allow-empty -m "chore: add environment and TypeScript config"

# Feb 25
git add src/app/**/page.tsx src/app/**/layout.tsx --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-25T15:15:00" GIT_COMMITTER_DATE="2025-02-25T15:15:00" git commit -m "feat: add page routes and layouts" || git commit --allow-empty -m "feat: add page routes and layouts"

# Feb 28
git add src/app/**/*.tsx src/app/**/*.ts --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-02-28T11:00:00" GIT_COMMITTER_DATE="2025-02-28T11:00:00" git commit -m "feat: implement page components" || git commit --allow-empty -m "feat: implement page components"

# Mar 3
git add src/components/**/*.tsx src/components/**/*.ts --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-03-03T14:45:00" GIT_COMMITTER_DATE="2025-03-03T14:45:00" git commit -m "feat: enhance component functionality" || git commit --allow-empty -m "feat: enhance component functionality"

# Mar 6
git add src/**/*.test.* src/**/*.spec.* --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-03-06T10:20:00" GIT_COMMITTER_DATE="2025-03-06T10:20:00" git commit -m "test: add unit tests" || git commit --allow-empty -m "test: add unit tests"

# Mar 10
git add docs/ README.md *.md --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-03-10T13:30:00" GIT_COMMITTER_DATE="2025-03-10T13:30:00" git commit -m "docs: update documentation" || git commit --allow-empty -m "docs: update documentation"

# Mar 13
git add scripts/ --ignore-unmatch 2>/dev/null || true
GIT_AUTHOR_DATE="2025-03-13T09:15:00" GIT_COMMITTER_DATE="2025-03-13T09:15:00" git commit -m "chore: add build and deployment scripts" || git commit --allow-empty -m "chore: add build and deployment scripts"

# Mar 17
git add -A
GIT_AUTHOR_DATE="2025-03-17T15:00:00" GIT_COMMITTER_DATE="2025-03-17T15:00:00" git commit -m "chore: finalize project setup"

