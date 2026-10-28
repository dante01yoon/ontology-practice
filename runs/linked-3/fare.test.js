import test from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from './fare.js';

test('T-1~T-2 일일권 가격 (R1)', () => {
  assert.equal(price('일일권-1시간'), 1000);
  assert.equal(price('일일권-3시간'), 3000);
});

test('T-4 정기권 가격 (R2)', () => {
  assert.equal(price('30일권-2시간'), 7000);
  assert.equal(price('7일권-1시간'), 3000);
  assert.equal(price('365일권-2시간'), 40000);
});

test('없는 이용권은 price가 예외 (R5)', () => {
  assert.throws(() => price('365일권-3시간'));
  assert.throws(() => price('10일권-1시간'));
  assert.throws(() => price('일일권-4시간'));
  assert.throws(() => price('엉터리'));
});

test('T-3, T-5, T-6 canBuy (R3, R4, R5)', () => {
  assert.equal(canBuy('일일권-1시간', false), true);
  assert.equal(canBuy('일일권-2시간', false), true);
  assert.equal(canBuy('일일권-3시간', false), false);
  assert.equal(canBuy('일일권-3시간', true), true);
  assert.equal(canBuy('7일권-1시간', false), false);
  assert.equal(canBuy('7일권-1시간', true), true);
  assert.equal(canBuy('365일권-3시간', true), false);
  assert.equal(canBuy('엉터리', true), false);
});

test('T-7~T-9 extraFee (R6, R7)', () => {
  assert.equal(extraFee('일일권-1시간', 0), 0);
  assert.equal(extraFee('일일권-1시간', 60), 0);
  assert.equal(extraFee('일일권-1시간', 70), 400);
  assert.equal(extraFee('일일권-1시간', 65), 200);
  assert.equal(extraFee('일일권-1시간', 63), 200); // 올림 가정
  assert.equal(extraFee('30일권-2시간', 130), 400);
});

test('extraFee 잘못된 입력', () => {
  assert.throws(() => extraFee('일일권-1시간', -1));
  assert.throws(() => extraFee('일일권-1시간', NaN));
  assert.throws(() => extraFee('엉터리', 10));
});
