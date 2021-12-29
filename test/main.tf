terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 4.0"
    }
  }
}


provider "github" {
    owner = "ezedh"
}

resource "github_repository" "test-repo" {
  name        = "test-repo"
  description = "Sweet Terraform Repo Yey..."
}