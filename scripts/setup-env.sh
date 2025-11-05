#!/bin/bash

# ==============================================================================
# ENHANCED ENVIRONMENT SETUP SCRIPT
# ==============================================================================
# This script sets up the environment configuration for the project
# It handles different environments and provides interactive setup

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}🔧 Enhanced Environment Setup${NC}"
echo -e "${CYAN}==============================${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo -e "${BLUE}$(printf '%.s-' {1..50})${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to prompt user for input
prompt_user() {
    local prompt="$1"
    local default="$2"
    local result
    
    if [ -n "$default" ]; then
        echo -e "${CYAN}$prompt ${YELLOW}[default: $default]${NC}: "
    else
        echo -e "${CYAN}$prompt${NC}: "
    fi
    
    read -r result
    
    if [ -z "$result" ] && [ -n "$default" ]; then
        result="$default"
    fi
    
    echo "$result"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    print_section "Environment Detection"
    
    cd "$PROJECT_ROOT"
    
    # Detect current environment
    if [ -f ".env" ]; then
        print_warning "Existing .env file found"
        echo -e "Current .env contents:"
        echo -e "${PURPLE}$(head -5 .env)${NC}"
        if [ "$(wc -l < .env)" -gt 5 ]; then
            echo -e "${PURPLE}... ($(wc -l < .env) total lines)${NC}"
        fi
        echo ""
        
        backup_choice=$(prompt_user "Create backup of existing .env? (y/n)" "y")
        if [[ "$backup_choice" =~ ^[Yy]$ ]]; then
            cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
            print_success "Backup created"
        fi
    fi
    
    print_section "Environment Selection"
    echo -e "Available environment configurations:"
    echo -e "  ${GREEN}1)${NC} Development (default - uses Lovable Cloud)"
    echo -e "  ${GREEN}2)${NC} Local Development (custom configuration)"
    echo -e "  ${GREEN}3)${NC} Production"
    echo -e "  ${GREEN}4)${NC} Custom (start from template)"
    echo ""
    
    env_choice=$(prompt_user "Select environment type (1-4)" "1")
    
    case $env_choice in
        1)
            setup_development
            ;;
        2)
            setup_local_development
            ;;
        3)
            setup_production
            ;;
        4)
            setup_custom
            ;;
        *)
            print_error "Invalid choice, using development defaults"
            setup_development
            ;;
    esac
    
    print_section "Dependency Check"
    check_dependencies
    
    print_section "Final Steps"
    print_success "Environment setup complete!"
    
    echo -e "\n${YELLOW}📚 Next steps:${NC}"
    echo -e "  1. Review your .env file: ${GREEN}cat .env${NC}"
    echo -e "  2. Install dependencies: ${GREEN}npm install${NC} or ${GREEN}bun install${NC}"
    echo -e "  3. Start development: ${GREEN}npm run dev${NC} or ${GREEN}bun run dev${NC}"
    echo -e "  4. Open browser: ${GREEN}http://localhost:8080${NC}\n"
    
    # Optional: start development server
    start_choice=$(prompt_user "Start development server now? (y/n)" "n")
    if [[ "$start_choice" =~ ^[Yy]$ ]]; then
        if command_exists bun; then
            echo -e "\n${GREEN}Starting development server with bun...${NC}"
            bun run dev
        elif command_exists npm; then
            echo -e "\n${GREEN}Starting development server with npm...${NC}"
            npm run dev
        else
            print_error "No package manager found"
        fi
    fi
}

# Setup development environment
setup_development() {
    print_success "Setting up development environment"
    cp .env.development .env
    print_success "Development environment configured"
}

