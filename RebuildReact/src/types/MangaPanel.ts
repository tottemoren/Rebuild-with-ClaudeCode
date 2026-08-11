// バックエンド（MangaPanel エンティティ）とやり取りする際の型
export type MangaPanelDto = {
  id: number;
  storyId: number;
  imageSrc: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};
