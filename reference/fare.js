const DAY = ['일일권'], PASS = ['7일권', '30일권', '180일권', '365일권'];
const TICKETS = {
  '일일권-1시간': [60, 1000], '일일권-2시간': [120, 2000], '일일권-3시간': [180, 3000],
  '7일권-1시간': [60, 3000], '7일권-2시간': [120, 4000], '30일권-1시간': [60, 5000], '30일권-2시간': [120, 7000],
  '180일권-1시간': [60, 15000], '180일권-2시간': [120, 20000], '365일권-1시간': [60, 30000], '365일권-2시간': [120, 40000],
};
const get = (id) => { if (!TICKETS[id]) throw new Error(`모르는 이용권: ${id}`); return TICKETS[id]; };
export const price = (id) => get(id)[1];
export const extraFee = (id, minutes) => Math.max(0, Math.ceil((minutes - get(id)[0]) / 5)) * 200;
export const canBuy = (id, member) => { get(id); const kind = id.split('-')[0];
  if (PASS.includes(kind)) return member; return member || id !== '일일권-3시간'; };
