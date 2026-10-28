// 따릉이 요금 계산. 규칙 근거: ontology.md
// 이용권ID 형식: "일일권-1시간", "30일권-2시간"

const DAILY = { 1: 1000, 2: 2000, 3: 3000 };
const PASS = {
  7: { 1: 3000, 2: 4000 },
  30: { 1: 5000, 2: 7000 },
  180: { 1: 15000, 2: 20000 },
  365: { 1: 30000, 2: 40000 },
};

const UNIT_MINUTES = 5;
const UNIT_FEE = 200;

// 존재하지 않는 이용권이면 null
function parse(id) {
  const m = /^(?:(일일)권|(\d+)일권)-(\d+)시간$/.exec(id ?? '');
  if (!m) return null;
  const hours = Number(m[3]);
  if (m[1]) {
    return hours in DAILY ? { daily: true, hours, price: DAILY[hours] } : null;
  }
  const price = PASS[Number(m[2])]?.[hours];
  return price === undefined ? null : { daily: false, hours, price };
}

function mustParse(id) {
  const ticket = parse(id);
  if (!ticket) throw new Error(`존재하지 않는 이용권: ${id}`);
  return ticket;
}

export function price(id) {
  return mustParse(id).price;
}

// R7: 초과시간 5분마다 200원.
// 5분 미만 자투리는 원본에 정의가 없어 올림으로 처리한다.
export function extraFee(id, minutes) {
  const { hours } = mustParse(id);
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`잘못된 대여시간: ${minutes}`);
  }
  const over = Math.max(0, minutes - hours * 60);
  return Math.ceil(over / UNIT_MINUTES) * UNIT_FEE;
}

// R3·R4: 비회원은 일일권 1·2시간권만. 존재하지 않는 이용권은 false.
export function canBuy(id, isMember) {
  const ticket = parse(id);
  if (!ticket) return false;
  if (isMember) return true;
  return ticket.daily && ticket.hours <= 2;
}
