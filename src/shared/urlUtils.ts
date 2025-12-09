export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // プロトコルをhttpsに統一
    urlObj.protocol = 'https:';

    // クエリパラメータをソート
    const params = new URLSearchParams(urlObj.search);
    const sortedParams = new URLSearchParams(
      Array.from(params.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    );
    urlObj.search = sortedParams.toString();

    // フラグメントを除去
    urlObj.hash = '';

    // トレイリングスラッシュを統一（除去）
    let pathname = urlObj.pathname;
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    urlObj.pathname = pathname;

    return urlObj.toString();
  } catch (error) {
    console.error('URL normalization error:', error);
    return url;
  }
}

export function generateUrlHash(url: string): string {
  const normalized = normalizeUrl(url);
  // ブラウザ環境では crypto.subtle を使用する必要があるが、
  // 簡易的に文字列をハッシュ化する関数を使用
  return simpleHash(normalized);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}
