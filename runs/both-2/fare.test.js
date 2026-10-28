import { test } from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from './fare.js';

test('price: SDD T-1, T-2, T-4', () => {
  assert.equal(price('일일권-1시간'), 1000);
  assert.equal(price('일일권-3시간'), 3000);
  assert.equal(price('30일권-2시간'), 7000);
  assert.equal(price('365일권-1시간'), 30000);
});

test('price: 없는 이용권은 거부', () => {
  assert.throws(() => price('365일권-3시간'), RangeError);
  assert.throws(() => price('10일권-1시간'), RangeError);
  assert.throws(() => price('일일권-4시간'), RangeError);
  assert.throws(() => price('엉터리'), RangeError);
});

test('canBuy: 회원/비회원', () => {
  assert.equal(canBuy('일일권-1시간', false), true);
  assert.equal(canBuy('일일권-2시간', false), true);
  assert.equal(canBuy('일일권-3시간', false), false);
  assert.equal(canBuy('7일권-1시간', false), false);
  assert.equal(canBuy('일일권-3시간', true), true);
  assert.equal(canBuy('7일권-1시간', true), true);
  assert.equal(canBuy('365일권-3시간', true), false);
  assert.equal(canBuy('엉터리', true), false);
});

test('extraFee: T-7, T-8, T-9(올림 가정)', () => {
  assert.equal(extraFee('일일권-1시간', 30), 0);
  assert.equal(extraFee('일일권-1시간', 60), 0);
  assert.equal(extraFee('일일권-1시간', 70), 400);
  assert.equal(extraFee('일일권-1시간', 63), 200);
  assert.equal(extraFee('30일권-2시간', 125), 200);
});

test('extraFee: 잘못된 입력', () => {
  assert.throws(() => extraFee('일일권-1시간', -1), RangeError);
  assert.throws(() => extraFee('엉터리', 10), RangeError);
});
