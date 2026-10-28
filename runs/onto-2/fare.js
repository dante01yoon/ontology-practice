// 따릉이 요금 계산. 근거: ontology.md

const DAILY = { 1: 1000, 2: 2000, 3: 3000 };
const PERIOD = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const EXTRA_UNIT_MIN = 5;
const EXTRA_UNIT_WON = 200;

// "일일권-1시간" | "30일권-2시간" -> { period: null | 7.., hours }. 없는 이용권이면 null.
function parse(id) {
  const m = /^(일일|\d+일)권-(\d+)시간$/.exec(id);
  if (!m) return null;
  const hours = Number(m[2]);
  if (m[1] === "일일") {
    return hours in DAILY ? { period: null, hours } : null;
  }
  const period = parseInt(m[1], 10);
  return PERIOD[period]?.[hours] ? { period, hours } : null;
}

function mustParse(id) {
  const t = parse(id);
  if (!t) throw new Error(`존재하지 않는 이용권: ${id}`);
  return t;
}

export function price(id) {
  const { period, hours } = mustParse(id);
  return period === null ? DAILY[hours] : PERIOD[period][hours];
}

// R7: 원본이 자투리 처리를 밝히지 않아 올림으로 해석한다 (ontology.md R7).
export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`대여시간이 올바르지 않음: ${minutes}`);
  }
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / EXTRA_UNIT_MIN) * EXTRA_UNIT_WON;
}

// R3, R4: 정기권은 회원 전용, 일일권 3시간은 회원 전용. 존재하지 않는 이용권은 false.
export function canBuy(id, isMember) {
  const t = parse(id);
  if (!t) return false;
  if (isMember) return true;
  return t.period === null && t.hours <= 2;
}
