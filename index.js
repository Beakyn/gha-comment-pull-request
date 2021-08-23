const github = require("@actions/github");
const core = require("@actions/core");

function getInputs() {
  const pullRequestNumber = core.getInput("pull-request-number");
  const descriptionMessage = core.getInput("description-message");
  const commentMessage = core.getInput("comment-message");
  const deletePreviousComment = core.getInput("delete-previous-comment");
  const token = process.env.GITHUB_TOKEN;

  return {
    pullRequestNumber,
    descriptionMessage,
    commentMessage,
    deletePreviousComment,
    token,
  };
}

async function run() {
  try {
    const {
      pullRequestNumber,
      descriptionMessage,
      commentMessage,
      deletePreviousComment,
      token,
    } = getInputs();
    const { pull_request } = github.context.payload;
    const { owner, repo } = github.context.repo;
    const octokit = github.getOctokit(token);
    if (!pull_request && !pullRequestNumber) {
      console.log('Not a pull_request event or pull-request-number informed. Ignoring action.')
      return;
    }
    const pull_number = pull_request && pull_request.number || pullRequestNumber

    /**
     * @param {string} message 
     * @returns {string}
     */
    const placeholderWrap = message => `\n<!-- Replace -->\n${message}\n<!-- Replace -->\n`.replace('\\n', '\n')

    /**
     * @param {string} text 
     * @param {string} placeholder 
     * @returns {string}
     */
    const replacePlaceholder = (text = '', placeholder = '') =>
      text.replace(/(<!-- Replace -->)(.*)(<!-- Replace -->)/s, placeholder);

    if (descriptionMessage) {
      const descriptionWithPlaceholder = placeholderWrap(descriptionMessage)
      const currentPullRequest = await octokit.pulls.get({
        owner,
        repo,
        pull_number,
      });
      const newBody = replacePlaceholder(
        currentPullRequest.data.body,
        ''
      ).concat(`\n${descriptionWithPlaceholder}`)
      await octokit.pulls.update({
        owner,
        repo,
        pull_number,
        body: newBody
      });
      console.log(newBody)
      console.log("Updated pull request description succesfully");
    }

    if (commentMessage) {
      if (deletePreviousComment) {
        const comments = await octokit.issues.listComments({
          owner,
          repo,
          issue_number: pull_number,
        });
        const commentsToDelete =
          comments.data.filter(c => c.body.match(/(<!-- Replace -->)/))
        await Promise.all(
          commentsToDelete.map(c => octokit.issues.deleteComment({
            owner,
            repo,
            comment_id: c.id,
          })))
        console.log("Deleted previous comments succesfully.");
      }

      const commentWithPlaceholder = placeholderWrap(commentMessage)

      const body = commentWithPlaceholder

      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body,
      });
      console.log("Added new comment to pull request succesfully.");
    }
  } catch (error) {
    console.log('Error => ', error);
    core.setFailed(error.message);
  }
}

run();
