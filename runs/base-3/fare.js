// 따릉이 요금 계산 모듈. 이용권ID 형식: "<종류>-<대여시간>" (예: "일일권-1시간")

const PRICES = {
  '일일권-1시간': 1000,
  '일일권-2시간': 2000,
  '7일권-1시간': 3000,
  '7일권-2시간': 4000,
  '30일권-1시간': 5000,
  '30일권-2시간': 7000,
  '180일권-1시간': 15000,
  '180일권-2시간': 20000,
  '365일권-1시간': 30000,
  '365일권-2시간': 40000,
};

const NON_MEMBER_PASS = '일일권';
const EXTRA_UNIT_MINUTES = 5;
const EXTRA_UNIT_FEE = 200;

function parse(id) {
  if (!Object.hasOwn(PRICES, id)) {
    throw new Error(`알 수 없는 이용권ID: ${id}`);
  }
  const [kind, duration] = id.split('-');
  return { kind, includedMinutes: parseInt(duration, 10) * 60 };
}

export function price(id) {
  parse(id);
  return PRICES[id];
}

// minutes: 총 이용 시간(분). 기본 대여시간을 넘은 부분에 대해 5분(올림)당 200원.
export function extraFee(id, minutes) {
  const { includedMinutes } = parse(id);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`잘못된 이용 시간: ${minutes}`);
  }
  const over = Math.max(0, minutes - includedMinutes);
  return Math.ceil(over / EXTRA_UNIT_MINUTES) * EXTRA_UNIT_FEE;
}

// 비회원은 일일권만 구매 가능, 회원은 모든 이용권 구매 가능.
export function canBuy(id, isMember) {
  const { kind } = parse(id);
  return isMember ? true : kind === NON_MEMBER_PASS;
}
