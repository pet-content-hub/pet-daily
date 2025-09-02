# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production version to `dist/` directory
- `npm run preview` - Preview production build locally
- `npm run lint` - Code linting (currently disabled for static site)
- `npm run dev:full` - Start Supabase + Vite development environment

### Supabase Local Development
- `npm run supabase:start` - Start local Supabase services (PostgreSQL + Auth + Storage)
- `npm run supabase:stop` - Stop local Supabase services
- `npm run supabase:status` - Check Supabase services status
- `npm run supabase:reset` - Reset local database with migrations
- `npm run supabase:studio` - Open Supabase Studio (database management UI)

**Important**: Avoid creating duplicate workflows if existing ones work well. Improve existing functionality rather than rebuilding.

### Python Scripts (AI Article Generation)
- `cd scripts && python generate_article.py` - Generate new articles using AI APIs
- `python scripts/generate_sitemap.py` - Update sitemap.xml
- `python scripts/generate_rss.py` - Update RSS feed
- `python scripts/test_local.py` - Generate test article without API key

### Testing Article Generation
```bash
# Set API key and run from scripts directory
export OPENAI_API_KEY="your-key"
cd scripts
python generate_article.py
```

## Architecture Overview

### Frontend (Vue 3 SPA)
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite with Hash routing (`/#/stories/xxx`)
- **State Management**: Pinia stores (`src/stores/`)
- **Routing**: Vue Router 4 with `createWebHashHistory()`
- **Styling**: SCSS with component-scoped styles
- **PWA**: vite-plugin-pwa for offline support
- **Backend Service**: Supabase (PostgreSQL + Auth + Storage) with local development support

### AI Content Generation System
- **Backend**: Python scripts in `scripts/` directory
- **AI Providers**: Supports OpenAI, Claude, Zhipu AI, Qwen APIs
- **Content Types**: Cat breed guides, kitten care, product reviews, health guides, behavior training
- **Output**: Static HTML files in `articles/` directory
- **Automation**: GitHub Actions workflows for scheduled generation

### Key Architecture Patterns

#### Hash Routing for GitHub Pages
- Uses `createWebHashHistory()` to ensure GitHub Pages compatibility
- All routes use hash format: `/#/stories/article-slug`
- No server-side configuration needed for SPA routing

#### Static Article Generation
- Articles generated as static HTML files in `articles/` directory
- Article metadata stored in `articles.json`
- Each article has structured HTML with SEO meta tags
- Articles are referenced by slug in Vue router

#### State Management Structure
- `src/stores/app.js` - Global app state, base paths, loading states
- `src/stores/articles.js` - Article loading, filtering, pagination
- Articles store includes fallback example data when `articles.json` fails to load

#### Build Configuration
- `vite.config.js` copies static assets to `dist/` during build
- Files copied: `articles.json`, `sitemap.xml`, `feed.xml`, `robots.txt`, `CNAME`, article HTML files
- PWA manifest configured for cat-themed app

### Python Script Architecture
- `generate_article.py` - Main article generation with AI API integration
- `generate_sitemap.py` - SEO sitemap generation
- `generate_rss.py` - RSS feed generation
- Scripts auto-detect and switch to project root directory when run from `scripts/`
- Support for multiple AI providers with fallback logic

### GitHub Actions Automation
- **Schedule**: Runs 4 times daily (6:00, 10:00, 14:00, 18:00 UTC+8)
- **Process**: Generate articles → Update sitemap/RSS → Commit → Auto-deploy
- **APIs**: Requires `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `ZHIPU_API_KEY`, `QWEN_API_KEY` in repository secrets

## Working with the Codebase

### Article System
- Articles are loaded dynamically from `articles.json` or fallback to hardcoded examples
- Each article has: `title`, `category`, `excerpt`, `date`, `readTime`, `slug`, `icon`
- Article HTML files should be placed in `articles/` directory
- Use `getArticleBySlug()` method to find articles in components

### Adding New Features
- Follow Vue 3 Composition API patterns
- Use Pinia stores for state management
- Components are organized in `src/components/layout/` and `src/components/ui/`
- Add route meta for SEO: `title`, `description`

### Python Scripts
- All scripts expect to run from project root or auto-switch from `scripts/`
- API keys loaded from environment variables or `.env` file
- Configuration in `config.json` controls AI provider, article count, SEO settings
- Scripts generate articles in Chinese for cat care topics

### Supabase Integration (Current)
- **Authentication**: Magic Link email authentication
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Organized buckets for avatars, cat photos, diary images
- **SDK**: `@supabase/supabase-js` for frontend integration
- **Local Development**: Full local stack with Docker containers
- **Configuration**: Environment variables in `.env.local`

### Key Supabase Components
- `src/utils/supabase.js` - Supabase service wrapper with comprehensive API
- `src/stores/user.js` - User authentication state management (Magic Link)
- `src/stores/cats.js` - Cat profiles and management
- `src/stores/diary.js` - Cat diary entries and timeline
- `supabase/migrations/` - Database schema and migrations
- `supabase/config.toml` - Local development configuration

### Database Schema (Supabase)
- **user_profiles** - User account information and preferences
- **cats** - Cat profiles with breed, health data, photos
- **cat_diaries** - Daily diary entries with mood, health metrics
- **diary_images** - Photos associated with diary entries
- **vaccination_records** - Vaccination tracking and reminders
- **medical_records** - Veterinary visits and health history

### Cat Diary Features
- **Public Timeline**: Browse all public cat diary entries
- **Cat Profiles**: Detailed cat information with photos and stats
- **Diary Creation**: Rich diary entries with mood, health metrics, photos
- **Privacy Controls**: Public vs private diary entries
- **Image Management**: Upload and organize photos with automatic storage
- **Health Tracking**: Weight, temperature, food intake, activity levels



### Local Development Environment

#### Supabase Services (Local)
When running `npm run supabase:start`, the following services are available:
- **API URL**: http://127.0.0.1:54321 - Main Supabase API
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio**: http://127.0.0.1:54323 - Database management interface
- **Inbucket**: http://127.0.0.1:54324 - Email testing (for Magic Link)
- **Storage**: http://127.0.0.1:54321/storage/v1/s3 - File storage

#### Environment Configuration
- `.env.local` - Local development environment variables
- `VITE_SUPABASE_URL` - Local Supabase API URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous access key for client
- All keys are development-only and safe for local use

#### Development Workflow
1. `npm run supabase:start` - Start all backend services
2. `npm run dev` - Start frontend development server
3. Visit http://localhost:3000 for the app
4. Visit http://127.0.0.1:54323 for database management
5. Use http://127.0.0.1:54324 to see Magic Link emails

### Deployment
- **Development**: Local Supabase + Vite dev server
- **Production**: Will require Supabase cloud project setup
- Production builds copy all necessary files to `dist/`
- GitHub Pages serves from `gh-pages` branch
- CNAME file preserves custom domain setup
- Hash routing ensures SPA works on static hosting