/**
 * **Enhanced Types**
 * @category Enhanced Types
 */

/**
 * Internationalization configuration interface for multi-language form support.
 * 
 * The I18n interface defines all translatable text strings and localization options
 * used throughout the form system. It supports both simple text translations and
 * complex formatting options for dates, numbers, and other locale-sensitive data.
 * 
 * Translation keys are resolved once during form initialization and cached for
 * performance. The interface covers both built-in UI elements (buttons, labels,
 * messages) and provides extensibility for custom field types and plugins.
 * 
 * @example
 * ```typescript
 * const englishTranslations: I18n = {
 *   editRepeat: 'Edit Item',
 *   createRepeat: 'Add New Item',
 *   deleteItem: 'Delete',
 *   agree: 'Yes',
 *   disagree: 'No',
 *   cancel: 'Cancel',
 *   save: 'Save Changes',
 *   locales: ['en-US'],
 *   dateTimeOptions: {
 *     year: 'numeric',
 *     month: 'long',
 *     day: 'numeric',
 *     hour: '2-digit',
 *     minute: '2-digit'
 *   }
 * };
 * 
 * const spanishTranslations: I18n = {
 *   editRepeat: 'Editar Elemento',
 *   createRepeat: 'Agregar Nuevo',
 *   deleteItem: 'Eliminar',
 *   agree: 'Sí',
 *   disagree: 'No',
 *   cancel: 'Cancelar',
 *   save: 'Guardar Cambios',
 *   locales: ['es-ES'],
 *   dateTimeOptions: {
 *     year: 'numeric',
 *     month: 'long',
 *     day: 'numeric'
 *   }
 * };
 * ```
 */
export interface I18n {
  /**
   * Label text for edit buttons in repeated field arrays.
   * 
   * Appears on edit buttons that allow users to modify existing items
   * in array/repeated fields. Used in list views and item management interfaces.
   * 
   * @example 'Edit', 'Edit Item', 'Modify', 'Update'
   */
  editRepeat?: string;
  
  /**
   * Label text for create/add buttons in repeated field arrays.
   * 
   * Appears on buttons that add new items to array/repeated fields.
   * Used in list management interfaces to initiate item creation.
   * 
   * @example 'Add New', 'Create Item', 'Add Another', '+ Add'
   */
  createRepeat?: string;
  
  /**
   * Label text for delete/remove buttons in item management.
   * 
   * Appears on buttons that remove items from arrays or delete form data.
   * Used in confirmation dialogs and item management interfaces.
   * 
   * @example 'Delete', 'Remove', 'Delete Item', 'Remove Entry'
   */
  deleteItem?: string;
  
  /**
   * Positive confirmation button text.
   * 
   * Used in confirmation dialogs, boolean questions, and yes/no scenarios.
   * Represents agreement, acceptance, or positive confirmation actions.
   * 
   * @example 'Yes', 'Agree', 'Confirm', 'OK', 'Accept'
   */
  agree?: string;
  
  /**
   * Negative confirmation button text.
   * 
   * Used in confirmation dialogs, boolean questions, and yes/no scenarios.
   * Represents disagreement, rejection, or negative confirmation actions.
   * 
   * @example 'No', 'Disagree', 'Reject', 'Deny', 'Decline'
   */
  disagree?: string;
  
  /**
   * Instruction text for single-selection fields.
   * 
   * Appears as placeholder or instruction text in radio button groups,
   * single-select dropdowns, and other exclusive choice fields.
   * 
   * @example 'Pick one', 'Select one option', 'Choose one', 'Select an item'
   */
  pickOne?: string;
  
  /**
   * Instruction text for multiple-selection fields.
   * 
   * Appears as placeholder or instruction text in checkbox groups,
   * multi-select dropdowns, and other multiple choice fields.
   * 
   * @example 'Pick one or more', 'Select multiple', 'Choose options', 'Select all that apply'
   */
  pickOneOrMore?: string;
  
  /**
   * Cancel action button text.
   * 
   * Used on buttons that abort current operations, close dialogs,
   * or revert changes without saving. Provides escape mechanisms for users.
   * 
   * @example 'Cancel', 'Close', 'Abort', 'Discard', 'Back'
   */
  cancel?: string;
  
  /**
   * Save action button text.
   * 
   * Used on buttons that persist changes, submit forms, or commit data.
   * Primary action button in most form and dialog interfaces.
   * 
   * @example 'Save', 'Submit', 'Save Changes', 'Apply', 'Update'
   */
  save?: string;
  
  /**
   * Tab label for raw/source view mode.
   * 
   * Used in tabbed interfaces that show raw data, source code, or unformatted
   * content. Typically paired with a formatted/preview view tab.
   * 
   * @example 'Raw', 'Source', 'Code', 'Plain Text', 'Markdown'
   */
  raw?: string;
  
  /**
   * Tab label for formatted/preview view mode.
   * 
   * Used in tabbed interfaces that show formatted, rendered, or processed
   * content. Typically paired with a raw/source view tab.
   * 
   * @example 'View', 'Preview', 'Formatted', 'Rendered', 'HTML'
   */
  view?: string;
  
  /**
   * List of supported locale identifiers.
   * 
   * Defines which locales/languages are supported by the form system.
   * Used for date formatting, number formatting, and other locale-sensitive
   * operations. Should follow BCP 47 language tag format.
   * 
   * @example ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP']
   */
  locales?: string[];
  
  /**
   * Locale-specific date and time formatting options.
   * 
   * Controls how dates and times are displayed throughout the form system.
   * Uses the Intl.DateTimeFormatOptions API for comprehensive formatting control.
   * Applied to date displays, readonly date fields, and date validation messages.
   * 
   * @example
   * ```typescript
   * dateTimeOptions: {
   *   year: 'numeric',        // 2023
   *   month: 'long',          // January
   *   day: 'numeric',         // 15
   *   hour: '2-digit',        // 09
   *   minute: '2-digit',      // 30
   *   timeZoneName: 'short'   // EST
   * }
   * ```
   * 
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat} MDN DateTimeFormat Reference
   */
  dateTimeOptions?: Intl.DateTimeFormatOptions;
}
