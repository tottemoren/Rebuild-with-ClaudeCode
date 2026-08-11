export type User = {

  id: number;

  username: string;

  // パスワードはサーバーから返ってこない（@JsonIgnoreでハッシュ値も送られない）ため
  // フロントエンドの型としても持たない

  profileImageUrl?: string | null;

};