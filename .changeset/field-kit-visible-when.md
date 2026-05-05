---
"@emdash-cms/plugin-field-kit": minor
---

Adds conditional sub-field visibility (`visibleWhen`) to `object-form` and `list` widgets. Sub-fields can declare a rule that hides them when a sibling value doesn't match — e.g. show "Cooking time" only when "Cooked?" is checked. Operators: `equals`, `notEquals`, `in`, `notIn` (strict equality). Hidden fields stay in the DOM so values persist across toggles, and `required` is stripped while hidden so HTML5 validation can't block save. The `list` widget evaluates conditions per-row.
