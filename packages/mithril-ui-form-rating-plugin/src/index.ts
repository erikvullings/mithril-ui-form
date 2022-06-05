import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, k) => k + start);

export const ratingPlugin: PluginType = () => {
  const optionsToRatings = (options?: string | Array<{ id: string; label?: string }>) =>
    !options || typeof options === 'string'
      ? {}
      : options.reduce((acc, cur) => {
          const { id, label = '' } = cur;
          acc[id] = label;
          return acc;
        }, {} as Record<string, string>);
  const minMaxFromOptions = (options?: string | Array<{ id: string; label?: string }>) =>
    !options || typeof options === 'string'
      ? { min: 0, max: 5 }
      : options.reduce(
          (acc, o, i) => {
            const value = isNaN(+o.id) ? i : +o.id;
            return { min: Math.min(acc.min, value), max: Math.max(acc.max, value) };
          },
          { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER }
        );

  let groupId = '';
  let labelLength = 0;
  let emptyLabel = '';

  return {
    oninit: ({ attrs: { field } }) => {
      const { id, ratings, options } = field;
      groupId = `muf-rating-${id}-${Math.round(Math.random() * 1000000)}`;
      const onBreak = /<br\s*\/?>/;
      labelLength = ratings
        ? Math.max(
            ...Object.keys(ratings).map((key) =>
              Math.max(...(ratings[key] as string).split(onBreak).map((w) => w.length))
            )
          )
        : options && options instanceof Array && options.length
        ? Math.max(...options.map((o) => (o.label ? Math.max(...o.label.split(onBreak).map((w) => w.length)) : 0)))
        : 0;
      emptyLabel = labelLength ? new Array(labelLength).join('&nbsp;') : '';
    },
    view: ({ attrs: { props, field, iv, onchange } }) => {
      const { label, description, required } = props;
      const minmax = minMaxFromOptions(field.options);
      const {
        min = minmax.min,
        max = minmax.max,
        ratings = optionsToRatings(field.options),
        className = 'col s12',
      } = field;
      const disabled = props.disabled || field.disabled;
      const radioWidth = Math.floor(1000 / (max - min + 1)) / 10;
      return m('.muf-rating', { className }, [
        m('.label', [
          label && m('.label', m.trust(label + required ? '*' : '')),
          description && m('.help', m.trust(description)),
        ]),
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
