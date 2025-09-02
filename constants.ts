
import { SheetSize } from './types';

export const DPI = 300; // Dots Per Inch for print quality
export const PIXELS_PER_INCH_DISPLAY = 15; // For on-screen representation

export const SHEET_SIZES: SheetSize[] = [
  { name: '22" x 12"', width: 22, height: 12 },
  { name: '22" x 24"', width: 22, height: 24 },
  { name: '22" x 36"', width: 22, height: 36 },
  { name: '22" x 60"', width: 22, height: 60 },
  { name: '22" x 120"', width: 22, height: 120 },
];
