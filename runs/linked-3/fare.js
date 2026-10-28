// 따릉이 요금 계산. 가격표와 추가요금 상수는 ontology.md를 유일한 출처로 읽는다 (SDD 3절).
import { readFileSync } from 'node:fs';

const ontology = readFileSync(new URL('./ontology.md', import.meta.url), 'utf8');

const cells = (line) => line.split('|').slice(1, -1).map((c) => c.trim());
const won = (s) => Number(s.replace(/,/g, ''));

// 가격표 (ontology.md 2절): 일일권은 시간별, 정기권은 (이용기간, 시간)별
function loadPrices() {
  const daily = new Map(); // 시간 -> 원
  const season = new Map(); // `${일}-${시간}` -> 원
  let mode = null;
  let hours = [];
  const start = ontology.indexOf('### 가격표');
  const end = ontology.indexOf('\n## ', start);
  for (const line of ontology.slice(start, end).split('\n')) {
    if (line === '일일권' || line === '정기권') {
      mode = line;
    } else if (mode === '정기권' && /^\|\s*이용기간/.test(line)) {
      hours = cells(line).slice(1).map((h) => Number(h.match(/\d+/)[0]));
    } else if (mode === '일일권' && /^\|\s*\d+시간\s*\|/.test(line)) {
      const [h, p] = cells(line);
      daily.set(parseInt(h, 10), won(p));
    } else if (mode === '정기권' && /^\|\s*\d+일\s*\|/.test(line)) {
      const [d, ...ps] = cells(line);
      ps.forEach((p, i) => season.set(`${parseInt(d, 10)}-${hours[i]}`, won(p)));
    }
  }
  return { daily, season };
}

// 추가요금 단위시간(분), 단위요금(원) (ontology.md 2절 속성표)
function loadOverage() {
  const pick = (name) => {
    const row = ontology.split('\n').find((l) => l.startsWith(`| 추가요금 | ${name} |`));
    return won(cells(row)[3]);
  };
  return { unitMinutes: pick('단위시간'), unitFee: pick('단위요금') };
}

const { daily, season } = loadPrices();
const { unitMinutes, unitFee } = loadOverage();

// "일일권-1시간", "30일권-2시간" -> { kind, days, hours }. 모양이 틀리면 null.
function parse(passId) {
  const m = /^(?:(일일)|(\d+)일)권-(\d+)시간$/.exec(passId);
  if (!m) return null;
  return m[1]
    ? { kind: '일일권', days: null, hours: Number(m[3]) }
    : { kind: '정기권', days: Number(m[2]), hours: Number(m[3]) };
}

// 가격표에 없는 이용권(R5 포함)이면 null
function lookup(passId) {
  const p = parse(passId);
  if (!p) return null;
  const fee = p.kind === '일일권' ? daily.get(p.hours) : season.get(`${p.days}-${p.hours}`);
  return fee === undefined ? null : { ...p, fee };
}

function mustLookup(passId) {
  const p = lookup(passId);
  if (!p) throw new Error(`없는 이용권: ${passId}`);
  return p;
}

// R1, R2: 이용권 가격(원). 없는 이용권이면 예외.
export function price(passId) {
  return mustLookup(passId).fee;
}

// R6, R7: 대여시간(분)에 대한 추가요금(원). 할인은 적용하지 않는다 (R8).
// 정확히 기본대여시간에 반납하면 0원. 5분 미만 자투리는 올림(원본에 없는 가정).
export function extraFee(passId, minutes) {
  const { hours } = mustLookup(passId);
  if (!Number.isFinite(minutes) || minutes < 0) throw new Error(`잘못된 대여시간: ${minutes}`);
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / unitMinutes) * unitFee;
}

// R3, R4, R5: 이 이용자가 이 이용권을 고를 수 있는지. 없는 이용권이면 false.
export function canBuy(passId, isMember) {
  const p = lookup(passId);
  if (!p) return false;
  if (isMember) return true;
  return p.kind === '일일권' && p.hours <= 2;
}
