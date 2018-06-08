interface SuggestionsContainer extends HTMLDivElement {
  suggestionHeight: number;
  currentStyle: CSSStyleDeclaration;
  querySelector: (query: string) => HTMLElement
  maxHeight: number;
}

class AutoCompleteElement extends HTMLElement {
  suggestionsContainer: SuggestionsContainer;

  autocompleteAttr: string;
  lastVal: string;
  currentStyle: object;
  maxHeight: number;
  suggestionHeight: number;
  offsetHeight: number;
  value: any;
  cache: object;

  updateSC: (reize: any, next?: any) => void;
  focusHandler: (event) => void;
  keyupHandler: (event) => void;
  onclick: (event) => void;
  blurHandler: object;
  keydownHandler: object;
  timer?: any;
  source?: () => any
}

interface AutoCompleteOptions extends Object {
  selector?: string | HTMLElement;
  source?: (term : string, response: any) => void;
  minChars?: number;
  delay?: number;
  offsetLeft?: number;
  offsetTop?: number;
  cache?: boolean | number;
  menuClass?: string;
  renderItem?: (item: any, searchTerm: string) => string;
  onSelect?: (e, term, item) => void;
}

