import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = new URL("../src/assets/", import.meta.url);
await mkdir(new URL("optimized/", root), { recursive: true });
for (const file of [
  "delivery-image-1.png",
  "delivery-image-2.png",
  "delivery-image-3.png",
  "delivery-image-4.png",
  "storeroom.jpg",
]) {
  const target = file.replace(/\.(png|jpg)$/, ".webp");
  await sharp(fileURLToPath(new URL(file, root)))
    .rotate()
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fileURLToPath(new URL("optimized/" + target, root)));
  console.log(target);
}
