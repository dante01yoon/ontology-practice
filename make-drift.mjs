// 「한쪽만 고친」 상황을 일부러 만든다: ontology.md만 30일권 1시간권 가격을 옛날 값(4,000원)으로 둔 사본 → knowledge/ontology-stale.md
import fs from 'node:fs';
const src = new URL('knowledge/ontology.md', import.meta.url), dst = new URL('knowledge/ontology-stale.md', import.meta.url);
let n = 0;
const out = fs.readFileSync(src, 'utf8').split('\n').map((l) => {
  if (n || !l.includes('30일권')) return l;
  return l.replace(/5,000|5000/, (m) => { n++; return m.includes(',') ? '4,000' : '4000'; });
}).join('\n');
if (n !== 1) throw new Error('30일권 1시간권 가격 줄을 찾지 못함 — ontology.md 모양을 확인');
fs.writeFileSync(dst, out);
console.log('ontology-stale.md: 30일권 1시간권 5,000 → 4,000 (이 파일만)');
