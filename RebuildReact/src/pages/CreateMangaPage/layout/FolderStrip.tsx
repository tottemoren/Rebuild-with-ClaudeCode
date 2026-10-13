import type { Folder } from "../../../types/Folder";
import { resolveImageSrc } from "../../../utils/imageSrc";

type FolderStripProps = {
  folders: Folder[];
  // フォルダID → 表紙にする素材の住所（素材が無いフォルダは含まれない）
  coverUrls: Record<number, string>;
  selectedFolderId: number | null;
  onSelect: (folderId: number) => void;
};

function FolderStrip({
  folders,
  coverUrls,
  selectedFolderId,
  onSelect,
}: FolderStripProps) {

  if (folders.length === 0) {
    return (
      <p className="FolderStrip-empty">
        素材フォルダがありません。ストーリー選択画面で作成できます。
      </p>
    );
  }

  return (
    <ul className="FolderStrip" aria-label="素材フォルダ">
      {folders.map((folder) => {
        const isSelected = folder.id === selectedFolderId;
        const coverUrl = coverUrls[folder.id];

        return (
          <li key={folder.id}>
            <button
              type="button"
              className={"FolderStrip-item" + (isSelected ? " is-active" : "")}
              aria-pressed={isSelected}
              onClick={() => onSelect(folder.id)}
            >
              <span className="FolderStrip-cover">
                {coverUrl ? (
                  <img src={resolveImageSrc(coverUrl)} alt="" />
                ) : (
                  <svg
                    className="FolderStrip-cover-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    data-testid="folder-cover-icon"
                  >
                    <path d="M3.5 6.5h6l2 2h9v10h-17z" />
                  </svg>
                )}
              </span>
              <span className="FolderStrip-name">{folder.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default FolderStrip;
