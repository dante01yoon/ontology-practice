const DAY_PRICE = { 1: 1000, 2: 2000, 3: 3000 };

const SEASON_PRICE = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const UNIT_MINUTES = 5;
const UNIT_FEE = 200;

// "일일권-1시간", "30일권-2시간" → { season, hours, price }. 없는 이용권이면 null.
function parse(id) {
  const m = /^(일일|(\d+)일)권-(\d+)시간$/.exec(id);
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1] === '일일') {
    const price = DAY_PRICE[hours];
    return price === undefined ? null : { season: false, hours, price };
  }
  const price = SEASON_PRICE[Number(m[2])]?.[hours];
  return price === undefined ? null : { season: true, hours, price };
}

function must(id) {
  const pass = parse(id);
  if (!pass) throw new Error(`없는 이용권: ${id}`);
  return pass;
}

export function price(id) {
  return must(id).price;
}

// 기본대여시간을 넘긴 시간에 5분마다 200원. 5분 미만 자투리는 올림(PRD 미정의 사항).
export function extraFee(id, minutes) {
  const over = minutes - must(id).hours * 60;
  return over > 0 ? Math.ceil(over / UNIT_MINUTES) * UNIT_FEE : 0;
}

// 없는 이용권이거나 비회원이 못 사는 이용권이면 false.
export function canBuy(id, isMember) {
  const pass = parse(id);
  if (!pass) return false;
  if (isMember) return true;
  return !pass.season && pass.hours <= 2;
}
