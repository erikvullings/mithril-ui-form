import m from 'mithril';
import { FileInput } from 'mithril-materialized';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

export const fileReadonly: FieldRenderer = ({ iv, props, field }) => {
  const value = iv as string | string[] | undefined;
  const ivFinal = value instanceof Array ? value : [value];
  return m(
    'div',
    props,
    ivFinal.map((f = '') => {
      const isImg = /data:image|.jpg$|.jpeg$|.png$|.gif$|.svg$|.bmp$|.tif$|.tiff$/i.test(f);
      const origin = new URL(field.url!).origin;
      const url = `${origin}${f}`;
      return m(
        'a[target=_blank]',
        { href: url },
        isImg
          ? m('img', {
              src: url,
              alt: field.label || field.placeholder || f || 'File image',
              style: { maxHeight: `${field.max || 50}px` },
            })
          : m(ReadonlyComponent, {
              props,
              label: field.placeholder || 'File',
              initialValue: f,
            })
      );
    })
  );
};

export const fileEditable: FieldRenderer = ({ iv, props, options, field, oninput }) => {
  const value = iv as string;
  const { url, placeholder } = field;
  if (!url) {
    throw Error('Input field "url" not defined, which indicates the URL to the upload folder.');
  }
  const accept = options ? options.map((o) => (typeof o === 'string' ? o : String(o.id))) : undefined;
  const upload = (file: FileList) => {
    if (!file || file.length < 1) {
      oninput('');
      return;
    }
    const body = new FormData();
    body.append('file', file[0]);
    m.request<string>({
      method: 'POST',
      url,
      body,
    })
      .then((res) => oninput(res))
      .catch(console.error);
  };
  return m(FileInput, {
    ...props,
    accept,
    placeholder,
    onchange: upload,
    value,
  });
};
