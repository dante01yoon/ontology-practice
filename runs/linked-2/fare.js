import { readFileSync } from 'node:fs';

// 가격표와 추가요금 상수는 ontology.md가 유일한 출처다 (SDD 3절). 여기서는 읽어 오기만 한다.
const ONTOLOGY = readFileSync(new URL('./ontology.md', import.meta.url), 'utf8');

// R7 미정의: 5분 미만 자투리 처리. ontology.md가 제시한 올림 해석을 쓴다.
const roundOveragePeriods = Math.ceil;

// R4: 비회원이 고를 수 있는 일일권 기본대여시간 (가격표에 없는 규칙이라 코드에 둔다)
const NON_MEMBER_DAY_PASS_HOURS = new Set([1, 2]);

const toWon = (s) => Number(s.replace(/,/g, ''));

function parsePrices(md) {
  const section = md.split(/^### 가격표.*$/m)[1]?.split(/^#{1,2} /m)[0];
  if (!section) throw new Error('ontology.md에서 가격표를 찾을 수 없다');

  const day = new Map(); // 시간 -> 원
  const season = new Map(); // `${일}-${시간}` -> 원
  let mode = null;
  let seasonHours = [];

  for (const raw of section.split('\n')) {
    const line = raw.trim();
    if (line === '일일권') mode = 'day';
    else if (line === '정기권') mode = 'season';
    if (!line.startsWith('|')) continue;

    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (mode === 'day') {
      const m = cells[0].match(/^(\d+)시간$/);
      if (m) day.set(Number(m[1]), toWon(cells[1]));
    } else if (mode === 'season') {
      if (cells[0] === '이용기간') {
        seasonHours = cells.slice(1).map((c) => Number(c.match(/^(\d+)시간권$/)?.[1]));
      } else {
        const m = cells[0].match(/^(\d+)일$/);
        if (m) cells.slice(1).forEach((c, i) => season.set(`${m[1]}-${seasonHours[i]}`, toWon(c)));
      }
    }
  }
  if (!day.size || !season.size) throw new Error('ontology.md 가격표를 해석하지 못했다');
  return { day, season };
}

function parseOverage(md) {
  const pick = (name) => {
    const m = md.match(new RegExp(`\\|\\s*추가요금\\s*\\|\\s*${name}\\s*\\|[^|]*\\|\\s*([\\d,]+)\\s*\\|`));
    if (!m) throw new Error(`ontology.md에서 추가요금 ${name}를 찾을 수 없다`);
    return toWon(m[1]);
  };
  return { unitMinutes: pick('단위시간'), unitWon: pick('단위요금') };
}

const PRICES = parsePrices(ONTOLOGY);
const OVERAGE = parseOverage(ONTOLOGY);

// "일일권-1시간", "30일권-2시간" -> { kind, days, hours }
function parsePassId(id) {
  const m = typeof id === 'string' && id.match(/^(?:(일일)권|(\d+)일권)-(\d+)시간$/);
  if (!m) throw new Error(`이용권ID 형식이 올바르지 않다: ${id}`);
  return m[1]
    ? { kind: 'day', days: null, hours: Number(m[3]) }
    : { kind: 'season', days: Number(m[2]), hours: Number(m[3]) };
}

// 없는 이용권(R5, 가격표에 없는 이용기간·기본대여시간)이면 예외를 던진다.
function lookup(id) {
  const pass = parsePassId(id);
  const price = pass.kind === 'day'
    ? PRICES.day.get(pass.hours)
    : PRICES.season.get(`${pass.days}-${pass.hours}`);
  if (price === undefined) throw new Error(`존재하지 않는 이용권이다: ${id}`);
  return { ...pass, price };
}

/** 이용권 가격(원). 없는 이용권이면 예외. (R1, R2, R5) */
export function price(passId) {
  return lookup(passId).price;
}

/** 추가요금(원). minutes는 대여시간(분). 기본대여시간 이하면 0원. (R6, R7) */
export function extraFee(passId, minutes) {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 0) {
    throw new RangeError(`대여시간(분)은 0 이상의 숫자여야 한다: ${minutes}`);
  }
  const { hours } = lookup(passId);
  const overage = Math.max(0, minutes - hours * 60);
  return roundOveragePeriods(overage / OVERAGE.unitMinutes) * OVERAGE.unitWon;
}

/** 회원여부(true=회원)에 따라 이 이용권을 고를 수 있는지. 없는 이용권도 false. (R3, R4, R5) */
export function canBuy(passId, isMember) {
  if (typeof isMember !== 'boolean') throw new TypeError('회원여부는 true/false여야 한다');
  let pass;
  try {
    pass = lookup(passId);
  } catch {
    return false;
  }
  if (isMember) return true;
  return pass.kind === 'day' && NON_MEMBER_DAY_PASS_HOURS.has(pass.hours);
}
