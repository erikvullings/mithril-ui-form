import m, { Component } from 'mithril';
import { Dropdown } from 'materialize-css';

export const DropdownComponent = () => {
  const state = {
    selected: '',
  };
  return {
    oncreate: () => {
      const elems = document.querySelectorAll('.dropdown-trigger');
      Dropdown.init(elems, {});
    },
    view: ({ attrs }) => {
      const id = attrs.id || 'dropdown';
      return m('div', [
        m(
          `a.dropdown-trigger.btn[href=#][data-target=${id}]`,
          { style: 'width: 100%' },
          state.selected || 'Load schema'
        ),
        m(`ul.dropdown-content[id=${id}]`, [
          attrs.items.map(i => m('li', m('a[href=#!]', {
            onclick: () => {
              state.selected = i;
              attrs.selected(i);
            },
          }, i))),
        ]),
      ]);
    },
  } as Component<{ id: string; items: string[]; selected: (key: string) => void }>;
};

// <!-- Dropdown Trigger -->
// <a class='dropdown-trigger btn' href='#' data-target='dropdown1'>Drop Me!</a>

// <!-- Dropdown Structure -->
// <ul id='dropdown1' class='dropdown-content'>
//   <li><a href="#!">one</a></li>
//   <li><a href="#!">two</a></li>
//   <li class="divider" tabindex="-1"></li>
//   <li><a href="#!">three</a></li>
//   <li><a href="#!"><i class="material-icons">view_module</i>four</a></li>
//   <li><a href="#!"><i class="material-icons">cloud</i>five</a></li>
// </ul>
