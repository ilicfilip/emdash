/** Sub-field types available in object-form and list widgets. */
export type SubFieldType =
	| "text"
	| "number"
	| "boolean"
	| "select"
	| "textarea"
	| "date"
	| "color"
	| "url";

/**
 * Conditional visibility rule for a sub-field. Evaluated against sibling values
 * (the form object for `object-form`, the row object for `list`). Uses strict
 * equality — `equals: 1` does not match `"1"`.
 *
 * Hidden sub-fields stay in the rendered DOM (display:none) so their values
 * persist across toggles and round-trip through save. `required` is ignored
 * while hidden so HTML5 validation does not block save.
 */
export type VisibleWhenCondition =
	| { field: string; equals: unknown }
	| { field: string; notEquals: unknown }
	| { field: string; in: unknown[] }
	| { field: string; notIn: unknown[] };

/** A single sub-field definition, used in object-form and list options.fields. */
export interface SubFieldDef {
	/** JSON object key this sub-field maps to. */
	key: string;
	/** Display label. */
	label: string;
	/** Input type. */
	type: SubFieldType;
	/** Whether this sub-field is required. */
	required?: boolean;
	/** Placeholder text. */
	placeholder?: string;
	/** Help text shown below the input. */
	helpText?: string;
	/** Default value when creating new items. */
	defaultValue?: unknown;
	/**
	 * For type: "select" — the available options.
	 * Accepts either string[] or Array<{ label: string; value: string }>.
	 */
	options?: string[] | Array<{ label: string; value: string }>;
	/** For type: "number" — minimum value. */
	min?: number;
	/** For type: "number" — maximum value. */
	max?: number;
	/** For type: "number" — step increment. */
	step?: number;
	/** For type: "number" — unit label after the input (e.g. "kg", "kcal"). */
	suffix?: string;
	/** For type: "number" — label before the input (e.g. "$"). */
	prefix?: string;
	/** For type: "textarea" — number of rows. */
	rows?: number;
	/** Show this sub-field only when the condition matches. See `VisibleWhenCondition`. */
	visibleWhen?: VisibleWhenCondition;
}

/** Props passed to every field widget component by EmDash admin. */
export interface FieldWidgetProps {
	/** Current field value. */
	value: unknown;
	/** Callback to update the field value. Must receive the complete new value. */
	onChange: (value: unknown) => void;
	/** Field label from the schema. */
	label: string;
	/** HTML id attribute. */
	id: string;
	/** Whether the field is required. */
	required?: boolean;
	/** Widget-specific options from the seed field definition. */
	options?: Record<string, unknown>;
	/** When true, render in compact mode (hide the top-level label). */
	minimal?: boolean;
}

/** Row/column definition for the grid widget. */
export interface GridAxisDef {
	/** Unique key used in the stored value object. */
	key: string;
	/** Display label. */
	label: string;
	/** Optional icon image URL. */
	image?: string;
}
