// 따릉이 요금 계산. 규칙은 PRD.md(FR-1~FR-9), SDD.md 참고.

const DAILY_PRICES = { 1: 1000, 2: 2000, 3: 3000 };

// 이용기간(일) -> 기본대여시간(시간) -> 가격(원). 3시간 정기권은 없다 (FR-5).
const SEASON_PRICES = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const OVERAGE_UNIT_MINUTES = 5;
const OVERAGE_UNIT_FEE = 200;

// "일일권-1시간", "30일권-2시간" -> { season, days, hours }. 없는 이용권이면 null.
function parsePass(passId) {
  if (typeof passId !== 'string') return null;
  const m = /^(?:(일일)권|(\d+)일권)-(\d+)시간$/.exec(passId);
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) {
    return hours in DAILY_PRICES ? { season: false, hours } : null;
  }
  const days = Number(m[2]);
  return SEASON_PRICES[days]?.[hours] !== undefined ? { season: true, days, hours } : null;
}

function mustParse(passId) {
  const pass = parsePass(passId);
  if (!pass) throw new Error(`없는 이용권: ${passId}`);
  return pass;
}

// 이용권 가격(원). 없는 이용권이면 예외.
export function price(passId) {
  const pass = mustParse(passId);
  return pass.season ? SEASON_PRICES[pass.days][pass.hours] : DAILY_PRICES[pass.hours];
}

// 추가요금(원). minutes는 대여시간(분). 기본대여시간 이하면 0원 (FR-6).
// 5분 미만 자투리는 원본에 정해져 있지 않아 올림으로 처리한다 (ontology R7).
// 할인은 추가요금에 적용하지 않으므로 할인 인자는 받지 않는다 (FR-8).
export function extraFee(passId, minutes) {
  const pass = mustParse(passId);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`대여시간은 0 이상의 숫자여야 한다: ${minutes}`);
  }
  const over = Math.max(0, minutes - pass.hours * 60);
  return Math.ceil(over / OVERAGE_UNIT_MINUTES) * OVERAGE_UNIT_FEE;
}

// 회원여부(true/false)에 따라 고를 수 있는 이용권인지. 없는 이용권이면 false.
export function canBuy(passId, isMember) {
  const pass = parsePass(passId);
  if (!pass) return false;
  if (isMember) return true;
  return !pass.season && pass.hours <= 2; // FR-3, FR-4
}
