// 따릉이 요금 계산. 근거: PRD.md, SDD.md
// 이용권ID 형식: "일일권-1시간", "30일권-2시간"

const DAY_PRICE = { 1: 1000, 2: 2000, 3: 3000 };

const SEASON_PRICE = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const UNIT_MINUTES = 5;
const UNIT_FEE = 200;

// 5분 미만 자투리는 원본에 정의가 없다(PRD §8). SDD 4.2의 올림 해석을 따른다.
const roundOverage = Math.ceil;

// 없는 이용권이면 null.
function parse(id) {
  const m = /^(일일권|(\d+)일권)-(\d+)시간$/.exec(id);
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1] === '일일권') {
    const price = DAY_PRICE[hours];
    return price === undefined ? null : { season: false, hours, price };
  }
  const price = SEASON_PRICE[Number(m[2])]?.[hours];
  return price === undefined ? null : { season: true, hours, price };
}

function mustParse(id) {
  const pass = parse(id);
  if (!pass) throw new Error(`없는 이용권: ${id}`);
  return pass;
}

export function price(id) {
  return mustParse(id).price;
}

export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new RangeError(`잘못된 대여시간: ${minutes}`);
  }
  const over = minutes - hours * 60;
  if (over <= 0) return 0;
  return roundOverage(over / UNIT_MINUTES) * UNIT_FEE;
}

// 없는 이용권도 살 수 없으므로 false.
export function canBuy(id, isMember) {
  const pass = parse(id);
  if (!pass) return false;
  if (isMember) return true;
  return !pass.season && pass.hours <= 2;
}
