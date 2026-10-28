const DAY_PRICE = { 1: 1000, 2: 2000, 3: 3000 };

const SEASON_PRICE = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const OVERAGE_UNIT_MIN = 5;
const OVERAGE_UNIT_FEE = 200;

// "일일권-1시간", "30일권-2시간" → { season, days, hours, price }. 없는 이용권이면 null.
function parse(id) {
  const m = /^(?:(일일)권|(\d+)일권)-(\d+)시간$/.exec(id);
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) {
    const price = DAY_PRICE[hours];
    return price === undefined ? null : { season: false, hours, price };
  }
  const days = Number(m[2]);
  const price = SEASON_PRICE[days]?.[hours];
  return price === undefined ? null : { season: true, days, hours, price };
}

function mustParse(id) {
  const pass = parse(id);
  if (!pass) throw new Error(`없는 이용권: ${id}`);
  return pass;
}

export function price(id) {
  return mustParse(id).price;
}

// 5분 미만 자투리는 올림(SDD 4.2의 올림 해석). 기본대여시간 이하는 0원.
export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  const over = minutes - hours * 60;
  if (over <= 0) return 0;
  return Math.ceil(over / OVERAGE_UNIT_MIN) * OVERAGE_UNIT_FEE;
}

// 없는 이용권, 비회원의 정기권·3시간권은 false.
export function canBuy(id, isMember) {
  const pass = parse(id);
  if (!pass) return false;
  if (isMember) return true;
  return !pass.season && pass.hours <= 2;
}
