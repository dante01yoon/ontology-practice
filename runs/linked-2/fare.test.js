import test from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from './fare.js';

test('가격표 (R1, R2)', () => {
  assert.equal(price('일일권-1시간'), 1000);
  assert.equal(price('일일권-3시간'), 3000);
  assert.equal(price('30일권-2시간'), 7000);
  assert.equal(price('365일권-1시간'), 30000);
});

test('없는 이용권은 price 예외 (R5)', () => {
  assert.throws(() => price('365일권-3시간'));
  assert.throws(() => price('14일권-1시간'));
  assert.throws(() => price('일일권-4시간'));
  assert.throws(() => price('엉터리'));
});

test('canBuy (R3, R4, R5)', () => {
  assert.equal(canBuy('일일권-1시간', false), true);
  assert.equal(canBuy('일일권-2시간', false), true);
  assert.equal(canBuy('일일권-3시간', false), false);
  assert.equal(canBuy('일일권-3시간', true), true);
  assert.equal(canBuy('7일권-1시간', false), false);
  assert.equal(canBuy('7일권-1시간', true), true);
  assert.equal(canBuy('365일권-3시간', true), false);
  assert.equal(canBuy('엉터리', true), false);
});

test('extraFee (R6, R7)', () => {
  assert.equal(extraFee('일일권-1시간', 0), 0);
  assert.equal(extraFee('일일권-1시간', 60), 0);
  assert.equal(extraFee('일일권-1시간', 65), 200);
  assert.equal(extraFee('일일권-1시간', 70), 400);
  assert.equal(extraFee('일일권-1시간', 63), 200); // 올림 (미정의 사항에 대한 선택)
  assert.equal(extraFee('30일권-2시간', 150), 1200);
  assert.throws(() => extraFee('일일권-1시간', -1));
  assert.throws(() => extraFee('일일권-4시간', 10));
});
