import { Extension, Editor } from '@tiptap/core';
import '@tiptap/extension-text-style';

type FontSizeOptions = {
  types: string[];
  getStyle: (fontSize: string) => string;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size attribute
       */
      setFontSize: (size: string) => ReturnType;
      /**
       * Unset the font size attribute
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

const removeTempSpan = (p: Element) =>
  p?.childNodes.forEach((child) => {
     const htmlChild = child as HTMLSpanElement
     htmlChild.innerHTML = htmlChild.innerHTML.replace(String.fromCodePoint(0x200b), '')
  })

const initialize = (fontSize: string) => {
  const p = Array.from(document.querySelector('.ProseMirror')?.children || [])[0]
  removeTempSpan(p)
  if ((p?.childNodes[0] as HTMLElement).tagName === 'BR') {
     p.innerHTML = `<span style="font-size: ${fontSize}">&ZeroWidthSpace;</span>`
  }
}

const DEFAULT_FONT_SIZE = '12px';

export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  
  addOptions(): FontSizeOptions {
    return {
      types: ['textStyle'],
      getStyle: (fontSize: string) => {
        return `font-size: ${fontSize}`;
      },
    };
  },
  
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: { style: { fontSize: string; }; }) =>
              element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes: { fontSize: any; }) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: this.options.getStyle(attributes.fontSize),
              };
            },
          },
        },
      },
    ];
  },

  // @ts-ignore
  onCreate: ({ editor }: { editor: Editor }) => editor.chain().focus().initialize(DEFAULT_FONT_SIZE).run(),
  addCommands() {
    return {
      setFontSize:
        (fontSize: any) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
      initialize:
        (fontSize: string) =>
        ({ chain }: any) => {
           initialize(fontSize)
           return chain().setMark('textStyle', { fontSize }).run()
        },
    };
  },
});

