const DAILY = { 1: 1000, 2: 2000, 3: 3000 };

const SEASON = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const UNIT_MINUTES = 5;
const UNIT_FEE = 200;

// "일일권-1시간", "30일권-2시간" → { daily, days, hours }. 없는 이용권이면 null.
function parse(id) {
  if (typeof id !== 'string') return null;
  const m = /^(?:(일일)권|(\d+)일권)-(\d+)시간$/.exec(id);
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) {
    return hours in DAILY ? { daily: true, hours } : null;
  }
  const days = Number(m[2]);
  return SEASON[days]?.[hours] !== undefined ? { daily: false, days, hours } : null;
}

function mustParse(id) {
  const pass = parse(id);
  if (!pass) throw new Error(`없는 이용권: ${id}`);
  return pass;
}

export function price(id) {
  const pass = mustParse(id);
  return pass.daily ? DAILY[pass.hours] : SEASON[pass.days][pass.hours];
}

// 기본대여시간을 넘긴 시간만 5분 단위로 올림해 200원씩. 기본대여시간 이하면 0원.
export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / UNIT_MINUTES) * UNIT_FEE;
}

// 없는 이용권은 거부(false). 비회원은 정기권과 3시간 일일권을 못 산다.
export function canBuy(id, isMember) {
  const pass = parse(id);
  if (!pass) return false;
  if (isMember) return true;
  return pass.daily && pass.hours <= 2;
}
