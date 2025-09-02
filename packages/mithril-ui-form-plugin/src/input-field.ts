import { Attributes } from 'mithril';
import { ComponentType } from './component-type';
import { UIForm } from './form';
import { I18n } from './i18n';

/**
 * **Core Types**
 * @category Core Types
 */

/**
 * Comprehensive field definition interface for dynamic form components.
 * 
 * InputField represents a single form field configuration within the mithril-ui-form system.
 * It defines all the properties and behaviors available for form fields, including validation,
 * conditional visibility, data transformation, and UI customization options.
 * 
 * This interface supports a wide range of field types through the plugin system while maintaining
 * type safety and providing extensive customization options for complex form scenarios.
 * 
 * @template O - The type of the object being edited by the form
 * @template K - The specific property key of the object this field represents
 * 
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   email: string;
 *   age: number;
 *   preferences: {
 *     theme: 'light' | 'dark';
 *     notifications: boolean;
 *   };
 * }
 * 
 * // Simple text field
 * const nameField: InputField<User, 'name'> = {
 *   id: 'name',
 *   type: 'text',
 *   label: 'Full Name',
 *   required: true,
 *   maxLength: 50,
 *   placeholder: 'Enter your full name'
 * };
 * 
 * // Number field with validation
 * const ageField: InputField<User, 'age'> = {
 *   id: 'age',
 *   type: 'number',
 *   label: 'Age',
 *   min: 13,
 *   max: 120,
 *   required: true,
 *   description: 'Must be between 13 and 120 years old'
 * };
 * 
 * // Select field with conditional visibility
 * const themeField: InputField<User, 'preferences'> = {
 *   id: 'preferences',
 *   type: 'select',
 *   label: 'Theme Preference',
 *   options: [
 *     { id: 'light', label: 'Light Theme' },
 *     { id: 'dark', label: 'Dark Theme' }
 *   ],
 *   show: 'advancedMode', // Only show when advancedMode field is selected
 *   value: 'light'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Complex field with transformation and effects
 * const processedField: InputField<DataObject> = {
 *   id: 'processedValue',
 *   type: 'text',
 *   label: 'Processed Input',
 *   transform: <string, number>(dir, value) => {
 *     return dir === 'to' 
 *       ? parseInt(value as string, 10)  // Transform to number for storage
 *       : (value as number).toString();  // Transform to string for display
 *   },
 *   effect: async (obj, value, context) => {
 *     // Side effect when value changes
 *     if (value && typeof value === 'number' && value > 100) {
 *       obj.highValue = true;
 *     }
 *     return obj;
 *   }
 * };
 * 
 * // Repeated field (array handling)
 * const tagsField: InputField<BlogPost, 'tags'> = {
 *   id: 'tags',
 *   type: 'text',
 *   label: 'Tags',
 *   repeat: true,
 *   max: 5,
 *   placeholder: 'Add a tag',
 *   repeatItemClass: 'tag-item z-depth-1'
 * };
 * ```
 */
