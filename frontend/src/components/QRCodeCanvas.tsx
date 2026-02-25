import React, { useEffect, useRef } from 'react';

// ─── Minimal QR Code Generator (adapted from nayuki/qrcodegen, MIT License) ───

type Bit = 0 | 1;

function appendBits(val: number, len: number, bb: Bit[]): void {
  for (let i = len - 1; i >= 0; i--) bb.push(((val >>> i) & 1) as Bit);
}

function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}

const ECC_CODEWORDS_PER_BLOCK: ReadonlyArray<ReadonlyArray<number>> = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

const NUM_ERROR_CORRECTION_BLOCKS: ReadonlyArray<ReadonlyArray<number>> = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

function reedSolomonComputeDivisor(degree: number): Uint8Array {
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = reedSolomonMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonComputeRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
  const result = new Uint8Array(divisor.length);
  for (const b of data) {
    const factor = b ^ result[0];
    result.copyWithin(0, 1);
    result[divisor.length - 1] = 0;
    for (let i = 0; i < divisor.length; i++)
      result[i] ^= reedSolomonMultiply(divisor[i], factor);
  }
  return result;
}

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function encodeText(text: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) { bytes.push(0xc0 | (c >> 6)); bytes.push(0x80 | (c & 0x3f)); }
    else { bytes.push(0xe0 | (c >> 12)); bytes.push(0x80 | ((c >> 6) & 0x3f)); bytes.push(0x80 | (c & 0x3f)); }
  }
  return new Uint8Array(bytes);
}

function generateQR(text: string): boolean[][] {
  const eccLevel = 1; // M
  const data = encodeText(text);

  // Find minimum version
  let version = 1;
  for (; version <= 40; version++) {
    const cap = getNumDataCodewords(version, eccLevel) * 8;
    const needed = 4 + getNumCharCountBits(version) + data.length * 8;
    if (needed <= cap) break;
  }
  if (version > 40) version = 40;

  const bb: Bit[] = [];
  // Mode: byte = 0100
  appendBits(4, 4, bb);
  appendBits(data.length, getNumCharCountBits(version), bb);
  for (const b of data) appendBits(b, 8, bb);

  const dataCapacityBits = getNumDataCodewords(version, eccLevel) * 8;
  appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
  appendBits(0, (8 - (bb.length % 8)) % 8, bb);
  for (let padByte = 0xec; bb.length < dataCapacityBits; padByte ^= 0xec ^ 0x11)
    appendBits(padByte, 8, bb);

  const dataCodewords = new Uint8Array(bb.length / 8);
  for (let i = 0; i < dataCodewords.length; i++) {
    for (let j = 0; j < 8; j++) dataCodewords[i] = (dataCodewords[i] << 1) | bb[i * 8 + j];
  }

  const allCodewords = addEccAndInterleave(dataCodewords, version, eccLevel);
  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  drawFunctionPatterns(modules, isFunction, version, eccLevel);
  drawCodewords(modules, isFunction, allCodewords, version);

  let bestMask = 0;
  let minPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(modules, isFunction, mask);
    drawFormatBits(modules, isFunction, eccLevel, mask);
    const penalty = getPenaltyScore(modules);
    if (penalty < minPenalty) { minPenalty = penalty; bestMask = mask; }
    applyMask(modules, isFunction, mask);
  }
  applyMask(modules, isFunction, bestMask);
  drawFormatBits(modules, isFunction, eccLevel, bestMask);
  return modules;
}

function getNumDataCodewords(ver: number, ecc: number): number {
  return Math.floor(getNumRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[ecc][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecc][ver];
}

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function getNumCharCountBits(ver: number): number {
  return ver <= 9 ? 8 : ver <= 26 ? 16 : 16;
}

function addEccAndInterleave(data: Uint8Array, ver: number, ecc: number): Uint8Array {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecc][ver];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecc][ver];
  const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: Uint8Array[] = [];
  const rsDiv = reedSolomonComputeDivisor(blockEccLen);
  let k = 0;
  for (let i = 0; i < numBlocks; i++) {
    const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const dat = data.slice(k, k + datLen);
    k += datLen;
    const block = new Uint8Array(shortBlockLen + 1);
    block.set(dat);
    const ecc2 = reedSolomonComputeRemainder(dat, rsDiv);
    block.set(ecc2, datLen);
    blocks.push(block);
  }

  const result = new Uint8Array(rawCodewords);
  let idx = 0;
  for (let i = 0; i <= shortBlockLen; i++) {
    for (let j = 0; j < blocks.length; j++) {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks)
        result[idx++] = blocks[j][i];
    }
  }
  return result;
}

