export function parseVTT(content, filename='unknown.vtt') {
  // very small wrapper that mirrors services/parser behavior
  const lines = content.split(/\r?\n/);
  const timestampRE = /(\d{1,2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{1,2}:\d{2}:\d{2}\.\d{3})/;
  const entries = [];
  let i=0;
  while (i<lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    const m = line.match(timestampRE);
    if (m) {
      const start = m[1]; const end = m[2]; i++;
      const textLines = [];
      while (i<lines.length && !lines[i].match(timestampRE)) {
        if (lines[i].trim()==='') { i++; break; }
        textLines.push(lines[i]); i++;
      }
      const raw = textLines.join(' ').trim();
      const sp = raw.match(/^(.+?):\s*(.+)$/);
      const speaker = sp ? sp[1] : 'Unknown';
      const text = sp ? sp[2] : raw;
      entries.push({ start, end, speaker, text });
      continue;
    }
    i++;
  }
  return entries;
}
