import React from 'react';
import { Summary } from '../contributions-by-repo';
import { toHtmlUrl } from '../contributions';
import {
  PullRequestReviewCommentEventPayload,
  IssueCommentEventPayload,
  PullRequestReviewEventPayload,
  CommitCommentEventPayload,
} from '../contributions';
import {
  CommentIcon,
  CommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  InfoIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
} from '@primer/octicons-react';

const withIssue = (
  value:
    | PullRequestReviewCommentEventPayload
    | IssueCommentEventPayload
    | PullRequestReviewEventPayload
    | CommitCommentEventPayload,
): value is IssueCommentEventPayload => {
  return 'issue' in value;
};
const withPr = (
  value:
    | PullRequestReviewCommentEventPayload
    | IssueCommentEventPayload
    | PullRequestReviewEventPayload
    | CommitCommentEventPayload,
): value is PullRequestReviewCommentEventPayload | PullRequestReviewEventPayload => {
  return 'pull_request' in value;
};

const withPrReview = (
  value:
    | PullRequestReviewCommentEventPayload
    | IssueCommentEventPayload
    | PullRequestReviewEventPayload
    | CommitCommentEventPayload,
): value is PullRequestReviewEventPayload => {
  return 'review' in value;
};

const withCommit = (
  value:
    | PullRequestReviewCommentEventPayload
    | IssueCommentEventPayload
    | PullRequestReviewEventPayload
    | CommitCommentEventPayload,
): value is CommitCommentEventPayload => {
  return !('issue' in value) && !('pull_request' in value);
};

const Comments = ({ comments }: { comments: Summary['comments'] }) => {
  const count = Object.values(comments).reduce((acc, c) => acc + c.data.length, 0);
  return (
    <>
      <div>
        <span className="flex">
          <InfoIcon size={24} />
          <span className="text-lg font-bold">
            {count} Comments in {Object.keys(comments).length} repositories
          </span>
        </span>
      </div>
      {Object.keys(comments).map((repoName) => {
        return (
          <div key={repoName}>
            <details>
              <summary className="grid grid-cols-12">
                <span className="col-start-1 col-end-11">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                    href={toHtmlUrl(comments[repoName].repo?.url)}
                  >
                    {repoName}
                  </a>{' '}
                  {comments[repoName].data.length} Comments
                </span>
              </summary>
              <ul className="list-none">
                {comments[repoName].data.map((c) => {
                  const htmlUrl = withPrReview(c) ? c.review.html_url : c.comment.html_url;
                  const numberOrId = withCommit(c)
                    ? c.comment.commit_id
                    : withIssue(c)
                    ? c.issue.number
                    : withPr(c)
                    ? c.pull_request.number
                    : '';
                  const title = withIssue(c) ? c.issue.title : withPr(c) ? c.pull_request.title : '';

                  return (
                    <li key={htmlUrl} className="grid grid-cols-12 gap-4">
                      <span className="col-start-1 col-end-10 ml-3 flex">
                        <CommentIcon size={20} />
                        <a target="_blank" rel="noreferrer" href={htmlUrl} className="text-blue-600 hover:underline">
                          {withIssue(c) && c.issue && c.issue.state === 'open' ? (
                            <span className="text-green-800">
                              <IssueOpenedIcon size={20} />
                            </span>
                          ) : withIssue(c) && c.issue && c.issue.state === 'closed' ? (
                            <span className="text-red-800">
                              <IssueClosedIcon size={20} />
                            </span>
                          ) : withPr(c) && c.pull_request && c.pull_request.state === 'closed' ? (
                            <span className="text-purple-800">
                              <GitMergeIcon size={20} />
                            </span>
                          ) : withPr(c) && c.pull_request && c.pull_request.state !== 'closed' ? (
                            <span className="text-green-800">
                              <GitPullRequestIcon size={20} />
                            </span>
                          ) : (
                            <span className="text-gray-800">
                              <CommitIcon size={20} />
                            </span>
                          )}
                          {numberOrId}
                        </a>{' '}
                        {title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        );
      })}
    </>
  );
};

export default Comments;
