// アップロードした素材は、バックエンドが "/uploads/..." で配信している。
// DBにはサーバー名を含めずに保存し、表示するときだけ補う（開発・本番でサーバーの住所が違っても壊れないようにするため）。
// フロントエンドの public 配下の画像（"/images/..." など）は、そのまま返す。
export function resolveImageSrc(src: string): string {
  if (src.startsWith("/uploads/")) {
    return `${import.meta.env.VITE_API_BASE_URL}${src}`;
  }

  return src;
}
