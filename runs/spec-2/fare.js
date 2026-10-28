// 따릉이 요금 계산 (PRD.md, SDD.md 기준)
// 이용권ID: "일일권-1시간", "30일권-2시간" 모양

const DAY_PRICES = { 1: 1000, 2: 2000, 3: 3000 };

const SEASON_PRICES = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const OVERAGE_UNIT_MIN = 5;
const OVERAGE_UNIT_FEE = 200;

// 없는 이용권이면 null, 있으면 { season, hours, price }
function parse(passId) {
  const m = /^(일일|\d+일)권-(\d+)시간$/.exec(passId);
  if (!m) return null;
  const hours = Number(m[2]);
  if (m[1] === '일일') {
    const price = DAY_PRICES[hours];
    return price === undefined ? null : { season: false, hours, price };
  }
  const price = SEASON_PRICES[Number(m[1].slice(0, -1))]?.[hours];
  return price === undefined ? null : { season: true, hours, price };
}

function require(passId) {
  const pass = parse(passId);
  if (!pass) throw new Error(`없는 이용권: ${passId}`);
  return pass;
}

// 이용권 가격(원). 없는 이용권이면 예외.
export function price(passId) {
  return require(passId).price;
}

// 추가요금(원). 기본대여시간 이하면 0, 초과하면 5분마다 200원.
// 5분 미만 자투리는 원본에 없어 올림으로 처리한다 (SDD 4.2).
export function extraFee(passId, minutes) {
  const { hours } = require(passId);
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / OVERAGE_UNIT_MIN) * OVERAGE_UNIT_FEE;
}

// 구매 가능 여부. 없는 이용권, 비회원의 정기권·3시간권은 false.
export function canBuy(passId, isMember) {
  const pass = parse(passId);
  if (!pass) return false;
  if (isMember) return true;
  return !pass.season && pass.hours <= 2;
}
