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

const DEFAULT_FONT_SIZE = '12px';

export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  onCreate: ({ editor }: { editor: Editor }) =>
    editor.chain().focus().initialize(DEFAULT_FONT_SIZE).run(),
  // @ts-ignore
  onUpdate: ({ editor }) => {
    if (editor.getText().length === 0)
      editor.chain().focus().initialize(DEFAULT_FONT_SIZE).run();
  },

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
    };
  },
});
