import { NextResponse } from 'next/server';

const GITHUB_API_ENDPOINT = 'https://api.github.com';

const normalizeRepoInput = (input: string) => {
  const cleanUrl = input.replace('https://github.com/', '').replace(/\/$/, '');
  const [owner, repo] = cleanUrl.split('/');
  return { owner, repo };
};

const mapGitHubError = (status: number, bodyText: string) => {
  if (status === 404) return 'Repository not found.';
  if (status === 401) return 'GitHub token is invalid or missing.';
  if (status === 403) {
    if (bodyText.toLowerCase().includes('rate limit')) {
      return 'GitHub API rate limit exceeded. Configure GITHUB_TOKEN on the server.';
    }
    return 'Access to this repository is forbidden.';
  }
  return 'Failed to fetch repository.';
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const repoInput = searchParams.get('repo')?.trim();

  if (!repoInput) {
    return NextResponse.json(
      { message: 'Missing "repo" query parameter.' },
      { status: 400 }
    );
  }

  const { owner, repo } = normalizeRepoInput(repoInput);
  if (!owner || !repo) {
    return NextResponse.json(
      { message: 'Invalid repository format. Use "owner/repo".' },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const repoResponse = await fetch(`${GITHUB_API_ENDPOINT}/repos/${owner}/${repo}`, {
    headers,
    cache: 'no-store',
  });

  if (!repoResponse.ok) {
    const errorText = await repoResponse.text();
    return NextResponse.json(
      { message: mapGitHubError(repoResponse.status, errorText) },
      { status: repoResponse.status }
    );
  }

  const repoData = await repoResponse.json();

  let languages: string[] = [];
  try {
    const langResponse = await fetch(repoData.languages_url, {
      headers,
      cache: 'no-store',
    });
    if (langResponse.ok) {
      const langData = await langResponse.json();
      languages = Object.keys(langData).slice(0, 3);
    }
  } catch {
    languages = [];
  }

  return NextResponse.json(
    {
      owner: repoData.owner?.login ?? owner,
      name: repoData.name ?? repo,
      description: repoData.description,
      stars: repoData.stargazers_count ?? 0,
      forks: repoData.forks_count ?? 0,
      issues: repoData.open_issues_count ?? 0,
      language: repoData.language ?? null,
      languages,
      avatarUrl: repoData.owner?.avatar_url ?? '',
    },
    { status: 200 }
  );
}
