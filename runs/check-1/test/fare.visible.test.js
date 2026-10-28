import { test } from 'node:test';
import assert from 'node:assert/strict';
import { price, extraFee, canBuy } from '../fare.js';

test('일일권 1시간권 가격', () => assert.equal(price('일일권-1시간'), 1000));
test('2시간권 130분 → 10분 초과', () => assert.equal(extraFee('일일권-2시간', 130), 400));
test('비회원은 정기권 못 삼', () => assert.equal(canBuy('30일권-1시간', false), false));