function drawFunctionPatterns(mod: boolean[][], isFn: boolean[][], ver: number, ecc: number): void {
  const size = mod.length;
  for (let i = 0; i < size; i++) { setFunctionModule(mod, isFn, 6, i, i % 2 === 0); setFunctionModule(mod, isFn, i, 6, i % 2 === 0); }
  drawFinderPattern(mod, isFn, 3, 3);
  drawFinderPattern(mod, isFn, size - 4, 3);
  drawFinderPattern(mod, isFn, 3, size - 4);
  const alignPatPos = getAlignmentPatternPositions(ver);
  const numAlign = alignPatPos.length;
  for (let i = 0; i < numAlign; i++) {
    for (let j = 0; j < numAlign; j++) {
      if (!((i === 0 && j === 0) || (i === 0 && j === numAlign - 1) || (i === numAlign - 1 && j === 0)))
        drawAlignmentPattern(mod, isFn, alignPatPos[i], alignPatPos[j]);
    }
  }
  drawFormatBits(mod, isFn, ecc, 0);
  drawVersion(mod, isFn, ver);
}

function drawFormatBits(mod: boolean[][], isFn: boolean[][], ecc: number, mask: number): void {
  const size = mod.length;
  const data = (ecc === 0 ? 1 : ecc === 1 ? 0 : ecc === 2 ? 3 : 2) << 3 | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = (data << 10 | rem) ^ 0x5412;
  for (let i = 0; i <= 5; i++) setFunctionModule(mod, isFn, 8, i, getBit(bits, i));
  setFunctionModule(mod, isFn, 8, 7, getBit(bits, 6));
  setFunctionModule(mod, isFn, 8, 8, getBit(bits, 7));
  setFunctionModule(mod, isFn, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) setFunctionModule(mod, isFn, 14 - i, 8, getBit(bits, i));
  for (let i = 0; i < 8; i++) setFunctionModule(mod, isFn, size - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) setFunctionModule(mod, isFn, 8, size - 15 + i, getBit(bits, i));
  setFunctionModule(mod, isFn, 8, size - 8, true);
}

function drawVersion(mod: boolean[][], isFn: boolean[][], ver: number): void {
  if (ver < 7) return;
  let rem = ver;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  const bits = ver << 12 | rem;
  const size = mod.length;
  for (let i = 0; i < 18; i++) {
    const a = size - 11 + (i % 3), b = Math.floor(i / 3);
    setFunctionModule(mod, isFn, a, b, getBit(bits, i));
    setFunctionModule(mod, isFn, b, a, getBit(bits, i));
  }
}

function drawFinderPattern(mod: boolean[][], isFn: boolean[][], cx: number, cy: number): void {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      const x = cx + dx, y = cy + dy;
      if (x >= 0 && x < mod.length && y >= 0 && y < mod.length)
        setFunctionModule(mod, isFn, x, y, dist !== 2 && dist !== 4);
    }
  }
}

function drawAlignmentPattern(mod: boolean[][], isFn: boolean[][], cx: number, cy: number): void {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++)
      setFunctionModule(mod, isFn, cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
}

function setFunctionModule(mod: boolean[][], isFn: boolean[][], x: number, y: number, isDark: boolean): void {
  mod[y][x] = isDark;
  isFn[y][x] = true;
}

function getAlignmentPatternPositions(ver: number): number[] {
  if (ver === 1) return [];
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result: number[] = [6];
  for (let pos = ver * 4 + 10; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
}

function drawCodewords(mod: boolean[][], isFn: boolean[][], data: Uint8Array, ver: number): void {
  const size = mod.length;
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFn[y][x] && i < data.length * 8) {
          mod[y][x] = getBit(data[Math.floor(i / 8)], 7 - (i % 8));
          i++;
        }
      }
    }
  }
}

