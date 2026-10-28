// 따릉이 요금 계산. 규칙은 ontology.md / PRD.md / SDD.md 참고.
// 이용권ID 형식: "일일권-1시간", "30일권-2시간"

const DAILY_PRICE = { 1: 1000, 2: 2000, 3: 3000 };

const SEASON_PRICE = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const UNIT_MINUTES = 5;
const UNIT_FEE = 200;

const ID_PATTERN = /^(일일권|(\d+)일권)-(\d+)시간$/;

// 없는 이용권이면 null. 있으면 { daily, period, hours, price }.
function parse(passId) {
  const m = ID_PATTERN.exec(passId);
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1] === '일일권') {
    const price = DAILY_PRICE[hours];
    return price === undefined ? null : { daily: true, period: null, hours, price };
  }
  const period = Number(m[2]);
  const price = SEASON_PRICE[period]?.[hours];
  return price === undefined ? null : { daily: false, period, hours, price };
}

function mustParse(passId) {
  const pass = parse(passId);
  if (!pass) throw new RangeError(`없는 이용권: ${passId}`);
  return pass;
}

/** 이용권 가격(원). 없는 이용권이면 RangeError. */
export function price(passId) {
  return mustParse(passId).price;
}

/**
 * 추가요금(원). 기본대여시간 이하면 0원, 넘기면 초과 5분마다 200원.
 * 5분 미만 자투리는 올림한다 (원본에 규정 없음, 미정의 — ontology.md R7).
 */
export function extraFee(passId, minutes) {
  const { hours } = mustParse(passId);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new RangeError(`대여시간은 0 이상의 분이어야 한다: ${minutes}`);
  }
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / UNIT_MINUTES) * UNIT_FEE;
}

/** 회원여부에 따라 이용권을 살 수 있는지. 없는 이용권은 false. */
export function canBuy(passId, isMember) {
  const pass = parse(passId);
  if (!pass) return false;
  if (isMember) return true;
  return pass.daily && pass.hours <= 2;
}
