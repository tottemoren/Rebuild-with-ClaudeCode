import "./CreateMangaPage.css";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import LayoutHeaderSimple from "../../components/layout/PageLayouts/NoRightMenu/NoRightAndSimpleHeader";
import RightMenuKoma, { type CharacterKey } from "./layout/RightMenuKoma";
import {
  useMangaCanvas,
  exportMangaFrameToPng,
  downloadDataUrl,
  type PlacedKoma,
} from "../../utils/DragAndDrop";
import type { MangaPanelDto } from "../../types/MangaPanel";

// 固定のキャンバス枠のサイズ（このサイズのまま画像として書き出す）
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 900;

const BLANK_PAPER_SRC = "/images/settingimages/blankpaper.png";

const CHARACTER_THUMBNAILS: Record<CharacterKey, { src: string; alt: string }> = {
  yonagi: {
    src: "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/YonagiKei_1/0_YonagiKei.png",
    alt: "Yonagi",
  },
  arisa: {
    src: "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/HosiArisa_1/0_HosiArisa.png",
    alt: "Arisa",
  },
  nagisa: {
    src: "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/SatukiNagisa_1/0_SatsukiNagisa.png",
    alt: "Nagisa",
  },
};

export default function CreateMangaPage() {
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterKey>("yonagi");

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const storyIdParam = searchParams.get("storyId");
  const storyId = storyIdParam ? Number(storyIdParam) : null;

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
  } = useMangaCanvas();

  // storyId がURLに付いている場合は、保存済みのコマ配置を読み込む
  useEffect(() => {
    if (!storyId) return;

    setIsLoading(true);

    fetch(`http://localhost:8080/api/manga-panels?storyId=${storyId}`)
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
        `http://localhost:8080/api/manga-panels?storyId=${storyId}`,
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
    <LayoutHeaderSimple
      headerContent={
        <div className="CreateMangaPage-top">
          <div className="CreateMangaPage-thema">
            <h3>【プロを名乗るなら】</h3>
            <p>俳優として成長していく主人公。しかしそこには立ちはだかる壁が</p>
            <p>
              ------------------------------------------------------------
            </p>
            <p>ジャンル 「職業」「天才」「葛藤」</p>
          </div>

          {/* キャラ選択 */}
          <div className="CreateMangaPage-character">
            {(Object.keys(CHARACTER_THUMBNAILS) as CharacterKey[]).map(
              (character) => (
                <button
                  key={character}
                  type="button"
                  className={
                    selectedCharacter === character ? "active" : ""
                  }
                  onClick={() => setSelectedCharacter(character)}
                >
                  <img
                    src={CHARACTER_THUMBNAILS[character].src}
                    alt={CHARACTER_THUMBNAILS[character].alt}
                  />
                </button>
              )
            )}
          </div>
        </div>
      }
    >
      <div className="CreateMangaPage-body">

      {/* 中央：固定枠のキャンバス */}
      <div className="CreateMangaPage-canvas-area">
        <div
          ref={canvasRef}
          className="CreateMangaPage-left"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onClick={deselect}
        >
          <img className="blankpaper" src={BLANK_PAPER_SRC} alt="blankpaper" />

          {panels.map((panel) => (
            <img
              key={panel.id}
              src={panel.imageSrc}
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

        <div className="CreateMangaPage-toolbar">
          <button type="button" onClick={handleExportPng}>
            画像として保存
          </button>

          <button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "サーバーに保存"}
          </button>

          {isLoading && <span>読み込み中...</span>}
          {statusMessage && (
            <span className="status-message">{statusMessage}</span>
          )}
        </div>
      </div>

      {/* 右：ドラッグ元のコマ素材 */}
      <RightMenuKoma
        selectedCharacter={selectedCharacter}
        onDragStart={handleKomaDragStart}
      />

      </div>
    </LayoutHeaderSimple>
  );
}
