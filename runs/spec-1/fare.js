// 따릉이 요금 계산. 요구사항은 PRD.md, 설계는 SDD.md 참고.

const DAY_PRICE = { 1: 1000, 2: 2000, 3: 3000 };

const SEASON_PRICE = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const UNIT_MINUTES = 5;
const UNIT_FEE = 200;

// "일일권-1시간", "30일권-2시간" -> { kind, days, hours, price }. 없는 이용권이면 null.
function parse(id) {
  if (typeof id !== "string") return null;
  const m = /^(?:(일일)|(\d+)일)권-(\d+)시간$/.exec(id);
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) {
    const price = DAY_PRICE[hours];
    return price === undefined ? null : { kind: "일일권", hours, price };
  }
  const days = Number(m[2]);
  const price = SEASON_PRICE[days]?.[hours];
  return price === undefined ? null : { kind: "정기권", days, hours, price };
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

// 추가요금(원). 기본대여시간 이하면 0, 넘기면 초과 5분마다 200원.
// 5분 미만 자투리는 PRD에서 미정의 -> 올림으로 처리한다.
export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`잘못된 대여시간: ${minutes}`);
  }
  const over = minutes - hours * 60;
  if (over <= 0) return 0;
  return Math.ceil(over / UNIT_MINUTES) * UNIT_FEE;
}

// 이 이용자가 이 이용권을 고를 수 있는지. 없는 이용권도 false.
export function canBuy(id, isMember) {
  const pass = parse(id);
  if (!pass) return false;
  if (isMember) return true;
  return pass.kind === "일일권" && pass.hours <= 2;
}
