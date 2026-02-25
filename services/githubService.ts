import { RepoData } from '../types';

const AVATAR_PROXY_PATH = '/api/avatar';

const toAvatarProxyUrl = (avatarUrl: string, owner: string) =>
  `${AVATAR_PROXY_PATH}?url=${encodeURIComponent(avatarUrl)}&owner=${encodeURIComponent(owner)}`;

interface AvatarProxyResponse {
  dataUrl?: string;
}

const isDataImageUrl = (value: string) => value.startsWith('data:image/');

// Read data URL from same-origin avatar proxy to avoid direct dependency
// on blocked external avatar domains.
async function fetchAvatarDataUrl(avatarUrl: string, owner: string): Promise<string> {
  const proxyUrl = toAvatarProxyUrl(avatarUrl, owner);

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      console.error('Failed to fetch avatar:', response.status);
      return '';
    }

    const payload = (await response.json()) as AvatarProxyResponse;
    if (typeof payload.dataUrl === 'string' && isDataImageUrl(payload.dataUrl)) {
      return payload.dataUrl;
    }

    return '';
  } catch (error) {
    console.error('Error fetching avatar data URL', error);
    return '';
  }
}

export async function fetchRepoDetails(repoUrlStr: string): Promise<RepoData> {
  const response = await fetch(`/api/github?repo=${encodeURIComponent(repoUrlStr)}`);

  if (!response.ok) {
    let message = 'Failed to fetch repository.';
    try {
      const errorJson = await response.json();
      if (errorJson?.message) message = errorJson.message;
    } catch {
      // Use default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  const avatarDataUrl = await fetchAvatarDataUrl(data.avatarUrl, data.owner);

  return {
    owner: data.owner,
    name: data.name,
    description: data.description,
    stars: data.stars,
    forks: data.forks,
    issues: data.issues,
    language: data.language,
    languages: data.languages,
    avatarUrl: avatarDataUrl || data.avatarUrl,
  };
}
