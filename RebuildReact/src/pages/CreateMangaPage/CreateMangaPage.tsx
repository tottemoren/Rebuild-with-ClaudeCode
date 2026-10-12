import "./CreateMangaPage.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MainLayout from "../../components/layout/PageLayouts/MainLayout";
import FolderStrip from "./layout/FolderStrip";
import MaterialPalette from "./layout/MaterialPalette";
import {
  useMangaCanvas,
  exportMangaFrameToPng,
  downloadDataUrl,
  type PlacedKoma,
} from "../../utils/DragAndDrop";
import type { MangaPanelDto } from "../../types/MangaPanel";
import type { Story } from "../../types/Story";
import type { Dialogue } from "../../types/Dialogue";
import type { Folder } from "../../types/Folder";
import type { Material } from "../../types/Material";
import useLoginUser from "../../hooks/useLoginUser";
import { resolveImageSrc } from "../../utils/imageSrc";

// 固定のキャンバス枠のサイズ（このサイズのまま画像として書き出す）
// blankpaper.png の実寸（1057×748、横長）に合わせている
const CANVAS_WIDTH = 1057;
const CANVAS_HEIGHT = 748;

const BLANK_PAPER_SRC = "/images/settingimages/blankpaper.png";

export default function CreateMangaPage() {
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [story, setStory] = useState<Story | null>(null);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [showDialogues, setShowDialogues] = useState(false);

  const loginUser = useLoginUser();

  const [searchParams] = useSearchParams();
  const storyIdParam = searchParams.get("storyId");
  const storyId = storyIdParam ? Number(storyIdParam) : null;

  const folderIdParam = searchParams.get("folderId");

  const [folders, setFolders] = useState<Folder[]>([]);
  const [materialsByFolder, setMaterialsByFolder] = useState<
    Record<number, Material[]>
  >({});
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(
    folderIdParam ? Number(folderIdParam) : null
  );

  // キャンバス（640×900固定）を、実際に表示できる領域に収まるよう縮小するための倍率
  const canvasAreaRef = useRef<HTMLDivElement | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;

    const updateScale = () => {
      const availableWidth = area.clientWidth;
      const availableHeight = area.clientHeight;

      const scale = Math.min(
        availableWidth / CANVAS_WIDTH,
        availableHeight / CANVAS_HEIGHT,
        1 // 表示領域が十分広い場合でも、実寸より拡大はしない
      );

      setCanvasScale(scale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(area);

    return () => observer.disconnect();
  }, []);

  const {
    canvasRef,
    panels,
    setPanels,
    selectedId,
    deselect,
    handleKomaDragStart,
    handleCanvasDragOver,
    handleCanvasDrop,
    handlePanelPointerDown,
    handlePanelPointerMove,
    handlePanelPointerUp,
    bringToFront,
    deletePanel,
  } = useMangaCanvas([], canvasScale);

  // storyId がURLに付いている場合は、保存済みのコマ配置を読み込む
  useEffect(() => {
    if (!storyId) return;

    // storyId が変わるたびに読み込み中フラグを立てるため、意図的に同期的にsetStateしている
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/manga-panels?storyId=${storyId}`)
      .then((response) => response.json())
      .then((data: MangaPanelDto[]) => {
        const loaded: PlacedKoma[] = data.map((item) => ({
          id: String(item.id),
          imageSrc: item.imageSrc,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          zIndex: item.zIndex,
        }));

        setPanels(loaded);
      })
      .catch(() => {
        setStatusMessage("コマ配置の読み込みに失敗しました");
      })
      .finally(() => setIsLoading(false));
    // setPanels は useMangaCanvas から返る安定した関数なので依存配列には含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  // storyId に対応するストーリー情報・セリフを取得する
  // （個別取得APIが無いため、一覧を取得してidで絞り込む。TopicChoice画面と同じ方式）
  useEffect(() => {
    if (!storyId) return;

    fetch(`${import.meta.env.VITE_API_BASE_URL}/stories`)
      .then((response) => response.json())
      .then((data: Story[]) => {
        const found = data.find((item) => item.id === storyId);
        setStory(found ?? null);
      });

    fetch(`${import.meta.env.VITE_API_BASE_URL}/dialogues?storyId=${storyId}`)
      .then((response) => response.json())
      .then((data: Dialogue[]) => setDialogues(data));
  }, [storyId]);

  // ユーザーの素材フォルダと、各フォルダの素材を取得する
  // （フォルダ帯の表紙に1枚目の素材を使うため、全フォルダ分をまとめて読み込む）
  useEffect(() => {
    if (!loginUser.id) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL;

    fetch(`${apiBase}/api/folders?userId=${loginUser.id}`)
      .then((response) => response.json())
      .then(async (data: Folder[]) => {
        setFolders(data);

        const entries = await Promise.all(
          data.map(async (folder) => {
            const response = await fetch(`${apiBase}/api/folders/${folder.id}/materials`);
            const materials: Material[] = await response.json();
            return [folder.id, materials] as const;
          })
        );

        setMaterialsByFolder(Object.fromEntries(entries));

        // URLでフォルダが指定されていなければ、1つ目のフォルダを選んでおく
        setSelectedFolderId((current) => current ?? data[0]?.id ?? null);
      })
      .catch(() => {
        setStatusMessage("素材フォルダの読み込みに失敗しました");
      });
  }, [loginUser.id]);

  const handleSave = async () => {
    if (!storyId) {
      setStatusMessage(
        "保存するにはストーリーが必要です（URLに ?storyId=<ストーリーID> を付けてアクセスしてください）"
      );
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/manga-panels?storyId=${storyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            panels.map((panel) => ({
              imageSrc: panel.imageSrc,
              x: panel.x,
              y: panel.y,
              width: panel.width,
              height: panel.height,
              zIndex: panel.zIndex,
            }))
          ),
        }
      );

      if (response.ok) {
        setStatusMessage("コマ配置を保存しました");
      } else {
        setStatusMessage("保存に失敗しました");
      }
    } catch {
      setStatusMessage("保存に失敗しました（通信エラー）");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPanel = panels.find((panel) => panel.id === selectedId);

  const selectedFolder =
    folders.find((folder) => folder.id === selectedFolderId) ?? null;

  const coverUrls: Record<number, string> = {};
  for (const [folderId, materials] of Object.entries(materialsByFolder)) {
    if (materials.length > 0) {
      coverUrls[Number(folderId)] = materials[0].url;
    }
  }

  // ジャンルは「職業 天才 葛藤」のように空白区切りで保存されているため、タグに分けて表示する
  const genres = story?.genre ? story.genre.split(/\s+/).filter(Boolean) : [];

  const handleExportPng = async () => {
    try {
      const dataUrl = await exportMangaFrameToPng({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundSrc: BLANK_PAPER_SRC,
        panels,
      });

      downloadDataUrl(dataUrl, "manga.png");
    } catch {
      setStatusMessage("画像の書き出しに失敗しました");
    }
  };

  return (
    <MainLayout
      showAdvertisement={false}
      headerContent={
        <div className="CreateMangaPage-top">
          <div className="CreateMangaPage-thema">
            {story ? (
              <>
                <h3>{story.title || "（無題）"}</h3>
                <p className="CreateMangaPage-thema-summary">{story.summary}</p>

                <div className="CreateMangaPage-thema-footer">
                  {genres.length > 0 && (
                    <ul className="CreateMangaPage-genres" aria-label="ジャンル">
                      {genres.map((genre) => (
                        <li key={genre} className="CreateMangaPage-genre">{genre}</li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    className="CreateMangaPage-dialogue-toggle"
                    onClick={() => setShowDialogues((prev) => !prev)}
                  >
                    {showDialogues ? "セリフを閉じる" : "セリフを見る"}
                  </button>
                </div>

                {showDialogues && (
                  <div className="CreateMangaPage-dialogue-list">
                    {dialogues.length === 0 && <p>セリフがありません</p>}

                    {dialogues.map((dialogue) => (
                      <p key={dialogue.id}>
                        <strong>{dialogue.talkerName}</strong>：{dialogue.line}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="CreateMangaPage-thema-empty">
                <p>ストーリーが選ばれていません</p>
                <button
                  type="button"
                  className="CreateMangaPage-dialogue-toggle"
                  onClick={() => navigate("/TopicChoice")}
                >
                  ストーリー選択に戻る
                </button>
              </div>
            )}
          </div>

          <FolderStrip
            folders={folders}
            coverUrls={coverUrls}
            selectedFolderId={selectedFolderId}
            onSelect={setSelectedFolderId}
          />
        </div>
      }
    >
      <div className="CreateMangaPage-body">

      {/* 中央：固定枠のキャンバス */}
      <div className="CreateMangaPage-canvas-area">
        {/* ツールバー分の高さを除いた、キャンバスに使える領域を測るための箱 */}
        <div className="CreateMangaPage-canvas-measure" ref={canvasAreaRef}>
        {/* 表示領域の分だけ場所を確保するための箱（実寸 × 縮小率のサイズ） */}
        <div
          className="CreateMangaPage-canvas-scale-wrapper"
          style={{
            width: CANVAS_WIDTH * canvasScale,
            height: CANVAS_HEIGHT * canvasScale,
          }}
        >
          <div
            ref={canvasRef}
            className="CreateMangaPage-left"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${canvasScale})`,
              transformOrigin: "top left",
            }}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onClick={deselect}
          >
          <img className="blankpaper" src={BLANK_PAPER_SRC} alt="blankpaper" />

          {panels.map((panel) => (
            <img
              key={panel.id}
              src={resolveImageSrc(panel.imageSrc)}
              alt="配置したコマ"
              className={
                "placed-koma" + (selectedId === panel.id ? " selected" : "")
              }
              style={{
                left: panel.x,
                top: panel.y,
                width: panel.width,
                height: panel.height,
                zIndex: panel.zIndex,
              }}
              onPointerDown={(event) => {
                bringToFront(panel.id);
                handlePanelPointerDown(event, panel.id);
              }}
              onPointerMove={handlePanelPointerMove}
              onPointerUp={handlePanelPointerUp}
            />
          ))}

          {selectedId && selectedPanel && (
            <button
              type="button"
              className="delete-koma-button"
              style={{
                left: selectedPanel.x + selectedPanel.width - 12,
                top: selectedPanel.y,
              }}
              onClick={(event) => {
                event.stopPropagation();
                deletePanel(selectedId);
              }}
            >
              ×
            </button>
          )}
          </div>
        </div>
        </div>

        <div className="CreateMangaPage-toolbar">
          <button
            type="button"
            className="CreateMangaPage-secondary-button"
            onClick={handleExportPng}
          >
            画像として保存
          </button>

          <button
            type="button"
            className="CreateMangaPage-primary-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "保存中..." : "サーバーに保存"}
          </button>

          {isLoading && <span>読み込み中...</span>}
          {statusMessage && (
            <span className="status-message">{statusMessage}</span>
          )}
        </div>
      </div>

      {/* 右：ドラッグ元のコマ素材 */}
      <MaterialPalette
        folderName={selectedFolder?.name ?? null}
        materials={
          selectedFolderId !== null ? materialsByFolder[selectedFolderId] ?? [] : []
        }
        onDragStart={handleKomaDragStart}
      />

      </div>
    </MainLayout>
  );
}
