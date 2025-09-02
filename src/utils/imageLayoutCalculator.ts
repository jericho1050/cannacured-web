export interface ImageLayoutItem {
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface LayoutImage {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  overlay?: string;
}

export interface LayoutResult {
  images: LayoutImage[];
  containerWidth: number;
  containerHeight: number;
}

export class ImageMosaicCalculator {
  constructor(
    private config: { maxWidth?: number; maxHeight?: number; gap?: number } = {}
  ) {}

  private get maxWidth() {
    return this.config.maxWidth ?? 400;
  }
  private get maxHeight() {
    return this.config.maxHeight ?? 300;
  }
  private get gap() {
    return this.config.gap ?? 2;
  }

  calculateLayout(images: ImageLayoutItem[]): LayoutResult {
    const count = images.length;
    switch (count) {
      case 1:
        return this.singleImageLayout(images[0]);
      case 2:
        return this.twoImageLayout(images);
      case 3:
        return this.threeImageLayout(images);
      case 4:
        return this.fourImageLayout(images);
      default:
        return this.multipleImageLayout(images);
    }
  }

  private singleImageLayout(image: ImageLayoutItem): LayoutResult {
    const scale = Math.min(
      this.maxWidth / image.width,
      this.maxHeight / image.height,
      1
    );
    const w = image.width * scale;
    const h = image.height * scale;
    return {
      images: [{ url: image.url, x: 0, y: 0, width: w, height: h }],
      containerWidth: w,
      containerHeight: h,
    };
  }

  private twoImageLayout(images: ImageLayoutItem[]): LayoutResult {
    const [a, b] = images;
    const avgAR = (a.aspectRatio + b.aspectRatio) / 2;
    if (avgAR > 1.2) {
      return this.stackVertically(images);
    } else {
      return this.placeSideBySide(images);
    }
  }

  private threeImageLayout(images: ImageLayoutItem[]): LayoutResult {
    const [mainImage, ...small] = images;
    const containerWidth = this.maxWidth;
    const containerHeight = this.maxHeight;

    const mainWidth = containerWidth * 0.6;
    const smallWidth = containerWidth * 0.4 - this.gap;
    const smallHeight = (containerHeight - this.gap) / 2;

    return {
      images: [
        { url: mainImage.url, x: 0, y: 0, width: mainWidth, height: containerHeight },
        { url: small[0].url, x: mainWidth + this.gap, y: 0, width: smallWidth, height: smallHeight },
        { url: small[1].url, x: mainWidth + this.gap, y: smallHeight + this.gap, width: smallWidth, height: smallHeight },
      ],
      containerWidth,
      containerHeight,
    };
  }

  private fourImageLayout(images: ImageLayoutItem[]): LayoutResult {
    const containerWidth = this.maxWidth;
    const containerHeight = this.maxHeight;
    const itemWidth = (containerWidth - this.gap) / 2;
    const itemHeight = (containerHeight - this.gap) / 2;

    return {
      images: images.map((img, idx) => ({
        url: img.url,
        x: (idx % 2) * (itemWidth + this.gap),
        y: Math.floor(idx / 2) * (itemHeight + this.gap),
        width: itemWidth,
        height: itemHeight,
      })),
      containerWidth,
      containerHeight,
    };
  }

  private multipleImageLayout(images: ImageLayoutItem[]): LayoutResult {
    const firstFour = images.slice(0, 4);
    const remaining = images.length - 4;
    const layout = this.fourImageLayout(firstFour);
    if (remaining > 0) {
      layout.images[3].overlay = `+${remaining}`;
    }
    return layout;
  }

  private stackVertically(images: ImageLayoutItem[]): LayoutResult {
    const containerWidth = this.maxWidth;
    const itemHeight = (this.maxHeight - this.gap) / 2;
    return {
      images: images.map((img, idx) => ({
        url: img.url,
        x: 0,
        y: idx * (itemHeight + this.gap),
        width: containerWidth,
        height: itemHeight,
      })),
      containerWidth,
      containerHeight: this.maxHeight,
    };
  }

  private placeSideBySide(images: ImageLayoutItem[]): LayoutResult {
    const containerHeight = this.maxHeight;
    const itemWidth = (this.maxWidth - this.gap) / 2;
    return {
      images: images.map((img, idx) => ({
        url: img.url,
        x: idx * (itemWidth + this.gap),
        y: 0,
        width: itemWidth,
        height: containerHeight,
      })),
      containerWidth: this.maxWidth,
      containerHeight,
    };
  }
} 