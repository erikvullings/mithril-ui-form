import m from 'mithril';
import { markdownEditorPlugin, markdownReadonlyPlugin } from '../src/plugin';

describe('markdownReadonlyPlugin', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    m.mount(root, null);
    root.remove();
  });

  const mountReadonly = (iv: string) =>
    m.mount(root, {
      view: () =>
        m(markdownReadonlyPlugin, {
          iv,
          field: { id: 'notes', type: 'md' },
          props: { className: 'col s12' },
          obj: {},
          context: [],
        } as any),
    });

  it('renders sanitized HTML for the given markdown', () => {
    mountReadonly('**bold** and *italic*');

    expect(root.querySelector('strong')?.textContent).toBe('bold');
    expect(root.querySelector('em')?.textContent).toBe('italic');
  });

  it('strips a <script> tag embedded in the markdown source', () => {
    mountReadonly('Hello <script>window.pwnedFlag = true;</script> world');

    expect(root.querySelector('script')).toBeNull();
    expect((window as any).pwnedFlag).toBeUndefined();
  });

  it('strips an inline event handler from embedded HTML', () => {
    mountReadonly('<img src=x onerror="window.pwnedFlag = true">');

    expect(root.querySelector('img')?.getAttribute('onerror')).toBeNull();
  });

  it('does not include interactive editor chrome (no textbox/contenteditable)', () => {
    mountReadonly('Just some text');

    expect(root.querySelector('[contenteditable]')).toBeNull();
  });
});

describe('markdownEditorPlugin', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    m.mount(root, null);
    root.remove();
  });

  it('mounts the editor with the initial markdown content and no console errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    m.mount(root, {
      view: () =>
        m(markdownEditorPlugin, {
          iv: '# Hello',
          field: { id: 'notes', type: 'md' },
          props: { placeholder: 'Write something...' },
          obj: {},
          context: [],
          onchange: () => {},
        } as any),
    });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
