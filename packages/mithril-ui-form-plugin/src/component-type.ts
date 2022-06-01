/** The type of primitive components that can be used */
export type ComponentType =
  | 'autogenerate'
  | 'checkbox'
  | 'color'
  | 'colour'
  | 'date'
  | 'date'
  | 'email'
  | 'base64'
  | 'file'
  | 'map'
  | 'md'
  | 'none' // Displays nothing, e.g. for autogenerated fields
  | 'number'
  | 'options'
  | 'radio'
  | 'section'
  | 'select'
  | 'switch'
  | 'tags'
  | 'text'
  | 'textarea'
  | 'time'
  | 'url'
  | string;
