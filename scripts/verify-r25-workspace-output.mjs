import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function assert(condition, message) {
  if (!condition) throw new Error(`R25 workspace output acceptance failed: ${message}`);
  console.log(`PASS: ${message}`);
}

async function fixture(label, pages) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i += 1) {
    const page = pdf.addPage([420, 595]);
    page.drawText(`${label} page ${i + 1}`, { x: 40, y: 520, size: 18, font, color: rgb(0.1, 0.1, 0.12) });
  }
  return pdf.save({ useObjectStreams: true });
}

const firstBytes = await fixture('FIRST', 2);
const secondBytes = await fixture('SECOND', 1);
const first = await PDFDocument.load(firstBytes);
const second = await PDFDocument.load(secondBytes);
const output = await PDFDocument.create();

for (const source of [first, second]) {
  const copied = await output.copyPages(source, source.getPageIndices());
  for (const page of copied) output.addPage(page);
}

assert(output.getPageCount() === 3, 'two fixture PDFs merge into exactly three pages');

for (const page of output.getPages()) page.setRotation(degrees(90));
const watermarkFont = await output.embedFont(StandardFonts.HelveticaBold);
const numberFont = await output.embedFont(StandardFonts.Helvetica);

output.getPages().forEach((page, index) => {
  const { width, height } = page.getSize();
  page.drawText('AJN R25 TEST', {
    x: Math.max(20, width / 2 - 60),
    y: Math.max(20, height / 2),
    size: 24,
    font: watermarkFont,
    color: rgb(0.35, 0.35, 0.4),
    opacity: 0.2,
    rotate: degrees(-35),
  });
  page.drawText(String(index + 1), {
    x: Math.max(20, width / 2),
    y: 20,
    size: 10,
    font: numberFont,
    color: rgb(0.2, 0.2, 0.24),
  });
});

const finalBytes = await output.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
assert(finalBytes.byteLength > 1000, 'generated workspace PDF contains non-empty document data');
assert(String.fromCharCode(...finalBytes.slice(0, 5)) === '%PDF-', 'generated workspace output has a real PDF header');

const reopened = await PDFDocument.load(finalBytes, { ignoreEncryption: false, updateMetadata: false });
assert(reopened.getPageCount() === 3, 'generated workspace PDF reopens with the expected page count');
assert(reopened.getPages().every(page => page.getRotation().angle === 90), 'rotation survives save and reopen on every output page');

const secondSave = await reopened.save({ useObjectStreams: true, addDefaultPage: false });
const secondReopen = await PDFDocument.load(secondSave);
assert(secondReopen.getPageCount() === 3, 'validated workspace output remains stable after a second save/reopen cycle');

console.log('\nAJN PDF R25 REAL WORKSPACE OUTPUT ACCEPTANCE: PASS');
