// 따릉이 요금 계산. 근거: ontology.md, PRD.md, SDD.md

const DAILY_PRICE = { 1: 1000, 2: 2000, 3: 3000 };

const SEASON_PRICE = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const OVERAGE_UNIT_MINUTES = 5;
const OVERAGE_UNIT_FEE = 200;

// "일일권-1시간", "30일권-2시간" -> { days: null | 30, hours: 2 }. 없는 이용권이면 null.
function parse(passId) {
  const m = /^(?:일일권|(\d+)일권)-(\d+)시간$/.exec(passId);
  if (!m) return null;
  const days = m[1] === undefined ? null : Number(m[1]);
  const hours = Number(m[2]);
  const price = days === null ? DAILY_PRICE[hours] : SEASON_PRICE[days]?.[hours];
  return price === undefined ? null : { days, hours, price };
}

function mustParse(passId) {
  const pass = parse(passId);
  if (!pass) throw new Error(`없는 이용권: ${passId}`);
  return pass;
}

// 이용권 가격(원). 없는 이용권이면 예외.
export function price(passId) {
  return mustParse(passId).price;
}

// 추가요금(원). 초과 5분마다 200원, 5분 미만 자투리는 올림(원본 미정의, 올림으로 해석).
// 대여시간이 기본대여시간 이하이면 0원. 할인은 적용하지 않는다.
export function extraFee(passId, minutes) {
  const { hours } = mustParse(passId);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`잘못된 대여시간: ${minutes}`);
  }
  const overage = Math.max(0, minutes - hours * 60);
  return Math.ceil(overage / OVERAGE_UNIT_MINUTES) * OVERAGE_UNIT_FEE;
}

// 구매 가능 여부. 정기권은 회원 전용, 비회원은 일일권 1·2시간권만. 없는 이용권은 false.
export function canBuy(passId, isMember) {
  const pass = parse(passId);
  if (!pass) return false;
  if (isMember) return true;
  return pass.days === null && pass.hours <= 2;
}
