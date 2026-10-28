// 따릉이 요금 계산 모듈
// 이용권ID 형식: "<종류>-<시간>" (예: "일일권-1시간", "30일권-2시간")

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

const EXTRA_UNIT_MINUTES = 15; // 초과 요금 단위
const EXTRA_UNIT_FEE = 1000; // 단위당 초과 요금
const NON_MEMBER_PASS = '일일권'; // 비회원도 구매 가능한 종류

function parse(passId) {
  if (!Object.hasOwn(PRICES, passId)) {
    throw new Error(`알 수 없는 이용권ID: ${passId}`);
  }
  const [kind, duration] = passId.split('-');
  return { kind, limitMinutes: parseInt(duration, 10) * 60 };
}

/** 이용권 가격(원) */
export function price(passId) {
  parse(passId);
  return PRICES[passId];
}

/** 총 이용 시간(분) 기준 초과 요금(원). 이용권 시간 이내면 0, 초과분은 15분 단위 올림 */
export function extraFee(passId, minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`잘못된 이용 시간: ${minutes}`);
  }
  const { limitMinutes } = parse(passId);
  const over = Math.max(0, minutes - limitMinutes);
  return Math.ceil(over / EXTRA_UNIT_MINUTES) * EXTRA_UNIT_FEE;
}

/** 구매 가능 여부. 일일권은 비회원도 가능, 나머지는 회원만 */
export function canBuy(passId, isMember) {
  const { kind } = parse(passId);
  return kind === NON_MEMBER_PASS || Boolean(isMember);
}
