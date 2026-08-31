import jsPDF from 'jspdf';
import { rtlText } from 'bidi-shaper/jspdf';
import amiriRegularUrl from '../assets/fonts/Amiri-Regular.ttf?url';
import amiriBoldUrl from '../assets/fonts/Amiri-Bold.ttf?url';

export const PDF_ARABIC_FONT = 'Amiri';

const ARABIC_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const containsArabic = (text?: string | null) =>
  Boolean(text && ARABIC_RE.test(text));

export const toPdfText = (text: string) =>
  containsArabic(text) ? rtlText(text) : text;

let cachedRegular: string | null = null;
let cachedBold: string | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const loadFontBase64 = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load PDF font: ${url}`);
  }
  return arrayBufferToBase64(await response.arrayBuffer());
};

export const registerArabicFont = async (doc: jsPDF) => {
  if (!cachedRegular) cachedRegular = await loadFontBase64(amiriRegularUrl);
  if (!cachedBold) cachedBold = await loadFontBase64(amiriBoldUrl);

  doc.addFileToVFS('Amiri-Regular.ttf', cachedRegular);
  doc.addFont('Amiri-Regular.ttf', PDF_ARABIC_FONT, 'normal');
  doc.addFileToVFS('Amiri-Bold.ttf', cachedBold);
  doc.addFont('Amiri-Bold.ttf', PDF_ARABIC_FONT, 'bold');
};

export const setPdfFont = (
  doc: jsPDF,
  text: string,
  style: 'normal' | 'bold' = 'normal',
) => {
  doc.setFont(containsArabic(text) ? PDF_ARABIC_FONT : 'helvetica', style);
};

export const applyArabicCellFont = (cellText: string, styles: { font?: string }) => {
  if (containsArabic(cellText)) {
    styles.font = PDF_ARABIC_FONT;
  }
};
