// 따릉이 요금 계산. 이용권ID 형식: "<종류>-<N>시간" (예: "일일권-1시간", "30일권-2시간")

const PRICES = {
  '일일권': { 1: 1000, 2: 2000 },
  '7일권': { 1: 2000, 2: 3000 },
  '30일권': { 1: 3000, 2: 4000 },
  '180일권': { 1: 6000, 2: 9000 },
  '365일권': { 1: 10000, 2: 15000 },
};

const NON_MEMBER_PASSES = new Set(['일일권']);
const EXTRA_UNIT_MINUTES = 5;
const EXTRA_UNIT_FEE = 200;

function parse(passId) {
  const match = /^(.+)-(\d+)시간$/.exec(passId);
  const hours = match && Number(match[2]);
  const price = match && PRICES[match[1]]?.[hours];
  if (price === undefined) {
    throw new Error(`알 수 없는 이용권: ${passId}`);
  }
  return { kind: match[1], hours, price };
}

export function price(passId) {
  return parse(passId).price;
}

export function extraFee(passId, minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`잘못된 이용 시간: ${minutes}`);
  }
  const { hours } = parse(passId);
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / EXTRA_UNIT_MINUTES) * EXTRA_UNIT_FEE;
}

export function canBuy(passId, isMember) {
  const { kind } = parse(passId);
  return isMember || NON_MEMBER_PASSES.has(kind);
}
