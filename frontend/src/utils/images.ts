type ImageValue = string[] | string | null | undefined;

export type ResponsiveImage = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

const IMAGE_WIDTHS = {
  movies: [200, 400, 800],
  events: [600, 1200],
} as const;

type ImageGroup = keyof typeof IMAGE_WIDTHS;

export function getFirstValue(value: ImageValue): string {
  if (!value) return "";
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? (parsed[0] ?? "") : String(parsed);
  } catch {
    return typeof value === "string" ? value : "";
  }
}

function isUrl(image: string): boolean {
  return /^(https?:)?\/\//.test(image) || image.startsWith("/");
}

function imageUrl(group: ImageGroup, name: string, width: number): string {
  return `/images/${group}/${name}/${width}.webp`;
}

function responsiveImage(
  group: ImageGroup,
  value: ImageValue,
  sizes: string,
): ResponsiveImage {
  const image = getFirstValue(value);
  if (!image) return { src: "" };
  if (isUrl(image)) return { src: image };

  const widths = IMAGE_WIDTHS[group];
  return {
    src: imageUrl(group, image, widths[widths.length - 1]),
    srcSet: widths
      .map((width) => `${imageUrl(group, image, width)} ${width}w`)
      .join(", "),
    sizes,
  };
}

export function moviePoster(value: ImageValue, sizes: string): ResponsiveImage {
  return responsiveImage("movies", value, sizes);
}

export function eventImage(value: ImageValue, sizes: string): ResponsiveImage {
  return responsiveImage("events", value, sizes);
}

export function moviePosterUrl(
  value: ImageValue,
  width: 200 | 400 | 800,
): string {
  const image = getFirstValue(value);
  if (!image || isUrl(image)) return image;
  return imageUrl("movies", image, width);
}
