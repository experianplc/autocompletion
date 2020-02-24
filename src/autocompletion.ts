/*
    JavaScript AutoComplete v1.0
    Copyright (c) 2018 Experian
    GitHub: https://github.com/experianplc/AutoComplete
 */

export default (function () {
  function autoComplete(options : AutoCompleteOptions): void {
    if (!document.querySelector) {
      return;
    }

    function hasClass(el: HTMLElement, className: string): boolean {
      return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className); 
    }

    function addEvent(el, type: string, handler: (event: any) => void): void {
      if (el.attachEvent) {
        el.attachEvent('on' + type, handler);
      } else {
        el.addEventListener(type, handler);
      }
    }

    function removeEvent(el, type: string, handler: (event: any) => void): void {
      // if (el.removeEventListener) not working in IE11
      if (el.detachEvent)
        el.detachEvent('on' + type, handler);
      else
        el.removeEventListener(type, handler);
    }

    function live(className: string,
      event: string,
      cb: (e: any) => void,
      context: SuggestionsContainer): void {
      addEvent(context || document, event, function (e) {
        let found, el = e.target || e.srcElement;
        while (el && !(found = hasClass(el, className)))
          el = el.parentElement;
        if (found)
          cb.call(el, e);
      });
    }

    let o: AutoCompleteOptions = {
      selector: '',
      source: function (v, s) { },
      minChars: 3,
      delay: 150,
      offsetLeft: 0,
      offsetTop: 1,
      cache: 1,
      menuClass: '',
      dontUseOffset: false,
      renderItem: function (item, search) {
        // Special characters should be escaped.
        search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        let re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
        return '<div class="edq-global-intuitive-address-suggestion" data-format="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
      },
      onSelect: function (e, term, item) { }
    };

    for (let k in options) {
      if (options.hasOwnProperty(k))
        o[k] = options[k];
    }

    let nodeList = typeof o.selector == 'object' ? [o.selector] : document.querySelectorAll(o.selector);

    // Preserve backwards compatiability with older browsers by using C style for-loop.
    for (let i = 0; i < nodeList.length; i++) {
      let autoCompleteElement = nodeList[i] as AutoCompleteElement;

      autoCompleteElement.suggestionsContainer = document.createElement('div') as SuggestionsContainer;
      autoCompleteElement.suggestionsContainer.id = 'edq-verification-suggestion-box';
      autoCompleteElement.suggestionsContainer.className = 'edq-global-intuitive-address-suggestions ' + o.menuClass;

      autoCompleteElement.autocompleteAttr = autoCompleteElement.getAttribute('autocomplete');
      autoCompleteElement.setAttribute('autocomplete', 'off');
      autoCompleteElement.cache = {};
      autoCompleteElement.lastVal = '';

      autoCompleteElement.updateSC = function (resize: boolean, next: AutoCompleteElement): void {
        let rect : DOMRect | ClientRect  = autoCompleteElement.getBoundingClientRect();

        // Eventually this should be removed, but specifically for a modal this should be enabled
        // to prevent the suggestions from moving while you scroll
        if (o.dontUseOffset) {
          autoCompleteElement.suggestionsContainer.style.left = Math.round(rect.left + o.offsetLeft) + 'px';
          autoCompleteElement.suggestionsContainer.style.top = Math.round(rect.bottom + o.offsetTop) + 'px';
        } else {
          autoCompleteElement.suggestionsContainer.style.left = Math.round(rect.left + (window.pageXOffset || document.documentElement.scrollLeft) + o.offsetLeft) + 'px';
          autoCompleteElement.suggestionsContainer.style.top = Math.round(rect.bottom + (window.pageYOffset || document.documentElement.scrollTop) + o.offsetTop) + 'px';
        }
        autoCompleteElement.suggestionsContainer.style.width = Math.round(rect.right - rect.left) + 'px';

        if (!resize) {
          autoCompleteElement.suggestionsContainer.style.display = 'block';

          if (!autoCompleteElement.suggestionsContainer.maxHeight) {
            autoCompleteElement.suggestionsContainer.maxHeight = parseInt(String((window.getComputedStyle ? getComputedStyle(autoCompleteElement.suggestionsContainer, null) : autoCompleteElement.suggestionsContainer.currentStyle).maxHeight));
          }

          if (!autoCompleteElement.suggestionsContainer.suggestionHeight) {
            autoCompleteElement.suggestionsContainer.suggestionHeight = autoCompleteElement.suggestionsContainer.querySelector('.edq-global-intuitive-address-suggestion').offsetHeight;
          }

          if (autoCompleteElement.suggestionsContainer.suggestionHeight && !next) {
            autoCompleteElement.suggestionsContainer.scrollTop = 0;
          }

          else {
            let scrTop = autoCompleteElement.suggestionsContainer.scrollTop, selTop = next.getBoundingClientRect().top - autoCompleteElement.suggestionsContainer.getBoundingClientRect().top;
            if (selTop + autoCompleteElement.suggestionsContainer.suggestionHeight - autoCompleteElement.suggestionsContainer.maxHeight > 0)
              autoCompleteElement.suggestionsContainer.scrollTop = selTop + autoCompleteElement.suggestionsContainer.suggestionHeight + scrTop - autoCompleteElement.suggestionsContainer.maxHeight;
            else if (selTop < 0)
              autoCompleteElement.suggestionsContainer.scrollTop = selTop + scrTop;
          }
        }
      };
      addEvent(window, 'resize', autoCompleteElement.updateSC);
      document.body.appendChild(autoCompleteElement.suggestionsContainer);

      live('edq-global-intuitive-address-suggestion', 'mouseleave', function() {
        let sel = autoCompleteElement.suggestionsContainer.querySelector('.edq-global-intuitive-address-suggestion.selected');
        if (sel)
          setTimeout(function () { sel.className = sel.className.replace('selected', ''); }, 20);
      }, autoCompleteElement.suggestionsContainer);

      live('edq-global-intuitive-address-suggestion', 'mouseover', function() {
        let sel = autoCompleteElement.suggestionsContainer.querySelector('.edq-global-intuitive-address-suggestion.selected');
        if (sel)
          sel.className = sel.className.replace('selected', '');
        this.className += ' selected';
      }, autoCompleteElement.suggestionsContainer);

      live('edq-global-intuitive-address-suggestion', 'mousedown', function(e) {
        if (hasClass(this, 'edq-global-intuitive-address-suggestion')) {
          let v = this.getAttribute('data-format');
          o.onSelect(e, v, this);
          autoCompleteElement.suggestionsContainer.style.display = 'none';
        }
      }, autoCompleteElement.suggestionsContainer);

      autoCompleteElement.blurHandler = function () {
        let over_sb;
        try {
          over_sb = document.querySelector('.edq-global-intuitive-address-suggestions:hover');
        }
        catch (e) {
          over_sb = 0;
        }
        if (!over_sb) {
          autoCompleteElement.lastVal = autoCompleteElement.value;
          autoCompleteElement.suggestionsContainer.style.display = 'none';
          setTimeout(function () { autoCompleteElement.suggestionsContainer.style.display = 'none'; }, 350); // hide suggestions on fast input
        }
        else if (autoCompleteElement !== document.activeElement)
          setTimeout(function () { autoCompleteElement.focus(); }, 20);
      };

      addEvent(autoCompleteElement, 'blur', autoCompleteElement.blurHandler);

      let suggest = function (data) {
        let val = autoCompleteElement.value;
        autoCompleteElement.cache[val] = data;
        if (data.length && val.length >= o.minChars) {
          let s = '';
          for (let i = 0; i < data.length; i++)
            s += o.renderItem(data[i], val);
          autoCompleteElement.suggestionsContainer.innerHTML = s;
          autoCompleteElement.updateSC(0);
        }
        else
          autoCompleteElement.suggestionsContainer.style.display = 'none';
      };

      autoCompleteElement.keydownHandler = function (e) {
        let key = window.event ? e.keyCode : e.which;
        // down (40), up (38)
        if ((key == 40 || key == 38) && autoCompleteElement.suggestionsContainer.innerHTML) {
          let next, sel = autoCompleteElement.suggestionsContainer.querySelector('.edq-global-intuitive-address-suggestion.selected');
          if (!sel) {
            next = (key == 40) ? autoCompleteElement.suggestionsContainer.querySelector('.edq-global-intuitive-address-suggestion') : autoCompleteElement.suggestionsContainer.childNodes[autoCompleteElement.suggestionsContainer.childNodes.length - 1]; // first : last
            next.className += ' selected';
            autoCompleteElement.value = next.getAttribute('data-suggestion');
          }
          else {
            next = (key == 40) ? sel.nextSibling : sel.previousSibling;
            if (next) {
              sel.className = sel.className.replace('selected', '');
              next.className += ' selected';
              autoCompleteElement.value = next.getAttribute('data-suggestion');
            }
            else {
              sel.className = sel.className.replace('selected', '');
              autoCompleteElement.value = autoCompleteElement.lastVal;
              next = 0;
            }
          }
          autoCompleteElement.updateSC(0, next);
          return false;
        }
        else if (key == 27) {
          autoCompleteElement.value = autoCompleteElement.lastVal;
          autoCompleteElement.suggestionsContainer.style.display = 'none';
        }
        else if (key == 13 || key == 9) {
          let sel = autoCompleteElement.suggestionsContainer.querySelector('.edq-global-intuitive-address-suggestion.selected');
          if (sel && autoCompleteElement.suggestionsContainer.style.display != 'none') {
            o.onSelect(e, sel.getAttribute('data-format'), sel);
            setTimeout(function () { autoCompleteElement.suggestionsContainer.style.display = 'none'; }, 20);
          }
        }
      };

      addEvent(autoCompleteElement, 'keydown', autoCompleteElement.keydownHandler);

      autoCompleteElement.keyupHandler = function (e) {
        let key = window.event ? e.keyCode : e.which;
        if (!key || (key < 35 || key > 40) && key != 13 && key != 27) {
          let val = autoCompleteElement.value;
          if (val.length >= o.minChars) {
            if (val != autoCompleteElement.lastVal) {
              autoCompleteElement.lastVal = val;
              clearTimeout(autoCompleteElement.timer);
              if (o.cache) {
                if (val in autoCompleteElement.cache) {
                  suggest(autoCompleteElement.cache[val]);
                  return;
                }
                // no requests if previous suggestions were empty
                for (let i = 1; i < val.length - o.minChars; i++) {
                  let part = val.slice(0, val.length - i);
                  if (part in autoCompleteElement.cache && !autoCompleteElement.cache[part].length) {
                    suggest([]);
                    return;
                  }
                }
              }
              autoCompleteElement.timer = setTimeout(function () { o.source(val, suggest); }, o.delay);
            }
          }
          else {
            autoCompleteElement.lastVal = val;
            autoCompleteElement.suggestionsContainer.style.display = 'none';
          }
        }
      };

      addEvent(autoCompleteElement, 'keyup', autoCompleteElement.keyupHandler);

      autoCompleteElement.focusHandler = function(e: Event): void {
        autoCompleteElement.lastVal = '\n';
        autoCompleteElement.keyupHandler(e);
      };

      if (!o.minChars)
      addEvent(autoCompleteElement, 'focus', autoCompleteElement.focusHandler);
    };

    this.destroy = function(): void {

      // Preserve backwards compatiability with older browsers by using C style for-loop.
      for (let i = 0; i < nodeList.length; i++ ) {
        let self = nodeList[i] as AutoCompleteElement;
        removeEvent(window, 'resize', self.updateSC);
        removeEvent(self, 'blur', self.blurHandler);
        removeEvent(self, 'focus', self.focusHandler);
        removeEvent(self, 'keydown', self.keydownHandler);
        removeEvent(self, 'keyup', self.keyupHandler);

        if (self.autocompleteAttr) {
          self.setAttribute('autocomplete', self.autocompleteAttr);
        } else {
          self.removeAttribute('autocomplete');
        }

        document.body.removeChild(self.suggestionsContainer);
        self = null;
      };
    };

  };

  return autoComplete;
})();
