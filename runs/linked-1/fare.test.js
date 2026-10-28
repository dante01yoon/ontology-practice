import test from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from './fare.js';

test('price: 가격표 (R1, R2)', () => {
  assert.equal(price('일일권-1시간'), 1000);
  assert.equal(price('일일권-3시간'), 3000);
  assert.equal(price('30일권-2시간'), 7000);
  assert.equal(price('365일권-1시간'), 30000);
});

test('price: 없는 이용권은 예외 (R5)', () => {
  assert.throws(() => price('365일권-3시간'));
  assert.throws(() => price('10일권-1시간'));
  assert.throws(() => price('일일권-4시간'));
  assert.throws(() => price('엉뚱한값'));
});

test('canBuy: 회원/비회원 (R3, R4, R5)', () => {
  assert.equal(canBuy('일일권-1시간', false), true);
  assert.equal(canBuy('일일권-2시간', false), true);
  assert.equal(canBuy('일일권-3시간', false), false);
  assert.equal(canBuy('일일권-3시간', true), true);
  assert.equal(canBuy('7일권-1시간', false), false);
  assert.equal(canBuy('30일권-2시간', true), true);
  assert.equal(canBuy('365일권-3시간', true), false);
});

test('extraFee: 기본시간 이하는 0원 (R6)', () => {
  assert.equal(extraFee('일일권-1시간', 0), 0);
  assert.equal(extraFee('일일권-1시간', 60), 0);
  assert.equal(extraFee('일일권-2시간', 120), 0);
});

test('extraFee: 5분마다 200원 (R7)', () => {
  assert.equal(extraFee('일일권-1시간', 70), 400);
  assert.equal(extraFee('30일권-2시간', 135), 600);
});

test('extraFee: 자투리는 올림 (미정의 → 올림 해석)', () => {
  assert.equal(extraFee('일일권-1시간', 63), 200);
  assert.equal(extraFee('일일권-1시간', 61), 200);
});

test('extraFee: 잘못된 입력은 예외', () => {
  assert.throws(() => extraFee('일일권-1시간', -1));
  assert.throws(() => extraFee('일일권-1시간', NaN));
  assert.throws(() => extraFee('없는권', 10));
});
