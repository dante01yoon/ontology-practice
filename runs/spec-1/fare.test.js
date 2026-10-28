import { test } from "node:test";
import assert from "node:assert/strict";
import { price, extraFee, canBuy } from "./fare.js";

test("T-1, T-2, T-4: 가격", () => {
  assert.equal(price("일일권-1시간"), 1000);
  assert.equal(price("일일권-3시간"), 3000);
  assert.equal(price("30일권-2시간"), 7000);
  assert.equal(price("365일권-2시간"), 40000);
});

test("FR-5: 없는 이용권은 price가 예외, canBuy가 false", () => {
  for (const id of ["365일권-3시간", "10일권-1시간", "일일권-4시간", "x", undefined]) {
    assert.throws(() => price(id));
    assert.equal(canBuy(id, true), false);
  }
});

test("T-3, T-5, T-6: 구매 가능 여부", () => {
  assert.equal(canBuy("일일권-2시간", false), true);
  assert.equal(canBuy("일일권-3시간", false), false);
  assert.equal(canBuy("일일권-3시간", true), true);
  assert.equal(canBuy("7일권-1시간", false), false);
  assert.equal(canBuy("7일권-1시간", true), true);
});

test("T-7, T-8: 추가요금", () => {
  assert.equal(extraFee("일일권-1시간", 60), 0);
  assert.equal(extraFee("일일권-1시간", 30), 0);
  assert.equal(extraFee("일일권-1시간", 70), 400);
  assert.equal(extraFee("30일권-2시간", 125), 200);
});

test("T-9: 5분 미만 자투리는 올림(미정의 해석)", () => {
  assert.equal(extraFee("일일권-1시간", 63), 200);
});

test("잘못된 대여시간은 예외", () => {
  assert.throws(() => extraFee("일일권-1시간", -1));
  assert.throws(() => extraFee("일일권-1시간", NaN));
});