# Setup local development environment
setup_local_development() {
    print_success "Setting up local development environment"
    
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env
    else
        cp .env.example .env
    fi
    
    echo -e "\n${YELLOW}Local development configuration:${NC}"
    
    # Ask if user wants to use local Supabase
    supabase_choice=$(prompt_user "Use local Supabase instance? (y/n)" "n")
    if [[ "$supabase_choice" =~ ^[Yy]$ ]]; then
        # Update .env to use local Supabase
        sed -i 's|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=http://localhost:54321|g' .env
        sed -i 's|VITE_SUPABASE_PROJECT_ID=.*|VITE_SUPABASE_PROJECT_ID=localhost|g' .env
        print_success "Configured for local Supabase"
        
        if command_exists supabase; then
            start_supabase=$(prompt_user "Start local Supabase now? (y/n)" "y")
            if [[ "$start_supabase" =~ ^[Yy]$ ]]; then
                echo -e "${GREEN}Starting local Supabase...${NC}"
                supabase start
            fi
        else
            print_warning "Supabase CLI not found. Install with: npm install -g supabase"
        fi
    fi
    
    # Ask for custom port
    port=$(prompt_user "Development server port" "8080")
    sed -i "s|VITE_PORT=.*|VITE_PORT=$port|g" .env
    sed -i "s|http://localhost:8080|http://localhost:$port|g" .env
    
    print_success "Local development environment configured"
}

# Setup production environment
setup_production() {
    print_success "Setting up production environment"
    
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env
    else
        cp .env.example .env
    fi
    
    echo -e "\n${YELLOW}Production configuration required:${NC}"
    
    # Get production Supabase details
    supabase_url=$(prompt_user "Supabase URL" "")
    supabase_key=$(prompt_user "Supabase Anon Key" "")
    supabase_project=$(prompt_user "Supabase Project ID" "")
    
    # Update .env with production values
    sed -i "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$supabase_url|g" .env
    sed -i "s|VITE_SUPABASE_PUBLISHABLE_KEY=.*|VITE_SUPABASE_PUBLISHABLE_KEY=$supabase_key|g" .env
    sed -i "s|VITE_SUPABASE_PROJECT_ID=.*|VITE_SUPABASE_PROJECT_ID=$supabase_project|g" .env
    
    # Get production domain
    domain=$(prompt_user "Production domain" "https://your-domain.com")
    sed -i "s|VITE_APP_URL=.*|VITE_APP_URL=$domain|g" .env
    sed -i "s|https://your-domain.com|$domain|g" .env
    
    print_success "Production environment configured"
}

# Setup custom environment
setup_custom() {
    print_success "Setting up custom environment from template"
    cp .env.example .env
    
    echo -e "\n${YELLOW}Custom configuration:${NC}"
    echo -e "Edit the .env file to customize your configuration"
    echo -e "Available example files for reference:"
    echo -e "  - .env.example (template)"
    echo -e "  - .env.local.example (local development)"
    echo -e "  - .env.production.example (production)"
    
    edit_choice=$(prompt_user "Open .env for editing now? (y/n)" "y")
    if [[ "$edit_choice" =~ ^[Yy]$ ]]; then
        if command_exists code; then
            code .env
        elif command_exists nano; then
            nano .env
        elif command_exists vim; then
            vim .env
        else
            echo -e "${YELLOW}Please edit .env manually${NC}"
        fi
    fi
}

# Check dependencies
check_dependencies() {
    # Check Node.js
    if command_exists node; then
        node_version=$(node -v)
        print_success "Node.js $node_version detected"
    else
        print_error "Node.js not found. Install from https://nodejs.org/"
    fi
    
    # Check package managers
    if command_exists bun; then
        bun_version=$(bun -v)
        print_success "Bun $bun_version detected"
        PACKAGE_MANAGER="bun"
    elif command_exists npm; then
        npm_version=$(npm -v)
        print_success "npm $npm_version detected"
        PACKAGE_MANAGER="npm"
    else
        print_error "No package manager found"
        return 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed"
        install_choice=$(prompt_user "Install dependencies now? (y/n)" "y")
        if [[ "$install_choice" =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}Installing dependencies with $PACKAGE_MANAGER...${NC}"
            $PACKAGE_MANAGER install
            print_success "Dependencies installed"
        fi
    else
        print_success "Dependencies already installed"
    fi
    
    # Check Supabase CLI
    if command_exists supabase; then
        supabase_version=$(supabase --version)
        print_success "Supabase CLI $supabase_version detected"
    else
        print_warning "Supabase CLI not found. Install with: npm install -g supabase"
    fi
}

# Run main function
main "$@"