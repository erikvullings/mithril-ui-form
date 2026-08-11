import m from 'mithril';
import { SlimdownView } from '../src/components/slimdown-view';

/**
 * slimdown-js does not sanitize raw HTML embedded in markdown source (only code/math
 * blocks are escaped) - SlimdownView must sanitize the rendered HTML itself before handing
 * it to m.trust, since 'md' fields can be bound to obj[id] (real, potentially
 * user-authored data), not just static form-spec content.
 */
describe('SlimdownView', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    m.mount(root, null);
    root.remove();
  });

  it('strips a <script> tag embedded in the markdown source by default', () => {
    m.mount(root, {
      view: () => m(SlimdownView, { md: 'Hello <script>window.pwnedFlag = true;</script> world' }),
    });

    expect(root.querySelector('script')).toBeNull();
    expect((window as any).pwnedFlag).toBeUndefined();
    expect(root.textContent).toContain('Hello');
    expect(root.textContent).toContain('world');
  });

  it('strips an inline event handler (onerror) from embedded HTML by default', () => {
    m.mount(root, {
      view: () => m(SlimdownView, { md: '<img src=x onerror="window.pwnedFlag = true">' }),
    });

    const img = root.querySelector('img');
    expect(img?.getAttribute('onerror')).toBeNull();
  });

  it('still renders ordinary markdown formatting after sanitization', () => {
    m.mount(root, {
      view: () => m(SlimdownView, { md: '**bold** and *italic*' }),
    });

    expect(root.querySelector('strong')?.textContent).toBe('bold');
    expect(root.querySelector('em')?.textContent).toBe('italic');
  });

  it('trustHtml=true bypasses sanitization', () => {
    m.mount(root, {
      view: () => m(SlimdownView, { md: '<img src=x onerror="window.pwnedFlag = true">', trustHtml: true }),
    });

    const img = root.querySelector('img');
    expect(img?.getAttribute('onerror')).toBe('window.pwnedFlag = true');
  });
});
