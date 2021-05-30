// @hydragium/sticky-nav v0.0.1 | Nikola Stamatovic <nikola@otilito.com> | MIT

import './polyfills.js';
import { intersectionObserver } from './utils.js';

export function StickyNav(params) {
  this.params = {};
  this.defaults = {
    root: document,
    section_selector: '[sticky-nav-label]',
    section_label_attribute: 'sticky-nav-label',
    floating_underline_selector: '.js-floating-underline',
    autopopulate_selector: '.js-sticky-nav-populate',
    selector: '.js-sticky-nav',
    threshold: 0.5,
    nav_item_active_class: 'active'
  };

  this.__init__ = function() {
    this.parseProperties(params);
    this.sections = this.params.root.querySelectorAll(this.params.section_selector);
    this.navigation = this.params.root.querySelector(this.params.selector);
    this.floating_underline = this.navigation.querySelector(this.params.floating_underline_selector);

    if (!this.navigation) {
      return;
    }

    this.autoPopulate();
    this.initFloatingUnderline();
    this.bindNavItems();

    const self = this;
    this.observer = intersectionObserver(this.sections, function(entry) {
      const target = entry.target;
      const id = target.getAttribute('id');
      const link_target = self.navigation.querySelector(`[href="#${id}"]`);
      link_target.dispatchEvent(new Event('activated'));
    }, 0.5);
  };

  this.__init__();
}

StickyNav.prototype.parseProperties = function(params) {
  if (!params) {
    this.params = this.defaults;
  } else {
    for (let k in this.defaults) {
      if (!params.hasOwnProperty(k)) {
        this.params[k] = this.defaults[k];
      }
    }
  }
};

StickyNav.prototype.autoPopulate = function() {
  if (!this.sections.length) {
    return;
  }

  const dest = this.navigation.querySelector(this.params.autopopulate_selector);

  for (let i = 0; i < this.sections.length; i++) {
    const section = this.sections[i];

    const label = section.getAttribute(this.params.section_label_attribute);
    const anchor = `#${section.getAttribute('id')}`;

    const a = document.createElement('a');
    a.setAttribute('href', anchor);
    a.innerHTML = label;

    if (i === 0) {
      a.classList.add('active');
    }

    if (dest.nodeName === 'UL') {
      const li = document.createElement('li');
      li.appendChild(a);
      dest.appendChild(li);
    } else {
      dest.appendChild(a);
    }
  }
};

StickyNav.prototype.updateFloatingUnderline = function() {
  if (!this.floating_underline) {
    return;
  }

  const update_event = new Event('update');
  this.floating_underline.dispatchEvent(update_event);
};

StickyNav.prototype.setFloatingUnderlineState = function(state_tuple) {
  this.floating_underline.style.left = state_tuple[0];
  this.floating_underline.style.width = state_tuple[1];
  console.log(state_tuple, this.floating_underline);
};

StickyNav.prototype.getFloatingUnderlineState = function(elem) {
  const tuple = [0, 0];
  const left = elem.offsetLeft;
  const width = elem.offsetWidth;

  if (left) {
    tuple[0] = left;
  }

  if (width) {
    tuple[1] = width;
  }

  return tuple;
};

StickyNav.prototype.initFloatingUnderline = function() {
  if (!this.floating_underline) {
    return;
  }

  this.af = null;
  const self = this;
  const update_event = new Event('update');
  const update = () => {
    if (self.floating_underline) {
      self.floating_underline.dispatchEvent(update_event);
    }
  };
  let onWindowResize = update;

  this.floating_underline.addEventListener('update', function (e) {
    const target = e.target;
    const root = target.closest('nav');
    const current_active_link = root.querySelector(`.${self.params.nav_item_active_class}`);
    self.setFloatingUnderlineState(self.getFloatingUnderlineState(current_active_link));
  }, false);

  update();

  if (window.hasOwnProperty('requestAnimationFrame')) {
    onWindowResize = function() {
      if (self.af) {
        window.cancelAnimationFrame(self.af);
      }

      self.af = window.requestAnimationFrame(update);
    };
  }

  window.addEventListener('resize', onWindowResize);
};

StickyNav.prototype.bindNavItems = function() {
  const update_event = new Event('update');
  const activate_event = new Event('activated');
  const links = this.navigation.querySelectorAll('a, button');
  const self = this;

  const onActivated = function(e) {
    const target = e.target;
    const root = target.closest('nav');
    const current_active_link = root.querySelector(`.${self.params.nav_item_active_class}`);

    if (current_active_link && target.isEqualNode(current_active_link)) {
      return;
    }

    if (current_active_link) {
      current_active_link.classList.remove(self.params.nav_item_active_class);
    }
    target.classList.add(self.params.nav_item_active_class);

    if (self.floating_underline) {
      self.floating_underline.dispatchEvent(update_event);
    }
  };

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    link.addEventListener('activated', onActivated, false);
    link.addEventListener('click', function(e) {
      e.target.dispatchEvent(activate_event);
    }, false);
  }
};
