#!/bin/bash

# MealieApi Database Setup Script
# This script sets up the PostgreSQL database for the MealieApi project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to extract connection string from JSON file
extract_connection_string() {
    local file_path="$1"
    
    if [[ ! -f "$file_path" ]]; then
        return 1
    fi
    
    # Use jq if available, otherwise use grep/sed fallback
    if command -v jq &> /dev/null; then
        local connection_string
        connection_string=$(jq -r '.ConnectionStrings.DefaultConnection' "$file_path" 2>/dev/null)
        if [[ "$connection_string" != "null" && -n "$connection_string" ]]; then
            echo "$connection_string"
            return 0
        fi
    else
        # Fallback: grep and sed approach
        local connection_string
        connection_string=$(grep -A 1 '"DefaultConnection"' "$file_path" | tail -n 1 | sed 's/.*"\(.*\)".*/\1/' | tr -d ' ')
        if [[ -n "$connection_string" ]]; then
            echo "$connection_string"
            return 0
        fi
    fi
    
    return 1
}

# Function to parse PostgreSQL connection string
parse_connection_string() {
    local connection_string="$1"
    
    # Extract host, port, database, username, and password
    local host=$(echo "$connection_string" | grep -o 'Host=[^;]*' | cut -d'=' -f2)
    local port=$(echo "$connection_string" | grep -o 'Port=[^;]*' | cut -d'=' -f2)
    local database=$(echo "$connection_string" | grep -o 'Database=[^;]*' | cut -d'=' -f2)
    local username=$(echo "$connection_string" | grep -o 'Username=[^;]*' | cut -d'=' -f2)
    local password=$(echo "$connection_string" | grep -o 'Password=[^;]*' | cut -d'=' -f2)
    
    # Set defaults if not specified
    [[ -z "$host" ]] && host="localhost"
    [[ -z "$port" ]] && port="5432"
    [[ -z "$username" ]] && username="postgres"
    
    echo "$host|$port|$database|$username|$password"
}

# Function to check if PostgreSQL is running
check_postgresql() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed or not in PATH"
        print_status "Please install PostgreSQL client tools"
        exit 1
    fi
    
    # Try to connect to PostgreSQL
    if ! psql -h localhost -U postgres -c "SELECT 1;" >/dev/null 2>&1; then
        print_warning "Could not connect to PostgreSQL as postgres user"
        print_status "Make sure PostgreSQL is running and accessible"
    fi
}

# Function to drop database if it exists
drop_database() {
    local host="$1"
    local port="$2"
    local database="$3"
    local username="$4"
    local password="$5"
    
    print_status "Checking if database '$database' exists..."
    
    # Set PGPASSWORD environment variable for password authentication
    export PGPASSWORD="$password"
    
    # Check if database exists
    if psql -h "$host" -p "$port" -U "$username" -lqt | cut -d \| -f 1 | grep -qw "$database"; then
        print_warning "Database '$database' exists. Dropping it..."
        
        # Terminate all connections to the database
        psql -h "$host" -p "$port" -U "$username" -c "
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '$database'
            AND pid <> pg_backend_pid();
        " >/dev/null 2>&1 || true
        
        # Drop the database
        if psql -h "$host" -p "$port" -U "$username" -c "DROP DATABASE \"$database\";" >/dev/null 2>&1; then
            print_success "Database '$database' dropped successfully"
        else
            print_error "Failed to drop database '$database'"
            exit 1
        fi
    else
        print_status "Database '$database' does not exist"
    fi
    
    # Unset password
    unset PGPASSWORD
}

# Function to create database
create_database() {
    local host="$1"
    local port="$2"
    local database="$3"
    local username="$4"
    local password="$5"
    
    print_status "Creating database '$database'..."
    
    export PGPASSWORD="$password"
    
    if psql -h "$host" -p "$port" -U "$username" -c "CREATE DATABASE \"$database\";" >/dev/null 2>&1; then
        print_success "Database '$database' created successfully"
    else
        print_error "Failed to create database '$database'"
        exit 1
    fi
    
    unset PGPASSWORD
}

# Function to run EF migrations
run_ef_migrations() {
    local connection_string="$1"
    
    print_status "Running Entity Framework migrations..."
    
    # Set the connection string as environment variable for EF tools
    export ConnectionStrings__DefaultConnection="$connection_string"
    
    # Run EF database update
    print_status "Updating database schema..."
    if dotnet ef database update --project MealieApi.Infrastructure --startup-project MealieApi.WebApi --verbose; then
        print_success "Database schema updated successfully"
    else
        print_error "Failed to update database schema"
        exit 1
    fi
    
    # Unset environment variable
    unset ConnectionStrings__DefaultConnection
}

# Main script execution
main() {
    print_status "Starting MealieApi database setup..."
    
    # Check if we're in the right directory
    if [[ ! -f "MealieApi.sln" ]]; then
        print_error "This script must be run from the MealieApi solution directory"
        print_status "Current directory: $(pwd)"
        exit 1
    fi
    
    # Check PostgreSQL availability
    check_postgresql
    
    # Try to read connection string from appsettings.Development.json first
    local connection_string
    local config_file
    
    print_status "Reading connection string from configuration files..."
    
    if connection_string=$(extract_connection_string "MealieApi.WebApi/appsettings.Development.json"); then
        config_file="appsettings.Development.json"
        print_success "Using connection string from $config_file"
    elif connection_string=$(extract_connection_string "MealieApi.WebApi/appsettings.json"); then
        config_file="appsettings.json"
        print_success "Using connection string from $config_file"
    else
        print_error "Could not find connection string in any configuration file"
        print_status "Please check that appsettings.json or appsettings.Development.json exists and contains a DefaultConnection string"
        exit 1
    fi
    
    print_status "Connection string: $connection_string"
    
    # Parse connection string
    local parsed_connection
    parsed_connection=$(parse_connection_string "$connection_string")
    
    if [[ $? -ne 0 ]]; then
        print_error "Failed to parse connection string"
        exit 1
    fi
    
    # Split parsed connection string
    IFS='|' read -r host port database username password <<< "$parsed_connection"
    
    print_status "Parsed connection details:"
    print_status "  Host: $host"
    print_status "  Port: $port"
    print_status "  Database: $database"
    print_status "  Username: $username"
    
    # Drop database if it exists
    drop_database "$host" "$port" "$database" "$username" "$password"
    
    # Create database
    create_database "$host" "$port" "$database" "$username" "$password"
    
    # Run EF migrations
    run_ef_migrations "$connection_string"
    
    print_success "Database setup completed successfully!"
    print_status "You can now run the MealieApi application"
}

# Run main function
main "$@"
