import m from 'mithril';
import { UIForm } from 'mithril-ui-form-plugin';
import { LayoutForm, registerPlugin } from '../src/components';

/**
 * Regression test for the FormFieldFactory readonly-dispatch guard fix: previously the
 * outer `if (readonly && fieldType && ['md', 'none'].indexOf(fieldType) < 0)` excluded 'md'
 * from ever reaching the plugin registries, so a dedicated readonlyPlugins['md'] entry could
 * never fire even if registered - the same class of bug would apply to any type a plugin
 * author wanted to special-case this way. Using a fake 'fake-md-like' type here (not the
 * real 'md', to avoid coupling this test to markdown-specific behavior) with both an
 * editable and a readonly plugin registered, and asserting the right one renders in each mode.
 */
describe('readonly plugin dispatch', () => {
  const editableMarker = 'EDITABLE_PLUGIN_RENDERED';
  const readonlyMarker = 'READONLY_PLUGIN_RENDERED';
  const fieldType = 'plugin-dispatch-test-type';

  const editablePlugin = () => ({ view: () => m('span.editable-plugin', editableMarker) });
  const readonlyPlugin = () => ({ view: () => m('span.readonly-plugin', readonlyMarker) });

  registerPlugin(fieldType, editablePlugin as any, readonlyPlugin as any);

  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    m.mount(root, null);
    root.remove();
  });

  const form: UIForm<{ value?: string }> = [{ id: 'value', type: fieldType, label: 'Test' }];

  it('renders the registered editable plugin when the field is not readonly', () => {
    m.mount(root, {
      view: () => m(LayoutForm<{ value?: string }>(), { form, obj: { value: 'x' }, readonly: false }),
    });

    expect(root.textContent).toContain(editableMarker);
    expect(root.textContent).not.toContain(readonlyMarker);
  });

  it('renders the registered readonly plugin when the field is readonly', () => {
    m.mount(root, {
      view: () => m(LayoutForm<{ value?: string }>(), { form, obj: { value: 'x' }, readonly: true }),
    });

    expect(root.textContent).toContain(readonlyMarker);
    expect(root.textContent).not.toContain(editableMarker);
  });
});
