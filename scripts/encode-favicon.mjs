import { readFile, writeFile } from "node:fs/promises";

const png = await readFile(new URL("../public/icons/fingerfox-32.png", import.meta.url));
const directory = Buffer.from([0, 0, 1, 0, 1, 0]);
const entry = Buffer.alloc(16);
entry[0] = 32;
entry[1] = 32;
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png.length, 8);
entry.writeUInt32LE(22, 12);
await writeFile(new URL("../src/app/favicon.ico", import.meta.url), Buffer.concat([directory, entry, png]));
