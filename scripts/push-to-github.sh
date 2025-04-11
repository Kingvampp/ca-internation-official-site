#!/bin/bash

# Exit on error
set -e

# Check if the current directory is a git repository
if [ ! -d .git ]; then
    echo "This directory is not a git repository. Initializing git..."
    git init
    echo "Git repository initialized."
fi

# Check if remote repository exists
if ! git remote -v | grep -q "origin"; then
    echo "No remote repository found."
    read -p "Enter GitHub repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "No URL provided. Exiting."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "Remote repository added."
fi

# Run vercel preparation script
echo "Preparing code for deployment..."
npm run prepare-vercel

# Add all files to staging
git add .

# Commit changes
read -p "Enter commit message: " commit_message

if [ -z "$commit_message" ]; then
    commit_message="Update website for Vercel deployment"
fi

git commit -m "$commit_message"

# Push to GitHub
echo "Pushing changes to GitHub..."
echo "This will trigger automatic deployment via Vercel if you have connected your GitHub repository to Vercel."

read -p "Specify branch name (default: main): " branch_name

if [ -z "$branch_name" ]; then
    branch_name="main"
fi

# Check if branch exists locally
if ! git show-ref --verify --quiet refs/heads/$branch_name; then
    git branch $branch_name
fi

# Push to the specified branch
git push -u origin $branch_name

echo ""
echo "Changes pushed to GitHub successfully!"
echo ""
echo "If your GitHub repository is connected to Vercel, deployment should start automatically."
echo "Check deployment status at: https://vercel.com/dashboard"
echo "" 