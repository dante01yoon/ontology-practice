import { test } from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from './fare.js';

test('price: SDD T-1, T-2, T-4 및 전체 가격표', () => {
  assert.equal(price('일일권-1시간'), 1000);
  assert.equal(price('일일권-3시간'), 3000);
  assert.equal(price('30일권-2시간'), 7000);
  assert.equal(price('365일권-2시간'), 40000);
  assert.equal(price('7일권-1시간'), 3000);
  assert.equal(price('180일권-1시간'), 15000);
});

test('price: 없는 이용권은 예외', () => {
  assert.throws(() => price('365일권-3시간'));
  assert.throws(() => price('10일권-1시간'));
  assert.throws(() => price('일일권-4시간'));
  assert.throws(() => price('아무거나'));
});

test('canBuy: SDD T-3, T-5, T-6', () => {
  assert.equal(canBuy('일일권-1시간', false), true);
  assert.equal(canBuy('일일권-2시간', false), true);
  assert.equal(canBuy('일일권-3시간', false), false);
  assert.equal(canBuy('일일권-3시간', true), true);
  assert.equal(canBuy('7일권-1시간', false), false);
  assert.equal(canBuy('30일권-2시간', true), true);
  assert.equal(canBuy('365일권-3시간', true), false);
});

test('extraFee: SDD T-7, T-8, T-9(올림)', () => {
  assert.equal(extraFee('일일권-1시간', 60), 0);
  assert.equal(extraFee('일일권-1시간', 30), 0);
  assert.equal(extraFee('일일권-1시간', 70), 400);
  assert.equal(extraFee('일일권-1시간', 65), 200);
  assert.equal(extraFee('일일권-1시간', 63), 200);
  assert.equal(extraFee('30일권-2시간', 130), 1200 - 800);
});

test('extraFee: 잘못된 입력은 예외', () => {
  assert.throws(() => extraFee('일일권-1시간', -1));
  assert.throws(() => extraFee('일일권-1시간', NaN));
  assert.throws(() => extraFee('없는권', 10));
});
