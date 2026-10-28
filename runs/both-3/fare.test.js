import { test } from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from './fare.js';

test('가격표 전체', () => {
  assert.equal(price('일일권-1시간'), 1000);
  assert.equal(price('일일권-2시간'), 2000);
  assert.equal(price('일일권-3시간'), 3000);
  const table = { 7: [3000, 4000], 30: [5000, 7000], 180: [15000, 20000], 365: [30000, 40000] };
  for (const [days, [h1, h2]] of Object.entries(table)) {
    assert.equal(price(`${days}일권-1시간`), h1);
    assert.equal(price(`${days}일권-2시간`), h2);
  }
});

test('없는 이용권은 price 예외, canBuy false', () => {
  for (const id of ['365일권-3시간', '14일권-1시간', '일일권-4시간', '일일권', '', undefined]) {
    assert.throws(() => price(id));
    assert.equal(canBuy(id, true), false);
  }
});

test('canBuy: 회원/비회원', () => {
  assert.equal(canBuy('일일권-1시간', false), true); // T-1
  assert.equal(canBuy('일일권-2시간', false), true);
  assert.equal(canBuy('일일권-3시간', false), false); // T-3
  assert.equal(canBuy('일일권-3시간', true), true); // T-2
  assert.equal(canBuy('7일권-1시간', false), false); // T-5
  assert.equal(canBuy('30일권-2시간', true), true); // T-4
});

test('extraFee', () => {
  assert.equal(extraFee('일일권-1시간', 0), 0);
  assert.equal(extraFee('일일권-1시간', 60), 0); // T-7
  assert.equal(extraFee('일일권-1시간', 70), 400); // T-8
  assert.equal(extraFee('일일권-1시간', 65), 200);
  assert.equal(extraFee('일일권-2시간', 125), 200); // 기본시간은 이용권에서
  assert.equal(extraFee('30일권-2시간', 120), 0);
  assert.throws(() => extraFee('일일권-1시간', -1));
  assert.throws(() => extraFee('일일권-9시간', 10));
});

test('extraFee: 5분 미만 자투리는 올림으로 해석 (T-9 미정의)', () => {
  assert.equal(extraFee('일일권-1시간', 63), 200);
});
