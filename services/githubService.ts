import { RepoData } from '../types';

// Helper to convert image URL to Base64
// We do NOT send auth headers here to avoid CORS issues with avatar domains
async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64", error);
    // Return a fallback placeholder if fetch fails
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

  // Convert avatar to base64 for SVG foreignObject CORS safety
  const avatarBase64 = await urlToBase64(data.avatarUrl);

  return {
    owner: data.owner,
    name: data.name,
    description: data.description,
    stars: data.stars,
    forks: data.forks,
    issues: data.issues,
    language: data.language,
    languages: data.languages,
    avatarUrl: avatarBase64 || data.avatarUrl,
  };
}
