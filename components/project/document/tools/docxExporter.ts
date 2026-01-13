import { parseParagraphHtml } from "./htmlSerializer";
import { Text } from "../model/node/Text";

import { Document as DocModel } from "../model/node/Document";
import { Style } from "../model/node/Style";

function xmlEscape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildDocumentXmlFromTextNodes(nodes: Text[]) {
  const wNS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  // Build simple paragraphs by splitting on newline characters
  // We'll combine runs with same styles
  const paragraphs: string[] = [];

  // Collapse nodes into paragraphs by splitting on \n
  let currentRuns: {
    text: string;
    style: { bold: boolean; italic: boolean; underline: boolean };
  }[] = [];

  function pushParagraph() {
    if (currentRuns.length === 0) return;
    const runsXml = currentRuns
      .map((r) => {
        const rPr: string[] = [];
        if (r.style.bold) rPr.push("<w:b/>");
        if (r.style.italic) rPr.push("<w:i/>");
        if (r.style.underline) rPr.push('<w:u w:val="single"/>');
        const rPrXml = rPr.length > 0 ? `<w:rPr>${rPr.join("")}</w:rPr>` : "";
        // preserve spaces
        const t = xmlEscape(r.text);
        return `<w:r>${rPrXml}<w:t xml:space=\"preserve\">${t}</w:t></w:r>`;
      })
      .join("");

    paragraphs.push(`<w:p>${runsXml}</w:p>`);
    currentRuns = [];
  }

  nodes.forEach((n) => {
    const style =
      n.style && n.style[0]
        ? n.style[0]
        : { bold: false, italic: false, underline: false };
    const parts = n.text.split("\n");
    parts.forEach((part, idx) => {
      if (part.length > 0) {
        // merge with previous run if same style
        const last = currentRuns[currentRuns.length - 1];
        if (
          last &&
          last.style.bold === style.bold &&
          last.style.italic === style.italic &&
          last.style.underline === style.underline
        ) {
          last.text += part;
        } else {
          currentRuns.push({ text: part, style });
        }
      }

      if (idx < parts.length - 1) {
        // newline -> end paragraph
        pushParagraph();
      }
    });
  });

  pushParagraph();

  const body = paragraphs.join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w=\"${wNS}\"><w:body>${body}</w:body></w:document>`;
}

// Minimal static files
const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">
  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>
  <Default Extension=\"xml\" ContentType=\"application/xml\"/>
  <Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>
  <Override PartName=\"/word/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml\"/>
</Types>`;

const relsRoot = `<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">\n  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>\n</Relationships>`;

const relsDocument = `<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">\n</Relationships>`;

const stylesXml = `<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<w:styles xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">\n  <w:style w:type=\"paragraph\" w:default=\"1\">\n    <w:name w:val=\"Normal\"/>\n    <w:rPr>\n      <w:rFonts w:ascii=\"Times New Roman\"/>\n      <w:sz w:val=\"24\"/>\n    </w:rPr>\n  </w:style>\n</w:styles>`;

// Encode string to Uint8Array (UTF-8)
function encodeUtf8(s: string) {
  return new TextEncoder().encode(s);
}

