// 따릉이 요금 계산. 근거: ontology.md, PRD.md, SDD.md
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

// 5분 미만 자투리 처리는 원본에 없어 미정의(PRD 8절). 올림으로 해석했다.
// 버림으로 바꾸려면 Math.floor 로 교체한다.
const roundUnits = Math.ceil;

const ID_PATTERN = /^(?:(일일)|(\d+)일)권-(\d+)시간$/;

// 없는 이용권ID면 null
function parse(id) {
  const m = typeof id === 'string' ? ID_PATTERN.exec(id) : null;
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) {
    return DAY_PRICE[hours] === undefined ? null : { kind: '일일권', hours, price: DAY_PRICE[hours] };
  }
  const days = Number(m[2]);
  const price = SEASON_PRICE[days]?.[hours];
  return price === undefined ? null : { kind: '정기권', days, hours, price };
}

function mustParse(id) {
  const pass = parse(id);
  if (!pass) throw new Error(`없는 이용권: ${id}`);
  return pass;
}

// 이용권 가격(원). 없는 이용권이면 예외.
export function price(id) {
  return mustParse(id).price;
}

// 추가요금(원). 대여시간이 기본대여시간 이하이면 0. 할인은 적용하지 않는다.
export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  if (!Number.isFinite(minutes) || minutes < 0) throw new Error(`잘못된 대여시간: ${minutes}`);
  const over = Math.max(0, minutes - hours * 60);
  return roundUnits(over / UNIT_MINUTES) * UNIT_FEE;
}

// 회원여부(true=회원)에 따라 고를 수 있는 이용권인지. 없는 이용권이면 false.
export function canBuy(id, isMember) {
  const pass = parse(id);
  if (!pass) return false;
  if (isMember) return true;
  return pass.kind === '일일권' && pass.hours <= 2;
}
