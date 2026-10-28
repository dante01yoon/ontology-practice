// runs/results.jsonl → 조건별 평균표
import fs from 'node:fs';
const rows = fs.readFileSync(new URL('runs/results.jsonl', import.meta.url), 'utf8').trim().split('\n').map(JSON.parse);
const LABEL = { base: '과제만', onto: '+온톨로지', spec: '+PRD·SDD', both: '+둘 다', drift: '+둘 다(어긋남)', check: '+PRD·SDD+검사' };
const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
console.log('조건'.padEnd(16), '정답률', '  비용($)', ' 시간(초)', ' 턴', ' 회');
for (const [k, label] of Object.entries(LABEL)) {
  const g = rows.filter((r) => r.condition === k);
  if (!g.length) continue;
  console.log(label.padEnd(14), `${avg(g.map((r) => r.score)).toFixed(1)}%`.padStart(7),
    avg(g.map((r) => r.cost_usd)).toFixed(3).padStart(9), avg(g.map((r) => r.seconds)).toFixed(1).padStart(8),
    avg(g.map((r) => r.turns)).toFixed(1).padStart(5), String(g.length).padStart(3));
}
