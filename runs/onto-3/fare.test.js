import { test } from "node:test";
import assert from "node:assert/strict";
import { price, extraFee, canBuy } from "./fare.js";

test("price", () => {
  assert.equal(price("일일권-1시간"), 1000);
  assert.equal(price("일일권-3시간"), 3000);
  assert.equal(price("30일권-2시간"), 7000);
  assert.equal(price("365일권-1시간"), 30000);
  assert.throws(() => price("7일권-3시간"));
  assert.throws(() => price("abc"));
});

test("extraFee", () => {
  assert.equal(extraFee("일일권-1시간", 59), 0);
  assert.equal(extraFee("일일권-1시간", 60), 0);
  assert.equal(extraFee("일일권-1시간", 61), 200);
  assert.equal(extraFee("일일권-1시간", 65), 200);
  assert.equal(extraFee("일일권-1시간", 66), 400);
  assert.equal(extraFee("30일권-2시간", 130), 400);
  assert.throws(() => extraFee("일일권-1시간", -1));
});

test("canBuy", () => {
  assert.equal(canBuy("일일권-1시간", false), true);
  assert.equal(canBuy("일일권-2시간", false), true);
  assert.equal(canBuy("일일권-3시간", false), false);
  assert.equal(canBuy("일일권-3시간", true), true);
  assert.equal(canBuy("7일권-1시간", false), false);
  assert.equal(canBuy("7일권-1시간", true), true);
  assert.equal(canBuy("7일권-3시간", true), false);
});
