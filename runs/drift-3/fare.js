// 따릉이 요금 계산. 근거: ontology.md, PRD.md, SDD.md

const UNIT_MINUTES = 5;
const UNIT_FEE = 200;

// 이용권ID("일일권-1시간", "30일권-2시간") → 가격(원)
const PRICES = {
  '일일권-1시간': 1000,
  '일일권-2시간': 2000,
  '일일권-3시간': 3000,
  '7일권-1시간': 3000,
  '7일권-2시간': 4000,
  '30일권-1시간': 5000,
  '30일권-2시간': 7000,
  '180일권-1시간': 15000,
  '180일권-2시간': 20000,
  '365일권-1시간': 30000,
  '365일권-2시간': 40000,
};

const MEMBER_ONLY_EXTRA = new Set(['일일권-3시간']);

function assertValid(passId) {
  if (!Object.hasOwn(PRICES, passId)) {
    throw new Error(`없는 이용권: ${passId}`);
  }
}

// 기본대여시간(분)
function baseMinutes(passId) {
  return Number(passId.split('-')[1].replace('시간', '')) * 60;
}

export function price(passId) {
  assertValid(passId);
  return PRICES[passId];
}

// 5분 미만 자투리는 원본에 정의가 없어 올림으로 처리한다.
export function extraFee(passId, minutes) {
  assertValid(passId);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`잘못된 대여시간: ${minutes}`);
  }
  const over = Math.max(0, minutes - baseMinutes(passId));
  return Math.ceil(over / UNIT_MINUTES) * UNIT_FEE;
}

// 없는 이용권이면 false. 정기권·3시간 일일권은 회원만 가능.
export function canBuy(passId, isMember) {
  if (!Object.hasOwn(PRICES, passId)) return false;
  if (isMember) return true;
  return passId.startsWith('일일권-') && !MEMBER_ONLY_EXTRA.has(passId);
}
