"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { PdfRegionDraft } from "./doc-template-configure-step";

type Props = {
  fileBase64?: string;
  fileUrl?: string;
  regions: PdfRegionDraft[];
  onAddRegion: (region: PdfRegionDraft) => void;
  onSelectRegion?: (index: number) => void;
  selectedRegionIndex?: number;
};

type PageInfo = { width: number; height: number };

const REGION_COLORS = [
  "rgba(59,130,246,0.25)",  // blue
  "rgba(16,185,129,0.25)",  // green
  "rgba(245,158,11,0.25)",  // amber
  "rgba(239,68,68,0.25)",   // red
  "rgba(139,92,246,0.25)",  // violet
  "rgba(236,72,153,0.25)",  // pink
];

const REGION_BORDER_COLORS = [
  "rgba(59,130,246,0.8)",
  "rgba(16,185,129,0.8)",
  "rgba(245,158,11,0.8)",
  "rgba(239,68,68,0.8)",
  "rgba(139,92,246,0.8)",
  "rgba(236,72,153,0.8)",
];

/**
 * Interactive PDF canvas viewer.
 * Renders a PDF page, shows region overlays, displays coordinates on hover,
 * and allows click-to-place new regions.
 */
export function DocTemplatePdfCanvasViewer({
  fileBase64,
  fileUrl,
  regions,
  onAddRegion,
  onSelectRegion,
  selectedRegionIndex,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [scale, setScale] = useState(1);
  const [mousePos, setMousePos] = useState<{ pdfX: number; pdfY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ pdfX: number; pdfY: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ pdfX: number; pdfY: number } | null>(null);
  const pdfDocRef = useRef<unknown>(null);

  // Load and render PDF
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      const pdfjsLib = await import("pdfjs-dist");
      // Use bundled worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      // Load from URL (blob storage) or base64 (legacy/new upload)
      const source = fileUrl
        ? { url: fileUrl }
        : { data: Uint8Array.from(atob(fileBase64!), (c) => c.charCodeAt(0)) };
      const pdf = await pdfjsLib.getDocument(source).promise;
      if (cancelled) return;
      pdfDocRef.current = pdf;

      const page = await pdf.getPage(1);
      if (cancelled) return;

      const viewport = page.getViewport({ scale: 1 });
      const pdfWidth = viewport.width;
      const pdfHeight = viewport.height;
      setPageInfo({ width: pdfWidth, height: pdfHeight });

      // Calculate scale to fit container (max ~800px wide)
      const containerWidth = containerRef.current?.clientWidth ?? 800;
      const fitScale = Math.min(containerWidth / pdfWidth, 1.5);
      setScale(fitScale);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const scaledViewport = page.getViewport({ scale: fitScale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      await page.render({ canvas, viewport: scaledViewport }).promise;
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [fileBase64, fileUrl]);

  // Convert pixel position on canvas to PDF coordinates (origin bottom-left)
  const pixelToPdf = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !pageInfo) return null;
      const rect = canvas.getBoundingClientRect();
      const pixelX = clientX - rect.left;
      const pixelY = clientY - rect.top;
      // PDF coordinate: x from left, y from bottom
      const pdfX = Math.round((pixelX / scale) * 10) / 10;
      const pdfY = Math.round(((canvas.height / scale) - (pixelY / scale)) * 10) / 10;
      return { pdfX, pdfY };
    },
    [scale, pageInfo]
  );

  // Convert PDF coordinates to pixel position on canvas
  const pdfToPixel = useCallback(
    (pdfX: number, pdfY: number) => {
      if (!pageInfo) return { x: 0, y: 0 };
      const x = pdfX * scale;
      // PDF y is from bottom, canvas y is from top
      const y = (pageInfo.height - pdfY) * scale;
      return { x, y };
    },
    [scale, pageInfo]
  );

  function handleMouseMove(e: React.MouseEvent) {
    const pos = pixelToPdf(e.clientX, e.clientY);
    if (pos) {
      setMousePos(pos);
      if (isDragging && dragStart) {
        setDragCurrent(pos);
      }
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    const pos = pixelToPdf(e.clientX, e.clientY);
    if (!pos) return;
    setIsDragging(true);
    setDragStart(pos);
    setDragCurrent(pos);
  }

  function handleMouseUp() {
    if (!isDragging || !dragStart || !dragCurrent) {
      setIsDragging(false);
      return;
    }

    const x = Math.min(dragStart.pdfX, dragCurrent.pdfX);
    const y = Math.min(dragStart.pdfY, dragCurrent.pdfY);
    const x2 = Math.max(dragStart.pdfX, dragCurrent.pdfX);
    const y2 = Math.max(dragStart.pdfY, dragCurrent.pdfY);
    const width = x2 - x;
    const height = y2 - y;

    // Only create region if drag area is large enough (at least 10x5 PDF points)
    if (width >= 10 && height >= 5) {
      const newRegion: PdfRegionDraft = {
        id: `region_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        label: "",
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
        fontSize: 10,
        type: "text",
      };
      onAddRegion(newRegion);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  }

  // Region overlay rectangles
  function renderRegions() {
    if (!pageInfo) return null;
    return regions.map((region, idx) => {
      const topLeft = pdfToPixel(region.x, region.y + region.height);
      const w = region.width * scale;
      const h = region.height * scale;
      const colorIdx = idx % REGION_COLORS.length;
      const isSelected = selectedRegionIndex === idx;

      return (
        <div
          key={region.id}
          className="absolute cursor-pointer"
          style={{
            left: topLeft.x,
            top: topLeft.y,
            width: w,
            height: h,
            backgroundColor: REGION_COLORS[colorIdx],
            border: `2px solid ${isSelected ? "rgba(255,255,255,0.9)" : REGION_BORDER_COLORS[colorIdx]}`,
            boxShadow: isSelected ? "0 0 0 2px rgba(59,130,246,1)" : undefined,
            zIndex: isSelected ? 10 : 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectRegion?.(idx);
          }}
          title={region.label || `Vùng #${idx + 1}`}
        >
          <span
            className="absolute -top-5 left-0 text-[10px] font-medium px-1 rounded whitespace-nowrap"
            style={{
              backgroundColor: REGION_BORDER_COLORS[colorIdx],
              color: "white",
            }}
          >
            {region.label || `#${idx + 1}`}
          </span>
        </div>
      );
    });
  }

  // Current drag preview
  function renderDragPreview() {
    if (!isDragging || !dragStart || !dragCurrent || !pageInfo) return null;
    const x = Math.min(dragStart.pdfX, dragCurrent.pdfX);
    const y = Math.min(dragStart.pdfY, dragCurrent.pdfY);
    const x2 = Math.max(dragStart.pdfX, dragCurrent.pdfX);
    const y2 = Math.max(dragStart.pdfY, dragCurrent.pdfY);
    const topLeft = pdfToPixel(x, y2);
    const w = (x2 - x) * scale;
    const h = (y2 - y) * scale;

    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: topLeft.x,
          top: topLeft.y,
          width: w,
          height: h,
          backgroundColor: "rgba(59,130,246,0.15)",
          border: "2px dashed rgba(59,130,246,0.7)",
        }}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Xem trước PDF - Kéo chuột để tạo vùng</p>
        {mousePos && (
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
            X: {mousePos.pdfX.toFixed(1)} &nbsp; Y: {mousePos.pdfY.toFixed(1)}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative rounded-lg border overflow-hidden bg-gray-100 select-none"
        style={{ cursor: isDragging ? "crosshair" : "crosshair" }}
      >
        <canvas ref={canvasRef} className="block" />
        <div
          ref={overlayRef}
          className="absolute inset-0"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setMousePos(null);
            if (isDragging) {
              handleMouseUp();
            }
          }}
        >
          {renderRegions()}
          {renderDragPreview()}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Kéo chuột trên PDF để tạo vùng mới. Click vào vùng đã tạo để chọn. Tọa độ tính từ góc dưới trái (đơn vị: PDF points).
      </p>
    </div>
  );
}
