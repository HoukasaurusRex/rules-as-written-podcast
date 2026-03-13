export default async ({ github, context }) => {
  const deployment = await github.rest.repos.createDeployment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: context.sha,
    environment: 'production',
    auto_merge: false,
    required_contexts: [],
    production_environment: true,
  })

  if (deployment.data.id) {
    await github.rest.repos.createDeploymentStatus({
      owner: context.repo.owner,
      repo: context.repo.repo,
      deployment_id: deployment.data.id,
      state: 'success',
      environment_url: 'https://rulesaswrittenshow.com',
      log_url: `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`,
    })
  }
}
