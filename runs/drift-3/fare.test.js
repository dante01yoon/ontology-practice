import test from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from './fare.js';

test('price: 일일권/정기권 가격표', () => {
  assert.equal(price('일일권-1시간'), 1000);
  assert.equal(price('일일권-3시간'), 3000);
  assert.equal(price('30일권-2시간'), 7000);
  assert.equal(price('365일권-2시간'), 40000);
});

test('price: 없는 이용권은 예외', () => {
  assert.throws(() => price('365일권-3시간'));
  assert.throws(() => price('10일권-1시간'));
  assert.throws(() => price('toString'));
});

test('canBuy', () => {
  assert.equal(canBuy('일일권-1시간', false), true);
  assert.equal(canBuy('일일권-2시간', false), true);
  assert.equal(canBuy('일일권-3시간', false), false);
  assert.equal(canBuy('일일권-3시간', true), true);
  assert.equal(canBuy('7일권-1시간', false), false);
  assert.equal(canBuy('7일권-1시간', true), true);
  assert.equal(canBuy('365일권-3시간', true), false);
});

test('extraFee', () => {
  assert.equal(extraFee('일일권-1시간', 30), 0);
  assert.equal(extraFee('일일권-1시간', 60), 0);
  assert.equal(extraFee('일일권-1시간', 70), 400);
  assert.equal(extraFee('30일권-2시간', 130), 400);
  assert.throws(() => extraFee('일일권-1시간', -1));
});

test('extraFee: 5분 미만 자투리는 올림 (미정의 사항)', () => {
  assert.equal(extraFee('일일권-1시간', 63), 200);
});
