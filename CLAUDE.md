# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production version to `dist/` directory
- `npm run preview` - Preview production build locally
- `npm run lint` - Code linting (currently disabled for static site)

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
- **Backend Service**: Tencent CloudBase integration

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

### CloudBase Integration
- **Authentication**: Anonymous login, WeChat login support
- **File Storage**: Image upload with progress tracking, file management
- **Database**: User data and file metadata storage
- **SDK**: `@cloudbase/js-sdk` for frontend integration
- **Configuration**: Environment ID set via `VITE_CLOUDBASE_ENV`

### Key CloudBase Components
- `src/utils/cloudbase.js` - CloudBase service wrapper
- `src/stores/user.js` - User authentication state management  
- `src/stores/upload.js` - File upload state management
- `src/components/ui/UserAuth.vue` - Login/logout interface
- `src/components/ui/ImageUpload.vue` - File upload interface
- `src/views/Upload.vue` - Upload page with full functionality

### Deployment
- Production builds copy all necessary files to `dist/`
- GitHub Pages serves from `gh-pages` branch
- CNAME file preserves custom domain setup
- Hash routing ensures SPA works on static hosting
- CloudBase requires environment configuration for full functionality