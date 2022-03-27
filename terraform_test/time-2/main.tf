terraform {
  backend "local" {
    path = "terraform_test/time-2/terraform.tfstate"
    workspace_dir = "terraform_test/time-2/workspace"
  }
  required_providers {
    time = {
      source = "hashicorp/time"
      version = "0.7.2"
    }
  }
}

provider "time" {
  # Configuration options
}