import { describe, expect, it } from "vitest";

import { isSubFieldVisible } from "../src/shared/utils";

describe("isSubFieldVisible", () => {
	it("returns true when no condition is set", () => {
		expect(isSubFieldVisible(undefined, { foo: "bar" })).toBe(true);
	});

	it("equals: matches strictly", () => {
		expect(isSubFieldVisible({ field: "cooked", equals: true }, { cooked: true })).toBe(true);
		expect(isSubFieldVisible({ field: "cooked", equals: true }, { cooked: false })).toBe(false);
		// Strict equality — number 1 does not match string "1".
		expect(isSubFieldVisible({ field: "n", equals: 1 }, { n: "1" })).toBe(false);
	});

	it("notEquals: matches strictly", () => {
		expect(isSubFieldVisible({ field: "stock", notEquals: true }, { stock: false })).toBe(true);
		expect(isSubFieldVisible({ field: "stock", notEquals: true }, { stock: true })).toBe(false);
	});

	it("in: matches any of the listed values", () => {
		const cond = { field: "status", in: ["draft", "review"] };
		expect(isSubFieldVisible(cond, { status: "draft" })).toBe(true);
		expect(isSubFieldVisible(cond, { status: "review" })).toBe(true);
		expect(isSubFieldVisible(cond, { status: "published" })).toBe(false);
	});

	it("notIn: matches when value is not in the list", () => {
		const cond = { field: "status", notIn: ["archived", "deleted"] };
		expect(isSubFieldVisible(cond, { status: "draft" })).toBe(true);
		expect(isSubFieldVisible(cond, { status: "archived" })).toBe(false);
	});

	it("treats a missing sibling field as undefined", () => {
		expect(isSubFieldVisible({ field: "missing", equals: undefined }, {})).toBe(true);
		expect(isSubFieldVisible({ field: "missing", equals: "x" }, {})).toBe(false);
		expect(isSubFieldVisible({ field: "missing", in: ["a", "b"] }, {})).toBe(false);
		expect(isSubFieldVisible({ field: "missing", notIn: ["a", "b"] }, {})).toBe(true);
	});
});
