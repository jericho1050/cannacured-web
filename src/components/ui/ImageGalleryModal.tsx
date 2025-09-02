import {} from "@/common/useWindowProperties";
import { Accessor, Setter, createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import { css, styled } from "solid-styled-components";
import { FlexRow } from "./Flexbox";
import "zoomist/css";
import Zoomist from "zoomist";
import { useLocation, useNavigate } from "solid-navigator";
import Button from "./Button";
import { DangerousLinkModal } from "./DangerousLinkModal";
import { useCustomPortal } from "./custom-portal/CustomPortal";

const ImagePreviewContainer = styled(FlexRow)`
  position: absolute;
  display: flex;
  flex-direction: column;
  inset: 0;
  z-index: 111111111111;
  background: rgba(0, 0, 0, 0.9);
  user-select: none;
  touch-action: none;

  .zoomist-container {
    width: 100%;
    height: 100%;
  }

  .zoomist-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: black;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    view-transition-name: embed-image;
  }
`;
const ImagePreview = styled(FlexRow)`
  align-items: center;
  justify-content: center;
  flex: 1;
  overflow: hidden;
`;
const InfoContainer = styled(FlexRow)`
  background-color: var(--pane-color);
  padding: 4px;
  align-items: center;
  justify-content: center;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  border-top: solid 1px rgba(255, 255, 255, 0.2);
  z-index: 11111;
`;
const NavButtonContainer = styled("div")`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 80px;
  z-index: 11112;
`;
const LeftNav = styled(NavButtonContainer)`
  left: 0;
`;
const RightNav = styled(NavButtonContainer)`
  right: 0;
`;

export type GalleryImage = {
  url: string;
  origUrl?: string;
  width?: number;
  height?: number;
};

export function ImageGalleryModal(props: {
  close: () => void;
  images: GalleryImage[];
  initialIndex?: number;
}) {
  let zoomistContainerRef: HTMLDivElement | undefined;
  const location = useLocation();
  const navigate = useNavigate();
  const { createPortal } = useCustomPortal();

  const [index, setIndex] = createSignal(props.initialIndex || 0);
  const current = () => props.images[index()] || props.images[0];

  createEffect(
    on(
      () => location.pathname + location.search + location.hash,
      () => {
        if (location.hash !== "#image-preview") {
          props.close();
          history.forward();
          setTimeout(() => {
            navigate(location.pathname + location.search, { replace: true });
          }, 100);
        }
      },
      { defer: true }
    )
  );

  onMount(() => {
    navigate("#image-preview");

    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => {
      document.removeEventListener("keydown", onKeyDown);
    });
  });

  let zoom: Zoomist | undefined;
  const initZoom = () => {
    if (!zoomistContainerRef) return;
    if (zoom) {
      zoom.destroy();
      zoom = undefined;
    }
    zoom = new Zoomist(zoomistContainerRef, { bounds: true });
  };

  createEffect(() => {
    // Re-init when image changes
    current();
    queueMicrotask(() => initZoom());
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") props.close();
    if (event.key === "ArrowLeft") prev();
    if (event.key === "ArrowRight") next();
  };

  const openOriginalLink = () => {
    const url = current().origUrl || current().url;
    // Open in new tab always (use existing DangerousLinkModal if needed)
    window.open(url, "_blank");
  };

  let pos = { x: 0, y: 0 };
  const onMouseDown = (event: PointerEvent) => {
    pos = { x: Math.round(event.x), y: Math.round(event.y) };
  };

  const onMouseUp = (event: PointerEvent) => {
    if (event.target instanceof HTMLImageElement) return;

    const diffX = Math.abs(event.x - pos.x);
    const diffY = Math.abs(event.y - pos.y);

    if (diffX < 5 && diffY < 1) {
      navigate(location.pathname + location.search, { replace: true });
    }
  };

  const prev = () => setIndex((i) => (i - 1 + props.images.length) % props.images.length);
  const next = () => setIndex((i) => (i + 1) % props.images.length);

  return (
    <ImagePreviewContainer>
      <ImagePreview onpointerdown={onMouseDown} onpointerup={onMouseUp}>
        <LeftNav>
          <Button onClick={prev} iconName="chevron_left" padding={12} />
        </LeftNav>
        <div class="zoomist-container" ref={zoomistContainerRef as any}>
          <div class="zoomist-wrapper">
            <div class="zoomist-image">
              <img draggable={false} src={current().url} />
            </div>
          </div>
        </div>
        <RightNav>
          <Button onClick={next} iconName="chevron_right" padding={12} />
        </RightNav>
      </ImagePreview>
      <InfoContainer gap={8}>
        <Button
          onClick={() => navigate(location.pathname + location.search, { replace: true })}
          iconName="close"
          margin={0}
          color="var(--alert-color)"
          padding={8}
        />
        <Button onClick={openOriginalLink} iconName="open_in_new" margin={0} padding={8} />
        <span style={{ color: "#fff", "margin-left": "8px" }}>{index() + 1} / {props.images.length}</span>
      </InfoContainer>
    </ImagePreviewContainer>
  );
}
