// 따릉이 요금 계산. 근거: PRD.md (FR-1~FR-8), SDD.md 4절.
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

// 이용권ID를 풀어 { kind, days, hours, price }로 돌려준다. 없는 이용권이면 null.
function parsePass(passId) {
  const m = /^(?:(일일권)|(\d+)일권)-(\d+)시간$/.exec(passId ?? '');
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) {
    const price = DAILY_PRICE[hours];
    return price === undefined ? null : { kind: '일일권', hours, price };
  }
  const days = Number(m[2]);
  const price = SEASON_PRICE[days]?.[hours];
  return price === undefined ? null : { kind: '정기권', days, hours, price };
}

function mustParse(passId) {
  const pass = parsePass(passId);
  if (!pass) throw new Error(`없는 이용권: ${passId}`);
  return pass;
}

// 이용권 가격(원). 없는 이용권이면 예외.
export function price(passId) {
  return mustParse(passId).price;
}

// 추가요금(원). 기본대여시간 이하면 0원, 넘기면 초과 5분마다 200원.
// 5분 미만 자투리는 원본에 정의가 없어 올림으로 처리한다.
export function extraFee(passId, minutes) {
  const { hours } = mustParse(passId);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`잘못된 대여시간: ${minutes}`);
  }
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / UNIT_MINUTES) * UNIT_FEE;
}

// 고를 수 있는 이용권이면 true. 없는 이용권이거나 회원 전용을 비회원이 고르면 false.
export function canBuy(passId, isMember) {
  const pass = parsePass(passId);
  if (!pass) return false;
  if (isMember) return true;
  return pass.kind === '일일권' && pass.hours <= 2;
}
