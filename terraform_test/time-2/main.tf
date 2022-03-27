terraform {
  backend "local" {
    path = "./time-2.tfstate"
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