// CRC32 implementation
const CRC_TABLE = (() => {
  let c;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function uint32LE(n: number) {
  const b = new Uint8Array(4);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  b[2] = (n >>> 16) & 0xff;
  b[3] = (n >>> 24) & 0xff;
  return b;
}

function uint16LE(n: number) {
  const b = new Uint8Array(2);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  return b;
}

function concatUint8(arrays: Uint8Array[]) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  arrays.forEach((a) => {
    out.set(a, offset);
    offset += a.length;
  });
  return out;
}

function createZip(files: { [path: string]: Uint8Array }) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  Object.keys(files).forEach((path) => {
    const nameBytes = encodeUtf8(path);
    const data = files[path];
    const crc = crc32(data);
    const size = data.length;

    // local header
    const localHeaderSig = uint32LE(0x04034b50);
    const versionNeeded = uint16LE(20);
    const flags = uint16LE(0);
    const method = uint16LE(0); // store
    const modTime = uint16LE(0);
    const modDate = uint16LE(0);
    const crcBytes = uint32LE(crc);
    const compSize = uint32LE(size);
    const uncompSize = uint32LE(size);
    const nameLen = uint16LE(nameBytes.length);
    const extraLen = uint16LE(0);

    const localHeader = concatUint8([
      localHeaderSig,
      versionNeeded,
      flags,
      method,
      modTime,
      modDate,
      crcBytes,
      compSize,
      uncompSize,
      nameLen,
      extraLen,
      nameBytes,
      data,
    ]);

    localParts.push(localHeader);

    // central header
    const centralSig = uint32LE(0x02014b50);
    const verMade = uint16LE(20);
    const verNeed = versionNeeded;
    const gp = flags;
    const method2 = method;
    const mt = modTime;
    const md = modDate;
    const crc2 = crcBytes;
    const cs = compSize;
    const us = uncompSize;
    const nl = nameLen;
    const el = extraLen;
    const commentLen = uint16LE(0);
    const diskStart = uint16LE(0);
    const intAttr = uint16LE(0);
    const extAttr = uint32LE(0);
    const relOffset = uint32LE(offset);

    const central = concatUint8([
      centralSig,
      verMade,
      verNeed,
      gp,
      method2,
      mt,
      md,
      crc2,
      cs,
      us,
      nl,
      el,
      commentLen,
      diskStart,
      intAttr,
      extAttr,
      relOffset,
      nameBytes,
    ]);

    centralParts.push(central);

    offset += localHeader.length;
  });

  const centralDir = concatUint8(centralParts);
  const centralSize = centralDir.length;
  const centralOffset = offset;

  const endSig = uint32LE(0x06054b50);
  const disk = uint16LE(0);
  const diskStart = uint16LE(0);
  const recordsOnDisk = uint16LE(centralParts.length);
  const totalRecords = uint16LE(centralParts.length);
  const cdSize = uint32LE(centralSize);
  const cdOffset = uint32LE(centralOffset);
  const commentLen = uint16LE(0);

  const end = concatUint8([
    endSig,
    disk,
    diskStart,
    recordsOnDisk,
    totalRecords,
    cdSize,
    cdOffset,
    commentLen,
  ]);

  return concatUint8([...localParts, centralDir, end]);
}

export function buildDocxFromTextNodesAndDownload(
  nodes: Text[],
  filename = "document.docx"
) {
  // Build XML files
  const documentXml = buildDocumentXmlFromTextNodes(nodes);

  const files: { [path: string]: Uint8Array } = {
    "[Content_Types].xml": encodeUtf8(contentTypes),
    "_rels/.rels": encodeUtf8(relsRoot),
    "word/document.xml": encodeUtf8(documentXml),
    "word/_rels/document.xml.rels": encodeUtf8(relsDocument),
    "word/styles.xml": encodeUtf8(stylesXml),
  };

  const zipBytes = createZip(files);
  const blob = new Blob([zipBytes], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


export function buildDocxFromHtmlAndDownload(
  html: string,
  filename = "document.docx"
) {
  try {
    const parsed = parseParagraphHtml(html);
    buildDocxFromTextNodesAndDownload(parsed, filename);
  } catch (err) {
    console.error("Failed to build docx", err);
  }
}

export function buildDocxFromDocumentAndDownload(
  doc: DocModel,
  filename = "document.docx"
) {
  try {
    const nodes: Text[] = [];
    for (const section of doc.children) {
      for (const paragraph of section.children) {
        for (const t of paragraph.children) {
          nodes.push(t);
        }
        // Paragraph break
        nodes.push(new Text("\n", [new Style(false, false, false)]));
      }
      // Section break (extra paragraph)
      nodes.push(new Text("\n", [new Style(false, false, false)]));
    }

    buildDocxFromTextNodesAndDownload(nodes, filename);
  } catch (err) {
    console.error("Failed to build docx from Document model", err);
  }
}
