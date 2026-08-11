// CreateMangaPage 用のドラッグ&ドロップ・配置管理ロジック。
//
// 元々は onDrop 内で document.createElement("img") を使って直接DOMに要素を
// 追加する実装（Reactの外側でDOMを操作している状態）だった。
// ここでは配置したコマ画像を React の state で管理し、
// ・キャンバスへのドロップで新規配置
// ・配置済み画像のドラッグでの移動
// ・選択して削除
// ができるようにしている。

import { useCallback, useEffect, useRef, useState } from "react";

export type PlacedKoma = {
  id: string;
  imageSrc: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

const DEFAULT_KOMA_SIZE = 140;

export function useMangaCanvas(initialPanels: PlacedKoma[] = []) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [panels, setPanels] = useState<PlacedKoma[]>(initialPanels);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const panelsRef = useRef<PlacedKoma[]>(panels);
  const nextZIndex = useRef(1);

  const dragInfo = useRef<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    panelsRef.current = panels;

    const maxZ = panels.reduce(
      (max, panel) => Math.max(max, panel.zIndex),
      0
    );

    nextZIndex.current = maxZ + 1;
  }, [panels]);

  // 右メニューのコマ画像をドラッグし始めたとき
  const handleKomaDragStart = useCallback(
    (event: React.DragEvent<HTMLImageElement>, imageSrc: string) => {
      event.dataTransfer.setData("text/plain", imageSrc);
      event.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const handleCanvasDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  // キャンバスにドロップされたら、その位置に新しいコマを配置する
  const handleCanvasDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const imageSrc = event.dataTransfer.getData("text/plain");

      if (!imageSrc || !canvasRef.current) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();

      const x = event.clientX - rect.left - DEFAULT_KOMA_SIZE / 2;
      const y = event.clientY - rect.top - DEFAULT_KOMA_SIZE / 2;

      const newPanel: PlacedKoma = {
        id: `panel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        imageSrc,
        x: Math.min(Math.max(0, x), rect.width - DEFAULT_KOMA_SIZE),
        y: Math.min(Math.max(0, y), rect.height - DEFAULT_KOMA_SIZE),
        width: DEFAULT_KOMA_SIZE,
        height: DEFAULT_KOMA_SIZE,
        zIndex: nextZIndex.current++,
      };

      setPanels((prev) => [...prev, newPanel]);
      setSelectedId(newPanel.id);
    },
    []
  );

  // 配置済みコマ画像のドラッグ移動（ポインタでの掴んで動かす）
  const handlePanelPointerDown = useCallback(
    (event: React.PointerEvent<HTMLImageElement>, id: string) => {
      event.stopPropagation();

      setSelectedId(id);

      const panel = panelsRef.current.find((p) => p.id === id);
      if (!panel) return;

      event.currentTarget.setPointerCapture(event.pointerId);

      dragInfo.current = {
        id,
        startX: event.clientX,
        startY: event.clientY,
        originX: panel.x,
        originY: panel.y,
      };
    },
    []
  );

  const handlePanelPointerMove = useCallback(
    (event: React.PointerEvent<HTMLImageElement>) => {
      const info = dragInfo.current;
      if (!info || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const panel = panelsRef.current.find((p) => p.id === info.id);
      if (!panel) return;

      const dx = event.clientX - info.startX;
      const dy = event.clientY - info.startY;

      const nextX = Math.min(
        Math.max(0, info.originX + dx),
        rect.width - panel.width
      );

      const nextY = Math.min(
        Math.max(0, info.originY + dy),
        rect.height - panel.height
      );

      setPanels((prev) =>
        prev.map((p) =>
          p.id === info.id ? { ...p, x: nextX, y: nextY } : p
        )
      );
    },
    []
  );

  const handlePanelPointerUp = useCallback(
    (event: React.PointerEvent<HTMLImageElement>) => {
      if (dragInfo.current) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      dragInfo.current = null;
    },
    []
  );

  const bringToFront = useCallback((id: string) => {
    setPanels((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, zIndex: nextZIndex.current++ } : p
      )
    );
  }, []);

  const deletePanel = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }, []);

  const deselect = useCallback(() => {
    setSelectedId(null);
  }, []);

  return {
    canvasRef,
    panels,
    setPanels,
    selectedId,
    selectPanel: setSelectedId,
    deselect,
    handleKomaDragStart,
    handleCanvasDragOver,
    handleCanvasDrop,
    handlePanelPointerDown,
    handlePanelPointerMove,
    handlePanelPointerUp,
    bringToFront,
    deletePanel,
  };
}

// ------------------------------------------------------
// 固定枠（キャンバス）を1枚のPNG画像として書き出す
// ------------------------------------------------------

type ExportFrameOptions = {
  width: number;
  height: number;
  backgroundSrc: string;
  panels: PlacedKoma[];
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`画像の読み込みに失敗しました: ${src}`));
    img.src = src;
  });
}

export async function exportMangaFrameToPng(
  options: ExportFrameOptions
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = options.width;
  canvas.height = options.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("このブラウザはCanvasに対応していません");
  }

  const background = await loadImage(options.backgroundSrc);
  ctx.drawImage(background, 0, 0, options.width, options.height);

  const sortedPanels = [...options.panels].sort(
    (a, b) => a.zIndex - b.zIndex
  );

  for (const panel of sortedPanels) {
    const image = await loadImage(panel.imageSrc);
    ctx.drawImage(image, panel.x, panel.y, panel.width, panel.height);
  }

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
