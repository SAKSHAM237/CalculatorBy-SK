import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import 'mathlive';

export interface DisplayWebViewRef {
  insert: (token: string) => void;
  deleteBackward: () => void;
  clear: () => void;
  setValue: (value: string) => void;
  moveToPreviousChar: () => void;
  moveToNextChar: () => void;
}

interface DisplayWebViewProps {
  onExpressionChange: (data: { asciiMath: string; latex: string; mathJson?: any }) => void;
  onReady?: () => void;
}

export const DisplayWebView = forwardRef<DisplayWebViewRef, DisplayWebViewProps>(
  ({ onExpressionChange, onReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mfRef = useRef<any>(null);

    useEffect(() => {
      if (typeof window === 'undefined' || !containerRef.current) return;

      // Inject global CSS to suppress MathLive's built-in toolbar icons
      // (the ⌨ keyboard toggle and ≡ menu that appear as "sword" cross icons)
      if (!document.getElementById('mf-hide-toolbar')) {
        const style = document.createElement('style');
        style.id = 'mf-hide-toolbar';
        style.textContent = `
          math-field::part(virtual-keyboard-toggle),
          math-field::part(menu-toggle),
          math-field .ML__virtual-keyboard-toggle,
          math-field .ML__menu-toggle,
          .ML__virtual-keyboard-toggle,
          .ML__menu-toggle,
          .ML__keyboard,
          .math-field-keyboard,
          math-field-virtual-keyboard,
          .MLK__backdrop,
          .MLK__plate,
          div[data-ml-keyboard] {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
          }
          math-field {
            --keyboard-toggle-glyph-color: transparent;
            pointer-events: none !important;
            user-select: none !important;
          }
        `;
        document.head.appendChild(style);
      }

      const mf = document.createElement('math-field') as any;
      mf.setAttribute('virtual-keyboard-mode', 'off');
      mf.setAttribute('math-virtual-keyboard-policy', 'manual');
      mf.setAttribute('menu-mode', 'none');
      mf.setAttribute('read-only', '');
      try {
        mf.menuItems = [];
      } catch (e) {}
      if (typeof window !== 'undefined' && (window as any).mathVirtualKeyboard) {
        try {
          (window as any).mathVirtualKeyboard.policy = 'manual';
          (window as any).mathVirtualKeyboard.hide();
        } catch (e) {}
      }
      mf.style.width = '100%';
      mf.style.fontSize = '34px';
      mf.style.color = '#FFFFFF';
      mf.style.background = 'transparent';
      mf.style.border = 'none';
      mf.style.outline = 'none';
      mf.style.padding = '6px 12px';
      mf.style.textAlign = 'right';

      // Suppress shadow DOM toggle icons
      try {
        if (mf.shadowRoot) {
          const s = document.createElement('style');
          s.textContent = `
            .ML__keyboard-toggle,
            .ML__menu-toggle,
            .ML__virtual-keyboard-toggle,
            [part="virtual-keyboard-toggle"],
            [part="menu-toggle"],
            [part="keyboard-toggle"],
            .ML__caret {
              display: none !important;
              visibility: hidden !important;
              width: 0 !important;
              height: 0 !important;
              pointer-events: none !important;
            }
          `;
          mf.shadowRoot.appendChild(s);
        }
      } catch (e) {}

      const notifyChange = () => {
        try {
          const asciiMath = mf.getValue('ascii-math') || '';
          const latex = mf.getValue('latex') || '';
          let mathJson = null;
          try {
            mathJson = mf.getValue('math-json');
          } catch (e) {}

          onExpressionChange({
            asciiMath,
            latex,
            mathJson,
          });
        } catch (e) {}
      };

      mf.addEventListener('input', notifyChange);

      // Clear any default value and ensure field starts blank
      mf.setValue('');

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mf);
      mfRef.current = mf;

      // Focus without showing the keyboard
      setTimeout(() => {
        try { mf.blur(); } catch (e) {}
      }, 50);

      onReady?.();

      return () => {
        mf.removeEventListener('input', notifyChange);
      };
    }, [onExpressionChange, onReady]);

    useImperativeHandle(ref, () => ({
      insert: (token: string) => {
        if (!mfRef.current) return;
        mfRef.current.executeCommand(['insert', token, { mode: 'math' }]);
        const asciiMath = mfRef.current.getValue('ascii-math') || '';
        const latex = mfRef.current.getValue('latex') || '';
        onExpressionChange({ asciiMath, latex });
      },
      deleteBackward: () => {
        if (!mfRef.current) return;
        mfRef.current.executeCommand('deleteBackward');
        const asciiMath = mfRef.current.getValue('ascii-math') || '';
        const latex = mfRef.current.getValue('latex') || '';
        onExpressionChange({ asciiMath, latex });
      },
      clear: () => {
        if (!mfRef.current) return;
        mfRef.current.setValue('');
        onExpressionChange({ asciiMath: '', latex: '' });
      },
      setValue: (value: string) => {
        if (!mfRef.current) return;
        mfRef.current.setValue(value || '');
        const asciiMath = mfRef.current.getValue('ascii-math') || '';
        const latex = mfRef.current.getValue('latex') || '';
        onExpressionChange({ asciiMath, latex });
      },
      moveToPreviousChar: () => {
        mfRef.current?.executeCommand('moveToPreviousChar');
      },
      moveToNextChar: () => {
        mfRef.current?.executeCommand('moveToNextChar');
      },
    }));

    return (
      <View style={styles.container}>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
});
