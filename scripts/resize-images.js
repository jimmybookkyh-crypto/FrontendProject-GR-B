import { access, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PROJECT_ROOT = path.join(import.meta.dirname, "..");
const SOURCE_ROOT = path.join(PROJECT_ROOT, "source-images");
const OUTPUT_ROOT = path.join(PROJECT_ROOT, "frontend", "public", "images");

const GROUPS = {
  movies: { widths: [200, 400, 800], aspectRatio: 3 / 2 },
  events: { widths: [600, 1200] },
};

const IMAGE_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png"];
const force = process.argv.includes("--force");

function toImageName(fileName) {
  return path
    .parse(fileName)
    .name.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function scaleImage(group, fileName) {
  const { widths, aspectRatio } = GROUPS[group];
  const imageName = toImageName(fileName);
  const outputDir = path.join(OUTPUT_ROOT, group, imageName);
  let created = 0;

  await mkdir(outputDir, { recursive: true });

  for (const width of widths) {
    const outputFile = path.join(outputDir, `${width}.webp`);

    if (!force && (await exists(outputFile))) continue;

    const height = aspectRatio ? Math.round(width * aspectRatio) : undefined;

    await sharp(path.join(SOURCE_ROOT, group, fileName))
      .rotate()
      .resize({ width, height, fit: "cover", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputFile);

    created++;
  }

  if (created > 0) {
    console.log(`${group}/${fileName} -> images/${group}/${imageName}/`);
  }
}

async function main() {
  for (const group of Object.keys(GROUPS)) {
    const sourceDir = path.join(SOURCE_ROOT, group);
    const files = (await readdir(sourceDir)).filter((file) =>
      IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()),
    );

    for (const file of files) {
      try {
        await scaleImage(group, file);
      } catch (error) {
        console.error(`Could not scale ${group}/${file}: ${error.message}`);
        process.exitCode = 1;
      }
    }
  }

  console.log("Images ready in frontend/public/images");
}

main();
