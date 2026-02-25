import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Tag } from 'lucide-react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CardConfig,
  LayoutBlockId,
  LayoutRect,
  RepoData,
} from '../types';
import { useI18n } from './I18nContext';
import { CardPreview } from './CardPreview';
import { getInteractiveLayoutRects } from './cardMetrics';
import { applyRectToConfig } from './layoutTransforms';
import { BlockPopover } from './BlockPopover';

interface EditorCanvasProps {
  data: RepoData;
  config: CardConfig;
  setConfig: React.Dispatch<React.SetStateAction<CardConfig>>;
  selectedBlocks: LayoutBlockId[];
  primaryBlock: LayoutBlockId | null;
  setSelection: (blocks: LayoutBlockId[], primary?: LayoutBlockId) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onLogoUpload: (file: File) => void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

type DragState =
  | {
      mode: 'move';
      activeBlock: LayoutBlockId;
      blocks: LayoutBlockId[];
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startRects: Record<LayoutBlockId, LayoutRect>;
    }
  | {
      mode: 'resize';
      block: LayoutBlockId;
      handle: ResizeHandle;
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startRect: LayoutRect;
    };

const GRID_SIZE = 8;
const SNAP_THRESHOLD = 10;
const BLOCK_ORDER: LayoutBlockId[] = ['avatar', 'title', 'description', 'stats', 'badges'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toPercent = (value: number, max: number) => `${(value / max) * 100}%`;

const getMinimumSize = (block: LayoutBlockId) => {
  switch (block) {
    case 'avatar':
      return { minW: 40, minH: 40 };
    case 'title':
      return { minW: 140, minH: 60 };
    case 'description':
      return { minW: 220, minH: 80 };
    case 'stats':
      return { minW: 120, minH: 40 };
    case 'badges':
      return { minW: 120, minH: 28 };
    default:
      return { minW: 40, minH: 40 };
  }
};

const collectGuides = (rects: Record<LayoutBlockId, LayoutRect>, excludedBlocks: LayoutBlockId[]) => {
  const vertical = [0, CANVAS_WIDTH / 2, CANVAS_WIDTH];
  const horizontal = [0, CANVAS_HEIGHT / 2, CANVAS_HEIGHT];

  for (const block of BLOCK_ORDER) {
    if (excludedBlocks.includes(block)) continue;
    const rect = rects[block];
    vertical.push(rect.x, rect.x + rect.w / 2, rect.x + rect.w);
    horizontal.push(rect.y, rect.y + rect.h / 2, rect.y + rect.h);
  }

  return { vertical, horizontal };
};

const snapAxis = (position: number, size: number, guides: number[]) => {
  const anchors = [0, size / 2, size];
  let bestValue = position;
  let bestGuide: number | null = null;
  let bestDistance = SNAP_THRESHOLD + 1;

  for (const guide of guides) {
    for (const anchor of anchors) {
      const anchorValue = position + anchor;
      const delta = guide - anchorValue;
      const distance = Math.abs(delta);

      if (distance < bestDistance && distance <= SNAP_THRESHOLD) {
        bestDistance = distance;
        bestValue = position + delta;
        bestGuide = guide;
      }
    }
  }

  return { value: bestValue, guide: bestGuide };
};

const HANDLE_POINTS: Array<{ id: ResizeHandle; className: string }> = [
  { id: 'nw', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize' },
  { id: 'ne', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize' },
  { id: 'sw', className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize' },
  { id: 'se', className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize' },
];

const getResizedRect = (
  startRect: LayoutRect,
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
  minW: number,
  minH: number
) => {
  let x = startRect.x;
  let y = startRect.y;
  let w = startRect.w;
  let h = startRect.h;

  if (handle.includes('e')) {
    w = startRect.w + deltaX;
  }
  if (handle.includes('w')) {
    w = startRect.w - deltaX;
    x = startRect.x + deltaX;
  }
  if (handle.includes('s')) {
    h = startRect.h + deltaY;
  }
  if (handle.includes('n')) {
    h = startRect.h - deltaY;
    y = startRect.y + deltaY;
  }

  w = Math.max(minW, w);
  h = Math.max(minH, h);

  if (handle.includes('w')) {
    x = startRect.x + (startRect.w - w);
  }
  if (handle.includes('n')) {
    y = startRect.y + (startRect.h - h);
  }

  x = clamp(x, 0, CANVAS_WIDTH - w);
  y = clamp(y, 0, CANVAS_HEIGHT - h);

  return {
    x,
    y,
    w,
    h,
  };
};

const toggleBlock = (current: LayoutBlockId[], block: LayoutBlockId) => {
  if (current.includes(block)) {
    const next = current.filter((item) => item !== block);
    return next.length > 0 ? next : [block];
  }
  return [...current, block];
};

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  data,
  config,
  setConfig,
  selectedBlocks,
  primaryBlock,
  setSelection,
  svgRef,
  onLogoUpload,
}) => {
  const { messages } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [verticalGuide, setVerticalGuide] = useState<number | null>(null);
  const [horizontalGuide, setHorizontalGuide] = useState<number | null>(null);
  const [popoverBlock, setPopoverBlock] = useState<LayoutBlockId | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const closePopover = useCallback(() => {
    setPopoverBlock(null);
    setPopoverAnchor(null);
  }, []);

  const rects = useMemo(() => getInteractiveLayoutRects(config, data), [config, data]);

  const getScale = () => {
    const width = containerRef.current?.getBoundingClientRect().width;
    if (!width) return 1;
    return width / CANVAS_WIDTH;
  };

  const beginMove = (event: React.PointerEvent<HTMLButtonElement>, block: LayoutBlockId) => {
    const additive = event.shiftKey || event.ctrlKey || event.metaKey;

    if (additive) {
      const nextSelection = toggleBlock(selectedBlocks, block);
      setSelection(nextSelection, block);
      return;
    }

    const blocks = selectedBlocks.includes(block) ? selectedBlocks : [block];
    setSelection(blocks, block);

    const startRects = blocks.reduce<Record<LayoutBlockId, LayoutRect>>((acc, id) => {
      acc[id] = rects[id];
      return acc;
    }, {} as Record<LayoutBlockId, LayoutRect>);

    setDragState({
      mode: 'move',
      activeBlock: block,
      blocks,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startRects,
    });

    closePopover();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const beginResize = (
    event: React.PointerEvent<HTMLSpanElement>,
    block: LayoutBlockId,
    handle: ResizeHandle
  ) => {
    event.stopPropagation();
    setSelection([block], block);
    setDragState({
      mode: 'resize',
      block,
      handle,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startRect: rects[block],
    });
    const ownerButton = event.currentTarget.closest('button');
    if (ownerButton) {
      ownerButton.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const scale = getScale();
    const rawDeltaX = (event.clientX - dragState.startClientX) / scale;
    const rawDeltaY = (event.clientY - dragState.startClientY) / scale;

    if (dragState.mode === 'move') {
      const activeStart = dragState.startRects[dragState.activeBlock];
      let deltaX = rawDeltaX;
      let deltaY = rawDeltaY;

      const minDeltaX = Math.max(...dragState.blocks.map((block) => -dragState.startRects[block].x));
      const maxDeltaX = Math.min(
        ...dragState.blocks.map((block) => CANVAS_WIDTH - dragState.startRects[block].w - dragState.startRects[block].x)
      );
      const minDeltaY = Math.max(...dragState.blocks.map((block) => -dragState.startRects[block].y));
      const maxDeltaY = Math.min(
        ...dragState.blocks.map((block) => CANVAS_HEIGHT - dragState.startRects[block].h - dragState.startRects[block].y)
      );

      deltaX = clamp(deltaX, minDeltaX, maxDeltaX);
      deltaY = clamp(deltaY, minDeltaY, maxDeltaY);

      let activeX = activeStart.x + deltaX;
      let activeY = activeStart.y + deltaY;

      if (!event.shiftKey) {
        activeX = Math.round(activeX / GRID_SIZE) * GRID_SIZE;
        activeY = Math.round(activeY / GRID_SIZE) * GRID_SIZE;

        const guides = collectGuides(rects, dragState.blocks);
        const snappedX = snapAxis(activeX, activeStart.w, guides.vertical);
        const snappedY = snapAxis(activeY, activeStart.h, guides.horizontal);
        activeX = snappedX.value;
        activeY = snappedY.value;
        setVerticalGuide(snappedX.guide);
        setHorizontalGuide(snappedY.guide);
      } else {
        setVerticalGuide(null);
        setHorizontalGuide(null);
      }

      deltaX = clamp(activeX - activeStart.x, minDeltaX, maxDeltaX);
      deltaY = clamp(activeY - activeStart.y, minDeltaY, maxDeltaY);

      setConfig((prev) => {
        const nextLayout = { ...prev.layout };
        for (const block of dragState.blocks) {
          nextLayout[block] = {
            ...nextLayout[block],
            x: Math.round(dragState.startRects[block].x + deltaX),
            y: Math.round(dragState.startRects[block].y + deltaY),
          };
        }
        return {
          ...prev,
          layout: nextLayout,
        };
      });

      return;
    }

    const { minW, minH } = getMinimumSize(dragState.block);
    let deltaX = rawDeltaX;
    let deltaY = rawDeltaY;

    if (!event.shiftKey) {
      deltaX = Math.round(deltaX / GRID_SIZE) * GRID_SIZE;
      deltaY = Math.round(deltaY / GRID_SIZE) * GRID_SIZE;
    }

    const nextRect = getResizedRect(dragState.startRect, dragState.handle, deltaX, deltaY, minW, minH);

    setConfig((prev) => applyRectToConfig(prev, data, dragState.block, nextRect));

    setVerticalGuide(null);
    setHorizontalGuide(null);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragState(null);
    setVerticalGuide(null);
    setHorizontalGuide(null);
  };

  const onBlockClick = (event: React.MouseEvent<HTMLButtonElement>, block: LayoutBlockId) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      const nextSelection = toggleBlock(selectedBlocks, block);
      setSelection(nextSelection, block);
      closePopover();
      return;
    }

    setSelection([block], block);

    // Open popover anchored to the clicked button
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPopoverBlock(block);
    setPopoverAnchor(buttonRect);
  };

  return (
    <div className="editor-canvas w-full max-w-[1100px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1">
          {messages.editorCanvas.canvasMeta}
        </span>
        <button
          type="button"
          onClick={() => setShowLabels((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors ${
            showLabels
              ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
              : 'border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50'
          }`}
          title={showLabels ? messages.editorCanvas.hideLabels : messages.editorCanvas.showLabels}
        >
          <Tag className="h-3.5 w-3.5" />
          {showLabels ? messages.editorCanvas.hideLabels : messages.editorCanvas.showLabels}
        </button>
      </div>

      <div className="rounded-xl bg-zinc-50 p-2">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-lg bg-white shadow-sm"
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
        >
          <CardPreview ref={svgRef} data={data} config={config} />

        <div
          className="absolute inset-0"
          onClick={() => { setSelection([]); closePopover(); }}
        />
        <div className="pointer-events-none absolute inset-0">
          {verticalGuide !== null && (
            <div
              className="absolute top-0 h-full w-px bg-emerald-400/80"
              style={{ left: toPercent(verticalGuide, CANVAS_WIDTH) }}
            />
          )}
          {horizontalGuide !== null && (
            <div
              className="absolute left-0 h-px w-full bg-emerald-400/80"
              style={{ top: toPercent(horizontalGuide, CANVAS_HEIGHT) }}
            />
          )}

          {BLOCK_ORDER.map((block) => {
            const rect = rects[block];
            const isSelected = selectedBlocks.includes(block);
            const isPrimary = primaryBlock === block;

            return (
              <button
                key={block}
                type="button"
                className={`absolute pointer-events-auto rounded border transition-colors ${
                  isPrimary
                    ? 'border-emerald-400 bg-emerald-100/70 text-emerald-700'
                    : isSelected
                      ? 'border-cyan-300/80 bg-cyan-100/70 text-cyan-700'
                      : 'border-transparent bg-transparent text-transparent hover:border-zinc-300/50 hover:bg-white/20 hover:text-zinc-700'
                }`}
                style={{
                  left: toPercent(rect.x, CANVAS_WIDTH),
                  top: toPercent(rect.y, CANVAS_HEIGHT),
                  width: toPercent(rect.w, CANVAS_WIDTH),
                  height: toPercent(rect.h, CANVAS_HEIGHT),
                  touchAction: 'none',
                  cursor: dragState?.mode === 'resize' ? 'default' : 'move',
                }}
                onPointerDown={(event) => beginMove(event, block)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={(event) => onBlockClick(event, block)}
              >
                {showLabels && (
                  <span className="canvas-block-label pointer-events-none absolute bottom-full left-0 mb-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm">
                    {messages.options.layoutBlock[block]}
                  </span>
                )}

                {isPrimary && (
                  <>
                    {HANDLE_POINTS.map((handle) => (
                      <span
                        key={handle.id}
                        className={`absolute h-3 w-3 rounded-sm border border-zinc-200 bg-zinc-50 ${handle.className}`}
                        onPointerDown={(event) => beginResize(event, block, handle.id)}
                      />
                    ))}
                  </>
                )}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
        {messages.editorCanvas.instructions}
      </p>

      {popoverBlock && popoverAnchor && (
        <BlockPopover
          block={popoverBlock}
          anchor={popoverAnchor}
          data={data}
          config={config}
          setConfig={setConfig}
          onClose={closePopover}
          onLogoUpload={onLogoUpload}
        />
      )}
    </div>
  );
};
