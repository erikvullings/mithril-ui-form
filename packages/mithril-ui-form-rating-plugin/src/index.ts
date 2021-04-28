import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, k) => k + start);

export const ratingPlugin: PluginType = () => {
  let groupId = '';
  let labelLength = 0;
  let emptyLabel = '';

  return {
    oninit: ({ attrs: { field } }) => {
      const { id, ratings } = field;
      groupId = `muf-rating-${id}-${Math.round(Math.random() * 1000000)}`;
      labelLength =
        ratings &&
        Math.max(
          ...Object.keys(ratings).map((key) =>
            Math.max(...(ratings[key] as string).split(/<br\s*\/?>/).map((w) => w.length))
          )
        );
      emptyLabel = labelLength ? new Array(labelLength).join('&nbsp;') : '';
    },
    view: ({ attrs: { props, field, iv, onchange } }) => {
      const { label, description } = props;
      const { min = 0, max = 5, ratings = {}, className } = field;
      const disabled = props.disabled || field.disabled;
      const radioWidth = Math.floor(1000 / (max - min + 1)) / 10;
      return m('.muf-rating', { className }, [
        m('.label', [label && m('.label', m.trust(label)), description && m('.help', m.trust(description))]),
        m(
          '.radios',
          range(min, max).map((i) =>
            m(
              'label',
              { for: `${groupId}${i}`, style: `width: ${radioWidth}%; display: inline-block; text-align: center;` },
              [
                m.trust((ratings[i] ? ratings[i] : emptyLabel) + '<br />'),
                m(
                  `input[type=radio][id=${groupId}${i}][value=${i}][name=${groupId}]${iv === i ? '[checked]' : ''}${
                    disabled ? '[disabled]' : ''
                  }`,
                  {
                    onclick: onchange && !disabled ? () => onchange(i) : undefined,
                  }
                ),
              ]
            )
          )
        ),
      ]);
    },
  };
};
