import test from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from './fare.js';

test('가격표 (SDD T-1, T-2, T-4)', () => {
  assert.equal(price('일일권-1시간'), 1000);
  assert.equal(price('일일권-3시간'), 3000);
  assert.equal(price('30일권-2시간'), 7000);
  assert.equal(price('365일권-1시간'), 30000);
});

test('없는 이용권은 price에서 예외', () => {
  for (const id of ['365일권-3시간', '10일권-1시간', '일일권-4시간', '일일권', '', undefined]) {
    assert.throws(() => price(id), id);
  }
});

test('canBuy: 회원은 존재하는 이용권 전부 (T-2, T-4)', () => {
  assert.equal(canBuy('일일권-3시간', true), true);
  assert.equal(canBuy('30일권-2시간', true), true);
});

test('canBuy: 비회원 제한 (T-1, T-3, T-5)', () => {
  assert.equal(canBuy('일일권-1시간', false), true);
  assert.equal(canBuy('일일권-2시간', false), true);
  assert.equal(canBuy('일일권-3시간', false), false);
  assert.equal(canBuy('7일권-1시간', false), false);
});

test('canBuy: 없는 이용권은 회원이어도 false (T-6)', () => {
  assert.equal(canBuy('365일권-3시간', true), false);
  assert.equal(canBuy('abc', true), false);
});

test('extraFee (T-7, T-8)', () => {
  assert.equal(extraFee('일일권-1시간', 0), 0);
  assert.equal(extraFee('일일권-1시간', 60), 0);
  assert.equal(extraFee('일일권-1시간', 70), 400);
  assert.equal(extraFee('일일권-2시간', 130), 400);
  assert.equal(extraFee('30일권-1시간', 65), 200);
});

test('extraFee: 자투리는 올림 (T-9, 원본 미정의라 올림으로 해석)', () => {
  assert.equal(extraFee('일일권-1시간', 63), 200);
  assert.equal(extraFee('일일권-1시간', 61), 200);
});

test('extraFee: 잘못된 입력은 예외', () => {
  assert.throws(() => extraFee('365일권-3시간', 10));
  assert.throws(() => extraFee('일일권-1시간', -1));
  assert.throws(() => extraFee('일일권-1시간', NaN));
});