export type InputField<O extends Attributes = {}, K extends keyof O = keyof O> = {
  /**
   * Unique identifier for this field within the form.
   * 
   * The ID corresponds to a property key in the form object and is used for:
   * - Data binding between the field and the object property
   * - Field validation and error reporting
   * - Conditional visibility and cross-field references
   * - Form state management and change tracking
   * 
   * Not required for markdown blocks or display-only fields.
   * 
   * @example 'name', 'email', 'address.street'
   */
  id?: K;
  
  /**
   * Human-readable label displayed next to or above the field.
   * 
   * Supports internationalization through i18n property and can contain
   * placeholder variables that are resolved at runtime using form context.
   * 
   * @example 'Full Name', 'Email Address', 'User Profile'
   */
  label?: string;
  
  /**
   * Optional descriptive text providing additional context or instructions.
   * 
   * Typically displayed as help text below the field or in tooltips.
   * Supports markdown formatting for rich text content.
   * 
   * @example 'Enter your full legal name as it appears on official documents'
   */
  description?: string;
  
  /**
   * Placeholder text shown when the field is empty.
   * 
   * For text inputs, appears as grayed-out text inside the field.
   * For select fields, appears as the first option in the dropdown.
   * 
   * @example 'Enter text here...', 'Select an option', 'Search...'
   */
  placeholder?: string;
  
  /**
   * Defines the field type or nested form structure.
   * 
   * Can be:
   * - `ComponentType`: Standard field type (text, number, select, etc.)
   * - `UIForm<T>`: Nested form configuration for object properties
   * - `UIForm<ArrayElement>`: Form configuration for array element editing
   * 
   * The type determines which component is rendered and how data is handled.
   * Custom types can be registered through the plugin system.
   * 
   * @example 'text', 'number', 'select', 'checkbox', 'custom-rating'
   */
  type?: ComponentType | UIForm<O[K]> | UIForm<O[K] extends any[] ? O[K][number] : O[K]>;
  
  /**
   * Initial value for the field.
   * 
   * Used for:
   * - Setting default values in new forms
   * - Providing fallback values when object property is undefined
   * - Type inference when TypeScript types are not explicitly provided
   * 
   * The value type must match the expected type for the field's component.
   */
  value?: O[K];
  /**
   * Configuration options for choice-based fields (select, checkbox, radio, etc.).
   * 
   * Can be:
   * - `string`: Reference to an external options source (e.g., 'countries', 'categories')
   * - `Array<Option>`: Inline option definitions with full control over each option
   * 
   * For file inputs, option IDs are used to build the accept attribute for file type filtering.
   * Each option can have conditional visibility and custom styling through the show property.
   * 
   * @example
   * ```typescript
   * // External reference
   * options: 'countries'
   * 
   * // Inline options
   * options: [
   *   { id: 'small', label: 'Small Size', img: '/icons/small.png' },
   *   { id: 'large', label: 'Large Size', disabled: true },
   *   { id: 'custom', label: 'Custom', show: ['advancedMode'] }
   * ]
   * ```
   */
  options?:
    | string
    | Array<{
        /** 
         * Unique identifier for this option.
         * Used as the value when this option is selected.
         */
        id: string;
        /** 
         * Display text for the option.
         * If not provided, the ID will be capitalized and used as the label.
         */
        label?: string;
        /** 
         * When true, this option cannot be selected by the user.
         * Useful for creating separators or showing unavailable options.
         */
        disabled?: boolean;
        /** 
         * Optional image URL for visual select options.
         * Displays an icon next to the option text in dropdowns.
         */
        img?: string;
        /** 
         * Conditional visibility for this option.
         * Shows the option only when the specified field(s) have values.
         * String array creates an OR condition, comma-separated creates AND condition.
         */
        show?: string | string[];
      }>;
  
  /**
   * Minimum value constraint for numeric and date fields.
   * 
   * For number inputs, sets the minimum allowable numeric value.
   * For date inputs, sets the earliest selectable date.
   * Triggers validation when the user enters a value below this threshold.
   */
  min?: number;
  
  /**
   * Maximum value constraint with dual purposes.
   * 
   * For number/date fields: Sets the maximum allowable value or latest selectable date.
   * For repeated fields: Limits the maximum number of array items that can be created.
   * 
   * Provides both validation and UI limitations to prevent excessive data entry.
   */
  max?: number;
  
  /**
   * Increment/decrement step size for numeric inputs.
   * 
   * Defines the granularity of value changes when using spinner controls
   * or keyboard arrow keys. Also affects validation for decimal precision.
   * 
   * @example 0.01 for currency, 1 for integers, 0.5 for half-steps
   */
  step?: number;
  
  /**
   * Minimum character length validation for text-based fields.
   * 
   * Applies to text, textarea, email, password, and other string input types.
   * Prevents form submission when the field value is shorter than this limit.
   */
  minLength?: number;
  
  /**
   * Maximum character length validation for text-based fields.
   * 
   * Enforces an upper limit on text input length and may show a character
   * counter in the UI. Prevents form submission when exceeded.
   */
  maxLength?: number;
  /**
   * Marks the field as required for form validation.
   * 
   * When true, prevents form submission if the field is empty or has no value.
   * Typically displays a visual indicator (asterisk, colored border) in the UI.
   * Required validation runs both on field blur and form submission.
   */
  required?: boolean;
  
  /**
   * Enables multiple value selection for choice-based fields.
   * 
   * Transforms single-value fields (select, checkbox) into multi-value fields
   * that return arrays. Changes the UI to show multiple selection controls
   * like checkboxes within a select or multiple checkboxes.
   */
  multiple?: boolean;
  
  /**
   * Controls layout orientation for readonly field display.
   * 
   * When true, positions the field label horizontally in front of the value
   * rather than above it. Useful for compact readonly forms or summary views.
   */
  inline?: boolean;
  
  /**
   * Controls field interactivity and enables conditional disabling.
   * 
   * Can be:
   * - `boolean`: Simple enable/disable toggle
   * - `string`: Expression evaluated against form context for conditional disabling
   * - `string[]`: List of field IDs - disables when any of those fields have values
   * 
   * Disabled fields show grayed-out styling and cannot receive user input.
   */
  disabled?: boolean | string | string[];
  
  /**
   * Forces the field into readonly display mode.
   * 
   * When true, renders the field value without interactive controls.
   * Useful for displaying data that shouldn't be editable in certain contexts
   * or for creating form summaries and confirmations.
   */
  readonly?: boolean;
  
  /**
   * Custom CSS class applied to the field's root container element.
   * 
   * Allows for custom styling and integration with CSS frameworks.
   * Multiple classes can be space-separated for complex styling needs.
   * 
   * @example 'custom-field elevation-2', 'col s12 m6 l4'
   */
  className?: string;
  
  /**
   * CSS class applied to the field's content area or option containers.
   * 
   * Specifically targets:
   * - Checkbox/radio button groupings for layout control
   * - Option lists for custom spacing and alignment
   * - Input content areas for specialized styling
   * 
   * @example 'inline-options', 'grid-layout', 'compact-spacing'
   */
  checkboxClass?: string;
  /**
   * Icon name to display alongside the field.
   * 
   * Supports icon libraries like Material Icons, Font Awesome, or custom icon sets.
   * The icon appears next to the label or inside the field depending on the field type.
   * 
   * @example 'person', 'email', 'lock', 'calendar', 'star'
   */
  icon?: string;
  
  /**
   * Additional CSS classes applied to the icon element.
   * 
   * Allows for custom icon styling, sizing, and positioning.
   * Works in conjunction with the icon property to provide full icon control.
   * 
   * @example 'material-icons', 'fas fa-user', 'custom-icon-large'
   */
  iconClass?: string;
  
  /**
   * Hierarchical level for section-type fields.
   * 
   * Only applicable when type='section'. Controls the heading level (h1-h6)
   * and visual hierarchy of section dividers within forms. Higher numbers
   * create smaller, more indented section headers.
   * 
   * @example 1 for main sections, 2 for subsections, 3 for sub-subsections
   */
  level?: number;
  
  /**
   * Automatically generates field values on form creation or item addition.
   * 
   * Available generation types:
   * - `'id'`: Short alphanumeric ID starting with 'id' (e.g., 'id_abc123')
   * - `'guid'`: Full UUID/GUID format (e.g., '550e8400-e29b-41d4-a716-446655440000')
   * - `'timestamp'`: Milliseconds since Unix epoch (e.g., 1640995200000)
   * 
   * Values are generated once and remain constant unless explicitly changed.
   */
  autogenerate?: 'id' | 'guid' | 'timestamp';
  
  /**
   * Enables array/collection handling for this field.
   * 
   * When set:
   * - `true`: Field represents an array that can have multiple items added/removed
   * - `'geojson'`: Special handling for GeoJSON geometry collections and features
   * 
   * Transforms the field into a repeatable section with add/remove controls
   * and individual item management capabilities.
   */
  repeat?: true | 'geojson';
  /**
   * CSS classes applied to individual items in repeated fields.
   * 
   * When `repeat` is true, each array item gets its own container element
   * that can be styled independently. Useful for adding borders, shadows,
   * spacing, or grid layouts to repeated items.
   * 
   * @example 'z-depth-1 card-panel', 'item-border', 'grid-item'
   */
  repeatItemClass?: string;
  
  /**
   * Conditional field visibility based on other field values.
   * 
   * Controls when this field appears in the form:
   * - `string`: Single field ID - shows when that field has any value
   * - `string[]`: Multiple field IDs - shows when ANY of them have values (OR logic)
   * - Comma-separated in string: Shows when ALL listed fields have values (AND logic)
   * 
   * Provides dynamic form behavior and progressive disclosure of complex forms.
   * 
   * @example
   * ```typescript
   * show: 'hasAdvancedOptions'     // Show when hasAdvancedOptions is checked
   * show: ['option1', 'option2']   // Show when either option1 OR option2 is set
   * show: 'option1,option2'        // Show when both option1 AND option2 are set
   * ```
   */
  show?: string | string[];
  
  /**
   * Internationalization configuration for field-specific translations.
   * 
   * Provides locale-specific labels, descriptions, validation messages, and formatting.
   * Translation keys are resolved once during form initialization and cached for performance.
   * 
   * @example
   * ```typescript
   * i18n: {
   *   label: { en: 'Name', es: 'Nombre', fr: 'Nom' },
   *   description: { en: 'Enter full name', es: 'Ingrese nombre completo' }
   * }
   * ```
   */
  i18n?: I18n;
  /**
   * Enables pagination for repeated fields with many items.
   * 
   * When set, long arrays are split into pages with navigation controls.
   * Improves performance and usability for large datasets. When pageSize
   * is specified, the `max` property is ignored in favor of pagination.
   * 
   * @example 10 // Show 10 items per page
   */
  pageSize?: number;
  
  /**
   * Property name used for filtering repeated items.
   * 
   * Enables search/filter functionality within repeated field arrays.
   * Creates a filter input that searches within the specified property
   * of each array item to show/hide matching items.
   * 
   * @example 'name' // Filter array items by their 'name' property
   */
  propertyFilter?: string;
  
  /**
   * Automatic sorting configuration for repeated item arrays.
   * 
   * Specifies which property to sort by and the sort direction:
   * - Property name only: Ascending sort (e.g., 'name')
   * - Prefixed with '!': Descending sort (e.g., '!createdDate')
   * 
   * Supports sorting by string and number properties with natural ordering.
   * 
   * @example 'name', '!priority', 'createdAt'
   */
  sortProperty?: string;
  
  /**
   * Custom label for the property filter input field.
   * 
   * When `propertyFilter` is enabled, this sets the label text for the
   * filter input box. If not provided, a default label will be generated
   * based on the filtered property name.
   * 
   * @example 'Search by name', 'Filter items', 'Find...'
   */
  filterLabel?: string;
  
  /**
   * Bulk selection controls for multi-option fields.
   * 
   * Adds "Select All" and "Unselect All" buttons to fields with multiple options.
   * The string format is "SelectLabel|UnselectLabel" where the pipe character
   * separates the two button labels.
   * 
   * Only applicable to fields with `multiple: true` and option-based types.
   * 
   * @example 'Select all|Unselect all', 'Check all|Clear all'
   */
  checkAllOptions?: string;
  
  /**
   * Upload endpoint URL for file input fields.
   * 
   * Specifies where file uploads should be sent when using file-type fields.
   * The endpoint should handle multipart form data and return appropriate
   * responses for successful uploads and error conditions.
   * 
   * @example '/api/upload', 'https://example.com/files/upload'
   */
  url?: string;
  /**
   * Bidirectional data transformation function for field values.
   * 
   * Enables conversion between the field's display/edit format and the object's storage format.
   * Called automatically during data binding to transform values in both directions:
   * 
   * - `'from'`: Transforms from object property to field display value (object → field)
   * - `'to'`: Transforms from field input back to object property (field → object)
   * 
   * Useful for formatting, data type conversion, or adapting between different data structures.
   * 
   * @template U - Type of the object property value
   * @template V - Type of the field display/input value
   * 
   * @param dir - Transformation direction ('from' or 'to')
   * @param value - Value to transform (type depends on direction)
   * @returns Transformed value
   * 
   * @example
   * ```typescript
   * // Transform between string display and number storage
   * transform: <number, string>(dir, value) => {
   *   return dir === 'from' 
   *     ? (value as number).toString()     // number → string for display
   *     : parseInt(value as string, 10);   // string → number for storage
   * }
   * 
   * // Transform date objects to/from ISO strings
   * transform: <Date, string>(dir, value) => {
   *   return dir === 'from'
   *     ? (value as Date).toISOString()     // Date → ISO string
   *     : new Date(value as string);        // ISO string → Date
   * }
   * ```
   */
  transform?: <U, V>(dir: 'from' | 'to', value: U | V) => V | U;
  
  /**
   * Side-effect function executed after field value changes.
   * 
   * Called after the field value has been set and optionally transformed.
   * Can perform additional processing, validation, or trigger updates to other
   * form fields based on the changed value.
   * 
   * The function can modify and return the form object to apply additional changes,
   * or return undefined to indicate no additional changes are needed.
   * 
   * @param obj - The current form object
   * @param value - The new value that was set
   * @param context - Array of contextual objects for complex form scenarios
   * @returns Modified object or undefined if no changes needed
   * 
   * @example
   * ```typescript
   * // Auto-calculate derived values
   * effect: (obj, value) => {
   *   if (obj && value) {
   *     obj.calculatedField = someCalculation(value);
   *     obj.lastModified = new Date();
   *   }
   *   return obj;
   * }
   * 
   * // Trigger validation or external API calls
   * effect: async (obj, value) => {
   *   if (value) {
   *     const isValid = await validateWithAPI(value);
   *     if (obj) obj.validationStatus = isValid;
   *   }
   *   return obj;
   * }
   * ```
   */
  effect?: (obj?: O, value?: O[keyof O], context?: O[]) => Promise<O | undefined> | undefined;
  
  /**
   * Factory function for creating new items in repeated fields.
   * 
   * Called when the user adds a new item to an array/repeated field.
   * Can provide default values, inherit properties from the parent object,
   * or perform initialization logic for new array items.
   * 
   * @param obj - The parent form object containing the array
   * @param id - The field ID of the array property
   * @param index - The index where the new item will be inserted
   * @returns Partial object with default values for the new item
   * 
   * @example
   * ```typescript
   * // Provide default values for new items
   * onNewItem: (obj, id, index) => ({
   *   id: generateId(),
   *   name: '',
   *   createdAt: new Date(),
   *   order: index || 0
   * })
   * 
   * // Inherit properties from parent
   * onNewItem: (obj) => ({
   *   parentId: obj.id,
   *   category: obj.defaultCategory,
   *   status: 'draft'
   * })
   * ```
   */
  onNewItem?: (obj: O, id?: keyof O, index?: number) => Partial<O[keyof O]>;
  /**
   * Output format for datetime fields.
   * 
   * Controls how date/time values are serialized when saving form data:
   * - `'UTC'`: ISO 8601 UTC format (default) - '2023-12-25T10:30:00Z'
   * - `'ISO'`: ISO 8601 with timezone - '2023-12-25T10:30:00+01:00'
   * - `'MSEC'`: Milliseconds since Unix epoch - 1703505000000
   * 
   * @default 'UTC'
   */
  dateTimeOutput?: 'UTC' | 'ISO' | 'MSEC';
  
  /**
   * Enable seconds precision in datetime fields.
   * 
   * When true, datetime inputs include seconds in addition to hours and minutes.
   * Provides finer granularity for time-sensitive data entry scenarios.
   * 
   * @default false
   */
  dateTimeSeconds?: boolean;
  
  /**
   * Display format pattern for date fields.
   * 
   * Currently supports 'mmmm d, yyyy' format (e.g., 'January 15, 2023').
   * Controls how dates appear in readonly mode and potentially in date pickers.
   * 
   * @example 'mmmm d, yyyy' produces 'January 15, 2023'
   */
  dateFormat?: 'mmmm d, yyyy';
  
  /**
   * Time display format for time picker components.
   * 
   * Controls the time format in time and datetime fields:
   * - `false`: 24-hour format (default) - '14:30'
   * - `true`: 12-hour format with AM/PM - '2:30 PM'
   * 
   * @default false
   */
  twelveHour?: boolean;
  
  /**
   * Extensibility property for plugin-specific configurations.
   * 
   * Allows plugins to add custom properties without TypeScript errors.
   * Custom properties should be namespaced to avoid conflicts with future
   * core properties (e.g., 'myPlugin_customOption').
   * 
   * @example
   * ```typescript
   * {
   *   type: 'rating',
   *   id: 'userRating',
   *   // Plugin-specific properties
   *   maxStars: 5,
   *   allowHalfStars: true,
   *   starIcon: 'star'
   * }
   * ```
   */
  [key: string]: any;
};
