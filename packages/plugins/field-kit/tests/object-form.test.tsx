import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ObjectForm } from "../src/widgets/object-form";

vi.mock("@cloudflare/kumo", () => ({
	Button: ({ children, onClick, icon, "aria-label": ariaLabel, disabled }: any) => (
		<button type="button" onClick={onClick} aria-label={ariaLabel} disabled={disabled}>
			{icon}
			{children}
		</button>
	),
	Input: ({ label, value, onChange, type, id, required }: any) => (
		<label>
			{typeof label === "string" ? label : label}
			<input
				id={id}
				type={type ?? "text"}
				value={value ?? ""}
				required={required}
				onChange={onChange}
			/>
		</label>
	),
	InputArea: ({ label, value, onChange, id, required }: any) => (
		<label>
			{typeof label === "string" ? label : label}
			<textarea id={id} value={value ?? ""} required={required} onChange={onChange} />
		</label>
	),
	Select: ({ label, value, onValueChange, items, required }: any) => (
		<label>
			{typeof label === "string" ? label : label}
			<select
				value={value ?? ""}
				required={required}
				onChange={(e) => onValueChange?.(e.target.value)}
			>
				<option value="">—</option>
				{(items ?? []).map((opt: any) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</label>
	),
	Switch: ({ label, checked, onCheckedChange, id }: any) => (
		<label>
			{label}
			<input
				id={id}
				type="checkbox"
				role="switch"
				checked={!!checked}
				onChange={(e) => onCheckedChange?.(e.target.checked)}
			/>
		</label>
	),
}));

vi.mock("@phosphor-icons/react", () => ({
	CaretRight: () => <span>▸</span>,
}));

afterEach(() => cleanup());

describe("ObjectForm widget", () => {
	it("renders sub-fields from options.fields", () => {
		render(
			<ObjectForm
				value={{}}
				onChange={() => {}}
				label="Nutrition"
				id="nut"
				options={{
					fields: [
						{ key: "name", label: "Name", type: "text" },
						{ key: "count", label: "Count", type: "number" },
					],
				}}
			/>,
		);
		expect(screen.getByText("Name")).not.toBeNull();
		expect(screen.getByText("Count")).not.toBeNull();
	});

	it("populates sub-field values from the stored object", () => {
		render(
			<ObjectForm
				value={{ name: "flour", count: 3 }}
				onChange={() => {}}
				label="Nutrition"
				id="nut"
				options={{
					fields: [
						{ key: "name", label: "Name", type: "text" },
						{ key: "count", label: "Count", type: "number" },
					],
				}}
			/>,
		);
		expect(screen.getByDisplayValue("flour")).not.toBeNull();
		expect(screen.getByDisplayValue("3")).not.toBeNull();
	});

	it("emits the full object on field change", () => {
		const onChange = vi.fn();
		render(
			<ObjectForm
				value={{ name: "flour", count: 3 }}
				onChange={onChange}
				label="Nutrition"
				id="nut"
				options={{
					fields: [
						{ key: "name", label: "Name", type: "text" },
						{ key: "count", label: "Count", type: "number" },
					],
				}}
			/>,
		);
		fireEvent.change(screen.getByDisplayValue("flour"), {
			target: { value: "sugar" },
		});
		expect(onChange).toHaveBeenCalledWith({ name: "sugar", count: 3 });
	});

	it("shows misconfigured warning when fields is empty", () => {
		render(
			<ObjectForm
				value={{}}
				onChange={() => {}}
				label="Empty"
				id="empty"
				options={{ fields: [] }}
			/>,
		);
		expect(screen.getByText(/Widget misconfigured/i)).not.toBeNull();
	});

	it("preserves unknown keys not defined in options.fields", () => {
		const onChange = vi.fn();
		render(
			<ObjectForm
				value={{ name: "a", stray: "unexpected" }}
				onChange={onChange}
				label="Form"
				id="f"
				options={{
					fields: [{ key: "name", label: "Name", type: "text" }],
				}}
			/>,
		);
		fireEvent.change(screen.getByDisplayValue("a"), {
			target: { value: "b" },
		});
		// onChange should pass along keys not managed by this widget so stored
		// JSON round-trips cleanly when the schema evolves.
		const payload = onChange.mock.calls[0]?.[0] as Record<string, unknown>;
		expect(payload).toEqual({ name: "b", stray: "unexpected" });
	});

	it("hides a sub-field when visibleWhen.equals does not match", () => {
		const { container } = render(
			<ObjectForm
				value={{ cooked: false, cookingTime: 12 }}
				onChange={() => {}}
				label="Recipe"
				id="r"
				options={{
					fields: [
						{ key: "cooked", label: "Cooked?", type: "boolean" },
						{
							key: "cookingTime",
							label: "Cooking time",
							type: "number",
							visibleWhen: { field: "cooked", equals: true },
						},
					],
				}}
			/>,
		);
		const hiddenInput = container.querySelector("#r-cookingTime");
		expect(hiddenInput).not.toBeNull();
		// Stays in DOM so its value persists across toggles.
		const wrapper = hiddenInput!.closest('[aria-hidden="true"]');
		expect(wrapper).not.toBeNull();
		expect((wrapper as HTMLElement).style.display).toBe("none");
	});

	it("shows a sub-field when visibleWhen.equals matches", () => {
		const { container } = render(
			<ObjectForm
				value={{ cooked: true, cookingTime: 12 }}
				onChange={() => {}}
				label="Recipe"
				id="r"
				options={{
					fields: [
						{ key: "cooked", label: "Cooked?", type: "boolean" },
						{
							key: "cookingTime",
							label: "Cooking time",
							type: "number",
							visibleWhen: { field: "cooked", equals: true },
						},
					],
				}}
			/>,
		);
		const cookingInput = container.querySelector("#r-cookingTime");
		expect(cookingInput).not.toBeNull();
		expect(cookingInput!.closest('[aria-hidden="true"]')).toBeNull();
	});

	it("supports visibleWhen.in to match any of several values", () => {
		const { container } = render(
			<ObjectForm
				value={{ status: "review" }}
				onChange={() => {}}
				label="Doc"
				id="d"
				options={{
					fields: [
						{
							key: "status",
							label: "Status",
							type: "select",
							options: [
								{ value: "draft", label: "Draft" },
								{ value: "review", label: "Review" },
								{ value: "published", label: "Published" },
							],
						},
						{
							key: "reviewer",
							label: "Reviewer",
							type: "text",
							visibleWhen: { field: "status", in: ["draft", "review"] },
						},
					],
				}}
			/>,
		);
		const reviewer = container.querySelector("#d-reviewer");
		expect(reviewer).not.toBeNull();
		expect(reviewer!.closest('[aria-hidden="true"]')).toBeNull();
	});

	it("strips required from hidden sub-fields so save isn't blocked", () => {
		const { container } = render(
			<ObjectForm
				value={{ cooked: false }}
				onChange={() => {}}
				label="Recipe"
				id="r"
				options={{
					fields: [
						{ key: "cooked", label: "Cooked?", type: "boolean" },
						{
							key: "cookingTime",
							label: "Cooking time",
							type: "number",
							required: true,
							visibleWhen: { field: "cooked", equals: true },
						},
					],
				}}
			/>,
		);
		const hiddenInput = container.querySelector("#r-cookingTime") as HTMLInputElement | null;
		expect(hiddenInput).not.toBeNull();
		expect(hiddenInput!.required).toBe(false);
	});

	it("gives each sub-field a unique DOM id composed from the parent id", () => {
		const { container } = render(
			<ObjectForm
				value={{}}
				onChange={() => {}}
				label="Form"
				id="nutrition"
				options={{
					fields: [
						{ key: "calories", label: "Calories", type: "number" },
						{ key: "protein", label: "Protein", type: "number" },
					],
				}}
			/>,
		);
		expect(container.querySelector("#nutrition-calories")).not.toBeNull();
		expect(container.querySelector("#nutrition-protein")).not.toBeNull();
	});
});
