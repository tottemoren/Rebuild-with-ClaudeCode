// 右メニュー：選択中のフォルダに入っている素材の一覧。
// ドラッグ元となる画像を表示するだけの、状態を持たないコンポーネント。
// どの素材を表示するかとドラッグ開始時の処理は、親（CreateMangaPage）から受け取る。

import type { Material } from "../../../types/Material";
import { resolveImageSrc } from "../../../utils/imageSrc";

type MaterialPaletteProps = {
  folderName: string | null;
  materials: Material[];
  onDragStart: (
    event: React.DragEvent<HTMLImageElement>,
    imageSrc: string
  ) => void;
};

function MaterialPalette({
  folderName,
  materials,
  onDragStart,
}: MaterialPaletteProps) {
  return (
    <aside className="CreateMangaPage-right" aria-label="素材一覧">

      <div className="MaterialPalette-head">
        <h2 className="MaterialPalette-title">{folderName ?? "素材"}</h2>
        {folderName !== null && (
          <span className="MaterialPalette-count">{materials.length} 点</span>
        )}
      </div>

      {folderName === null ? (
        <p className="MaterialPalette-empty">
          上のフォルダを選ぶと、素材が表示されます。
        </p>
      ) : materials.length === 0 ? (
        <p className="MaterialPalette-empty">
          このフォルダには素材がありません。ストーリー選択画面で追加できます。
        </p>
      ) : (
        <ul className="MaterialPalette-list">
          {materials.map((material) => (
            <li key={material.id}>
              {/* DBにはサーバー名を含まない住所（/uploads/...）で保存するため、material.url をそのまま渡す */}
              <img
                className="MaterialPalette-image"
                src={resolveImageSrc(material.url)}
                alt={material.fileName}
                draggable="true"
                onDragStart={(event) => onDragStart(event, material.url)}
              />
            </li>
          ))}
        </ul>
      )}

    </aside>
  );
}

export default MaterialPalette;
