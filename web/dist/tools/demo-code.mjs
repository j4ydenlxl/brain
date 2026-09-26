import { analyzeRepository } from './repo-core.mjs';
const contents = {
  'src/upload.js': `import { saveDocument, writeChunk } from './storage.js';
import { validateUpload, cleanText } from './validation.js';
export async function acceptUpload(request) {
  const file = await request.file();
  validateUpload(file);
  const text = await readDocument(file);
  const document = await saveDocument(file.name, text);
  const chunks = splitText(cleanText(text));
  await indexChunks(document.id, chunks);
  return { id: document.id, chunks: chunks.length };
}
export async function readDocument(file) {
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(buffer);
  return text;
}
export function splitText(text) {
  const paragraphs = text.split('\\n\\n');
  return paragraphs.filter(isUseful).map(makeChunk);
}
export function isUseful(paragraph) {
  return paragraph.trim().length > 0;
}
export function makeChunk(text) {
  const words = text.split(' ');
  return { text, words: words.length };
}
export async function indexChunks(documentId, chunks) {
  for (const chunk of chunks) {
    validateUpload(chunk);
    await writeChunk(documentId, chunk);
  }
  return chunks.length;
}`,
  'src/search.js': `import { findChunks } from './storage.js';
import { cleanText } from './validation.js';
export async function searchDocuments(query) {
  const normalized = normalizeQuery(query);
  const matches = await findChunks(normalized);
  const ranked = rankMatches(matches, normalized);
  return formatResults(ranked);
}
export function normalizeQuery(query) {
  return cleanText(query).toLowerCase();
}
export function rankMatches(matches, query) {
  return matches.map(scoreMatch).sort(compareScores);
}
export function scoreMatch(match) {
  const score = match.words.length;
  return { ...match, score };
}
export function compareScores(a, b) {
  return b.score - a.score;
}
export function formatResults(matches) {
  return matches.map(toResult);
}
export function toResult(match) {
  return { title: match.title, snippet: match.text, score: match.score };
}`,
  'src/storage.js': `export async function saveDocument(name, text) {
  const record = await db.documents.insert({ name, text });
  return record;
}
export async function writeChunk(documentId, chunk) {
  return db.chunks.insert({ documentId, ...chunk });
}
export async function findChunks(query) {
  const rows = await db.chunks.find({ text: query });
  return rows;
}`,
  'src/validation.js': `export function validateUpload(file) {
  if (!file) throw new Error('A document is required');
  if (file.size > 1000000) throw new Error('Document is too large');
  return true;
}
export function cleanText(text) {
  return text.trim().replace(/\\s+/g, ' ');
}`,
  'src/UploadForm.jsx': `import { acceptUpload } from './upload.js';
import './interface.css';
export async function handleUpload(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const file = form.elements.document.files[0];
  const result = await acceptUpload({ file: async () => file });
  return result;
}
export function UploadForm() {
  return (
    <main className="workspace">
      <h1>Document workspace</h1>
      <p>Add a document to your searchable library.</p>
      <form id="upload" onSubmit={handleUpload}>
        <label htmlFor="document">Choose a document</label>
        <input id="document" name="document" type="file" required />
        <button className="primary" type="submit">Index document</button>
      </form>
    </main>
  );
}`,
  'src/interface.css': `.workspace { display: grid; gap: 24px; max-width: 720px; margin: 0 auto; }
.primary { background: #242424; color: #ffffff; padding: 12px 20px; border-radius: 6px; }
#upload { display: flex; flex-direction: column; gap: 12px; }`,
  '.github/workflows/checks.yml': `name: Check and package
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install dependencies
        run: npm ci
      - name: Check behavior
        run: npm test
  package:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build the application
        run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: application
          path: dist`
};
export const demoSnapshot = analyzeRepository({ repository: { fullName: 'illustrative/document-workspace', ref: 'sample' }, tree: Object.keys(contents).map(path => ({ path, type: 'blob' })), contents });
