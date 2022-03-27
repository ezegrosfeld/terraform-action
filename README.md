# terraform-action


## Usage
```yaml
name: 'Terraform GitHub Actions'
on:
  issue_comment:
    types:
      - 'created'
  pull_request:
    types:
      - 'opened'
      - 'edited'
      - 'synchronize'

jobs:
  terraform:
    name: 'Terraform'
    runs-on: ubuntu-latest
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    steps:
      - name: Clone git repo
        uses: actions/checkout@v2

      - name: Checkout Pull Request
        if: github.event_name != 'pull_request'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR_URL="${{ github.event.issue.pull_request.url }}"
          PR_NUM=${PR_URL##*/}
          echo "Checking out from PR #$PR_NUM based on URL: $PR_URL"
          hub pr checkout $PR_NUM

      - uses: hashicorp/setup-terraform@v1

      - uses: ezegrosfeld/terraform-action
        name: 'Run Terraform'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          config_file: .
```