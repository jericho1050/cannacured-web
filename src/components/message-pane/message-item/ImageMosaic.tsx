import { Component, For, createSignal, onMount } from "solid-js";
import styles from "./imageMosaic.module.scss";
import env from "@/common/env";
import { useWindowProperties } from "@/common/useWindowProperties";
import { useCustomPortal } from "@/components/ui/custom-portal/CustomPortal";
import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import type { RawAttachment } from "@/chat-api/RawData";
import {
  ImageMosaicCalculator,
  type ImageLayoutItem,
  type LayoutResult,
} from "@/utils/imageLayoutCalculator";

interface ImageMosaicProps {
  attachments: RawAttachment[];
}

const isGifPath = (p?: string) => (p || "").toLowerCase().endsWith(".gif");

const ImageMosaic: Component<ImageMosaicProps> = (props) => {
  const [layout, setLayout] = createSignal<LayoutResult | null>(null);
  const [loaded, setLoaded] = createSignal<Set<number>>(new Set());
  const { paneWidth, width: winWidth, hasFocus } = useWindowProperties();
  const { createPortal } = useCustomPortal();

  const widthOffset = -90;
  const computeMaxWidth = () => {
    const base = (paneWidth() || 600) + widthOffset;
    return Math.min(Math.max(base, 240), 600);
    // clamp between 240 and 600
  };
  const computeMaxHeight = () => (winWidth() <= 600 ? 260 : 300);

  const toUrl = (att: RawAttachment) => {
    if (!att.path) return "";
    let url = `${env.NERIMITY_CDN}${att.path}`;
    if (isGifPath(att.path) && !hasFocus()) url += "?type=webp";
    return url;
  };

  onMount(async () => {
    const items: ImageLayoutItem[] = props.attachments.map((att) => {
      const w = att.width || 400;
      const h = att.height || 300;
      return { url: toUrl(att), width: w, height: h, aspectRatio: w / h };
    });

    const calc = new ImageMosaicCalculator({
      maxWidth: computeMaxWidth(),
      maxHeight: computeMaxHeight(),
      gap: 2,
    });

    setLayout(calc.calculateLayout(items));
  });

  const onImgLoad = (idx: number) => {
    setLoaded((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  const onClick = (url: string) => {
    if (!url) return;
    createPortal((close) => <ImagePreviewModal close={close} url={url} />);
  };

  return (
    <div class={styles.container}>
      {layout() && (
        <div
          class={styles.grid}
          style={{
            width: `${layout()!.containerWidth}px`,
            height: `${layout()!.containerHeight}px`,
          }}
        >
          <For each={layout()!.images}>
            {(img, i) => (
              <div
                class={`${styles.item} ${loaded().has(i()) ? "loaded" : "loading"}`}
                style={{
                  left: `${img.x}px`,
                  top: `${img.y}px`,
                  width: `${img.width}px`,
                  height: `${img.height}px`,
                }}
                onClick={() => onClick(img.url)}
              >
                <img
                  src={img.url}
                  alt={`image-${i() + 1}`}
                  class={styles.img}
                  loading="lazy"
                  onLoad={() => onImgLoad(i())}
                />
                {img.overlay && <div class={styles.overlay}>{img.overlay}</div>}
                {!loaded().has(i()) && (
                  <div class={styles.placeholder}>
                    <div class={styles.spinner} />
                  </div>
                )}
              </div>
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default ImageMosaic; 