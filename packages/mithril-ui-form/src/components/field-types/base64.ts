import m from 'mithril';
import { FileInput, FlatButton } from 'mithril-materialized';
import { extractTitle } from '../../utils';
import { FieldRenderer } from './types';

export const base64Readonly: FieldRenderer = ({ iv, field, obj }) => {
  const value = iv as string | undefined;
  const isImg = value && /data:image/i.test(value) ? true : false;
  const altText = field.label || extractTitle(obj) || field.placeholder || 'Uploaded image';
  return (
    isImg &&
    m(
      'div',
      { role: 'img', 'aria-label': typeof altText === 'string' ? altText : 'Image' },
      m('img.responsive-img', {
        src: value,
        alt: typeof altText === 'string' ? altText : 'Image',
        style: { maxHeight: `${field.max || 50}px` },
      })
    )
  );
};

export const base64Editable: FieldRenderer = ({ iv, props, options, field, obj, oninput }) => {
  const value = iv as string;
  const isImg = value && /data:image/i.test(value) ? true : false;
  const { placeholder } = field;
  const accept = options ? options.map((o) => (typeof o === 'string' ? o : String(o.id))).join(',') : undefined;
  const upload = (file: FileList) => {
    if (!file || file.length < 1) {
      oninput('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      typeof reader.result === 'string' && oninput(reader.result);
      m.redraw();
    };

    reader.readAsDataURL(file[0]);
  };
  const altText = field.label || extractTitle(obj) || field.placeholder || 'Uploaded image';
  const className = props.className || props.class || 'col s12';
  return isImg
    ? m('div', { className, style: { position: 'relative' } }, [
        m('img.responsive-img', {
          src: value,
          alt: typeof altText === 'string' ? altText : 'Uploaded image',
          style: { maxHeight: `${field.max || 50}px` },
        }),
        m(FlatButton, {
          iconName: 'close',
          'aria-label': 'Remove image',
          onclick: () => oninput(''),
          className: 'btn-floating btn-small red darken-2',
          style: {
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '32px',
            height: '32px',
          },
        }),
      ])
    : m(FileInput, {
        ...props,
        accept,
        placeholder,
        onchange: upload,
        value,
      });
};
