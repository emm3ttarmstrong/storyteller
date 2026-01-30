#!/bin/bash

# Storyteller Deployment Script
# Usage: ./deploy.sh [local|production]

set -e

ENVIRONMENT=${1:-local}

echo "🚀 Deploying Storyteller in $ENVIRONMENT mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    command -v node >/dev/null 2>&1 || print_error "Node.js is required but not installed."
    command -v npm >/dev/null 2>&1 || print_error "npm is required but not installed."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        command -v vercel >/dev/null 2>&1 || print_error "Vercel CLI is required for production deployment. Run: npm i -g vercel"
    fi
}

# Install dependencies
install_deps() {
    print_step "Installing dependencies..."
    npm ci
}

# Setup environment
setup_environment() {
    print_step "Setting up environment..."
    
    if [ "$ENVIRONMENT" = "local" ]; then
        if [ ! -f .env.local ]; then
            print_warning "Creating .env.local from template..."
            cp .env.example .env.local
            print_warning "Please edit .env.local with your actual values before continuing!"
            read -p "Press Enter after you've configured .env.local..."
        fi
    fi
}

# Database setup
setup_database() {
    print_step "Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    if [ "$ENVIRONMENT" = "local" ]; then
        npx prisma migrate deploy
        print_step "Database migrations completed"
    else
        print_warning "Database migrations will run automatically during Vercel build"
    fi
}

# Local development
start_local() {
    print_step "Starting local development server..."
    npm run dev
}

# Production deployment
deploy_production() {
    print_step "Deploying to production..."
    
    # Check if logged in to Vercel
    if ! vercel whoami >/dev/null 2>&1; then
        print_warning "Not logged in to Vercel. Running vercel login..."
        vercel login
    fi
    
    # Deploy
    vercel --prod
    
    print_step "Production deployment completed!"
    print_warning "Don't forget to:"
    echo "1. Configure emmett.wtf domain in Vercel dashboard"
    echo "2. Set up DNS records for emmett.wtf"
    echo "3. Set environment variables in Vercel dashboard"
    echo "4. Test the complete user flow"
}

# Build for testing
test_build() {
    print_step "Testing build..."
    npm run build
    print_step "Build successful!"
}

# Main execution
main() {
    check_dependencies
    install_deps
    setup_environment
    setup_database
    
    if [ "$ENVIRONMENT" = "local" ]; then
        test_build
        start_local
    elif [ "$ENVIRONMENT" = "production" ]; then
        test_build
        deploy_production
    else
        print_error "Invalid environment. Use 'local' or 'production'"
    fi
}

# Run main function
main "$@"