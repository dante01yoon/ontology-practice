// 따릉이 요금 계산. 규칙 번호(R1~R8)는 ontology.md 4절을 가리킨다.
// 가격표와 추가요금 상수는 SDD 3절에 따라 ontology.md에서 읽는다 (값을 따로 옮겨 적지 않는다).
import { readFileSync } from 'node:fs';

const ONTOLOGY = new URL('./ontology.md', import.meta.url);

function num(text) {
  return Number(text.replace(/,/g, ''));
}

function tableRows(section) {
  return section
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => !cells.every((c) => /^-+$/.test(c)));
}

function loadOntology() {
  const md = readFileSync(ONTOLOGY, 'utf8');

  const priceSection = md.split('### 가격표')[1]?.split('\n## ')[0];
  const [daySection, seasonSection] = (priceSection ?? '').split(/^정기권\s*$/m);
  if (!daySection || !seasonSection) throw new Error('ontology.md 가격표를 읽지 못했다');

  // 일일권: | 1시간 | 1,000 |
  const day = new Map();
  for (const [time, won] of tableRows(daySection).slice(1)) {
    day.set(parseInt(time, 10), num(won));
  }

  // 정기권: | 7일 | 3,000 | 4,000 | (머리글 "1시간권", "2시간권")
  const [header, ...body] = tableRows(seasonSection);
  const hours = header.slice(1).map((h) => parseInt(h, 10));
  const season = new Map();
  for (const [period, ...prices] of body) {
    hours.forEach((h, i) => season.set(`${parseInt(period, 10)}-${h}`, num(prices[i])));
  }

  // 추가요금: | 추가요금 | 단위시간 | 분 | 5 |
  const constant = (name) => {
    const row = tableRows(md).find((r) => r[0] === '추가요금' && r[1] === name);
    if (!row) throw new Error(`ontology.md에서 추가요금 ${name}을 찾지 못했다`);
    return num(row[3]);
  };

  return { day, season, unitMinutes: constant('단위시간'), unitFee: constant('단위요금') };
}

const { day, season, unitMinutes, unitFee } = loadOntology();

// "일일권-1시간" → { kind: 'day', hours: 1 }, "30일권-2시간" → { kind: 'season', period: 30, hours: 2 }
// 가격표에 없는 이용권(R5 등)이면 null.
function parsePass(id) {
  const m = /^(?:(일일)|(\d+)일)권-(\d+)시간$/.exec(String(id));
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) return day.has(hours) ? { kind: 'day', hours } : null;
  const period = Number(m[2]);
  return season.has(`${period}-${hours}`) ? { kind: 'season', period, hours } : null;
}

function mustParse(id) {
  const pass = parsePass(id);
  if (!pass) throw new Error(`없는 이용권: ${id}`);
  return pass;
}

// 이용권 가격 (R1, R2). 없는 이용권이면 예외.
export function price(id) {
  const pass = mustParse(id);
  return pass.kind === 'day' ? day.get(pass.hours) : season.get(`${pass.period}-${pass.hours}`);
}

// 추가요금 (R6, R7, R8). 할인은 적용하지 않는다.
// 5분 미만 자투리는 원본에 없어 올림으로 해석했다 (ontology.md R7 · 5절 미정의).
export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  if (!Number.isFinite(minutes) || minutes < 0) throw new Error(`잘못된 대여시간: ${minutes}`);
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / unitMinutes) * unitFee;
}

// 고를 수 있는 이용권인가 (R3, R4, R5). 없는 이용권도 false.
export function canBuy(id, isMember) {
  const pass = parsePass(id);
  if (!pass) return false;
  if (isMember) return true;
  if (pass.kind === 'season') return false; // R3
  return pass.hours <= 2; // R4
}