function applyMask(mod: boolean[][], isFn: boolean[][], mask: number): void {
  const size = mod.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let invert: boolean;
      switch (mask) {
        case 0: invert = (x + y) % 2 === 0; break;
        case 1: invert = y % 2 === 0; break;
        case 2: invert = x % 3 === 0; break;
        case 3: invert = (x + y) % 3 === 0; break;
        case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: invert = x * y % 2 + x * y % 3 === 0; break;
        case 6: invert = (x * y % 2 + x * y % 3) % 2 === 0; break;
        case 7: invert = ((x + y) % 2 + x * y % 3) % 2 === 0; break;
        default: throw new Error();
      }
      if (!isFn[y][x] && invert) mod[y][x] = !mod[y][x];
    }
  }
}

function getPenaltyScore(modules: boolean[][]): number {
  const size = modules.length;
  let result = 0;
  for (let y = 0; y < size; y++) {
    let runColor = false, runX = 0;
    const runHistory = [0, 0, 0, 0, 0, 0, 0];
    for (let x = 0; x < size; x++) {
      if (modules[y][x] === runColor) { runX++; if (runX === 5) result += 3; else if (runX > 5) result++; }
      else { finderPenaltyAddHistory(runX, runHistory); if (!runColor) result += finderPenaltyCountPatterns(runHistory) * 40; runColor = modules[y][x]; runX = 1; }
    }
    result += finderPenaltyTerminateAndCount(runColor, runX, runHistory) * 40;
  }
  for (let x = 0; x < size; x++) {
    let runColor = false, runY = 0;
    const runHistory = [0, 0, 0, 0, 0, 0, 0];
    for (let y = 0; y < size; y++) {
      if (modules[y][x] === runColor) { runY++; if (runY === 5) result += 3; else if (runY > 5) result++; }
      else { finderPenaltyAddHistory(runY, runHistory); if (!runColor) result += finderPenaltyCountPatterns(runHistory) * 40; runColor = modules[y][x]; runY = 1; }
    }
    result += finderPenaltyTerminateAndCount(runColor, runY, runHistory) * 40;
  }
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x];
      if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) result += 3;
    }
  }
  let dark = 0;
  for (const row of modules) for (const c of row) if (c) dark++;
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += k * 10;
  return result;
}

function finderPenaltyCountPatterns(runHistory: number[]): number {
  const n = runHistory[1];
  const core = n > 0 && runHistory[2] === n && runHistory[3] === n * 3 && runHistory[4] === n && runHistory[5] === n;
  return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) +
    (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
}

function finderPenaltyTerminateAndCount(currentRunColor: boolean, currentRunLength: number, runHistory: number[]): number {
  if (currentRunColor) { finderPenaltyAddHistory(currentRunLength, runHistory); currentRunLength = 0; }
  currentRunLength += runHistory[0] < 0 ? 0 : runHistory[0];
  finderPenaltyAddHistory(currentRunLength, runHistory);
  return finderPenaltyCountPatterns(runHistory);
}

function finderPenaltyAddHistory(currentRunLength: number, runHistory: number[]): void {
  if (runHistory[0] < 0) currentRunLength += runHistory[0] < 0 ? 0 : 0;
  runHistory.copyWithin(1, 0, runHistory.length - 1);
  runHistory[0] = currentRunLength;
}

// ─── React Component ───────────────────────────────────────────────────────────

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  className?: string;
}

export default function QRCodeCanvas({
  value,
  size = 120,
  darkColor = '#1a3a1a',
  lightColor = '#ffffff',
  className = '',
}: QRCodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const modules = generateQR(value);
      const qrSize = modules.length;
      const scale = Math.floor(size / qrSize);
      const actualSize = qrSize * scale;
      canvas.width = actualSize;
      canvas.height = actualSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, actualSize, actualSize);
      ctx.fillStyle = darkColor;
      for (let y = 0; y < qrSize; y++) {
        for (let x = 0; x < qrSize; x++) {
          if (modules[y][x]) ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    } catch {
      // silently fail if QR generation fails
    }
  }, [value, size, darkColor, lightColor]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated' }}
      aria-label="QR code"
    />
  );
}
