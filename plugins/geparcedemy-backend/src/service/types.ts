export type WorkflowRuns = {
  total_count: number,
  workflow_runs: WorkflowRun[]
}

export type WorkflowRun = {
  id: number,
  name: string,
  head_branch: string,
  conclusion: string,
  pull_requests: PullRequest[]
}

export type PullRequest = {
  url: string
  comments_url: string
}

export type Comments = Comment[]
export type Comment = {
  body: string
}

export type GeparcedemyView = GeparcedemyEntry[]

export type GeparcedemyEntry = {
  buildState: string,
  devspaceUrl: string,
  title: string,
  pullRequestUrl: string,
}

// -----------
export type Branches = Branch[];
export type Branch = {
  name: string
}

export type Actions = {
  workflow_runs: Action[]
};
export type Action = {
  name: string,
  conclusion: string,
  run_number: number,
  pull_requests: PullRequest[]
}