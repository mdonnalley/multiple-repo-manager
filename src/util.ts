export function getToken(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN must be set in the environment');
  }
  return token;
}
