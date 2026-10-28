// 따릉이 요금 계산. 근거: ontology.md

const DAILY = { 1: 1000, 2: 2000, 3: 3000 };
const PERIOD = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const UNIT_MINUTES = 5;
const UNIT_FEE = 200;

// "일일권-1시간" | "30일권-2시간" -> { period: null | 일수, hours }. 없는 이용권이면 null.
function parse(id) {
  const m = /^(?:(일일)|(\d+)일)권-(\d+)시간$/.exec(id);
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) return hours in DAILY ? { period: null, hours } : null;
  const period = Number(m[2]);
  return PERIOD[period]?.[hours] !== undefined ? { period, hours } : null;
}

function mustParse(id) {
  const t = parse(id);
  if (!t) throw new Error(`존재하지 않는 이용권: ${id}`);
  return t;
}

// R1, R2
export function price(id) {
  const { period, hours } = mustParse(id);
  return period === null ? DAILY[hours] : PERIOD[period][hours];
}

// R6, R7. 5분 미만 자투리는 올림(원본에 명시 없음, 올림으로 해석). 기본대여시간 이하는 0원.
export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`대여시간이 올바르지 않음: ${minutes}`);
  }
  const over = minutes - hours * 60;
  return over > 0 ? Math.ceil(over / UNIT_MINUTES) * UNIT_FEE : 0;
}

// R3, R4, R5. 존재하지 않는 이용권은 false.
export function canBuy(id, isMember) {
  const t = parse(id);
  if (!t) return false;
  if (isMember) return true;
  return t.period === null && t.hours <= 2;
}
