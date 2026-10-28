// 숨은 채점 — 실험 중 AI는 이 파일을 볼 수 없다(채점 때만 복사).
import { test } from 'node:test';
import assert from 'node:assert/strict';
const { price, extraFee, canBuy } = await import(process.env.FARE);

const prices = { '일일권-1시간': 1000, '일일권-2시간': 2000, '일일권-3시간': 3000, '7일권-1시간': 3000, '7일권-2시간': 4000,
  '30일권-1시간': 5000, '30일권-2시간': 7000, '180일권-1시간': 15000, '180일권-2시간': 20000, '365일권-1시간': 30000, '365일권-2시간': 40000 };
for (const [id, won] of Object.entries(prices)) test(`가격 ${id}`, () => assert.equal(price(id), won));
test('가격 모르는 이용권은 에러', () => assert.throws(() => price('1년권-5시간')));

const extras = [['일일권-1시간', 40, 0], ['일일권-1시간', 60, 0], ['일일권-1시간', 75, 600], ['일일권-2시간', 120, 0], ['일일권-2시간', 140, 800],
  ['일일권-3시간', 190, 400], ['30일권-1시간', 70, 400], ['365일권-2시간', 150, 1200]];
for (const [id, m, won] of extras) test(`추가요금 ${id} ${m}분`, () => assert.equal(extraFee(id, m), won));

const buys = [['일일권-1시간', false, true], ['일일권-2시간', false, true], ['일일권-3시간', false, false], ['일일권-3시간', true, true],
  ['7일권-1시간', false, false], ['7일권-1시간', true, true], ['365일권-2시간', false, false], ['365일권-2시간', true, true]];
for (const [id, mem, ok] of buys) test(`구매 ${id} ${mem ? '회원' : '비회원'}`, () => assert.equal(canBuy(id, mem), ok));
