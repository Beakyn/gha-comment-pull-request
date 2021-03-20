<img src="https://repository-images.githubusercontent.com/344987348/55907000-896a-11eb-9c52-ebeaf9900503" height="300" />

# Comment Pull Request

Action to add comments and edit description in pull requests

## Pre-requisites

Create a workflow .yml file in your .github/workflows directory. An example workflow is available below. For more information, reference the GitHub Help Documentation for Creating a workflow file.

## Inputs

`pull-request-number`: Pull request number. **This is required if not running in a pull_request event**

`description-message`: Append message to pull request description

`comment-message`: Add comment to pull request

`delete-previous-comment`: Delete previous comment

## Example

```yaml
- name: Comment deploy URL to pull request
  uses: Beakyn/gha-comment-pull-request@main
  env:
    GITHUB_TOKEN: ${{ github.token }}
  with:
    description-message: |
      ----
      ### Live Preview
      :rocket: Released to https://${{steps.environment.outputs.deployUrl}}
    comment-message: |
      ### Live Preview
      :rocket: Released to https://${{steps.environment.outputs.deployUrl}}
    delete-previous-comment: true
```
