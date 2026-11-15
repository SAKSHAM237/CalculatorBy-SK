import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

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

// Inline fallback HTML ensuring 100% offline startup even before native asset compilation
const LOCAL_MATHLIVE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="file:///android_asset/mathlive/mathlive-static.css">
  <script src="file:///android_asset/mathlive/mathlive.min.js"></script>
  <style>
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }
    math-field {
      width: 100%;
      font-size: 34px;
      color: #FFFFFF;
      background: transparent;
      border: none;
      outline: none;
      padding: 6px 12px;
      text-align: right;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      touch-action: none !important;
    }
    math-field::part(virtual-keyboard-toggle),
    math-field::part(menu-toggle),
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
    math-field:focus-within {
      outline: none;
      border: none;
    }
  </style>
</head>
<body>
  <math-field id="mf" virtual-keyboard-mode="off" math-virtual-keyboard-policy="manual" menu-mode="none" read-only></math-field>
  <script>
    const mf = document.getElementById('mf');
    if (window.mathVirtualKeyboard) {
      try {
        window.mathVirtualKeyboard.policy = 'manual';
        window.mathVirtualKeyboard.hide();
      } catch (e) {}
    }

    function notifyChange() {
      if (!window.ReactNativeWebView || !mf) return;
      try {
        const asciiMath = mf.getValue('ascii-math') || '';
        const latex = mf.getValue('latex') || '';
        let mathJson = null;
        try {
          mathJson = mf.getValue('math-json');
        } catch (e) {}

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'EXPRESSION_CHANGE',
          asciiMath: asciiMath,
          latex: latex,
          mathJson: mathJson
        }));
      } catch (err) {
        console.error(err);
      }
    }

    if (mf) {
      mf.addEventListener('input', notifyChange);
    }

    window.executeMathCommand = function(cmd, arg) {
      if (!mf) return;
      if (cmd === 'insert') {
        mf.executeCommand(['insert', arg, { mode: 'math' }]);
      } else if (cmd === 'deleteBackward') {
        mf.executeCommand('deleteBackward');
      } else if (cmd === 'deleteAll') {
        mf.setValue('');
      } else if (cmd === 'setValue') {
        mf.setValue(arg || '');
      } else if (cmd === 'moveToPreviousChar') {
        mf.executeCommand('moveToPreviousChar');
      } else if (cmd === 'moveToNextChar') {
        mf.executeCommand('moveToNextChar');
      }
      notifyChange();
    };

    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === 'COMMAND') {
          window.executeMathCommand(data.command, data.arg);
        }
      } catch (err) {}
    });

    document.addEventListener('DOMContentLoaded', function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
      }
    });
  </script>
</body>
</html>
`;

export const DisplayWebView = forwardRef<DisplayWebViewRef, DisplayWebViewProps>(
  ({ onExpressionChange, onReady }, ref) => {
    const webViewRef = useRef<WebView>(null);

    const sendCommand = (command: string, arg?: string) => {
      const payload = JSON.stringify({ type: 'COMMAND', command, arg });
      const js = `window.postMessage(${JSON.stringify(payload)}, '*'); true;`;
      webViewRef.current?.injectJavaScript(js);
    };

    useImperativeHandle(ref, () => ({
      insert: (token: string) => {
        sendCommand('insert', token);
      },
      deleteBackward: () => {
        sendCommand('deleteBackward');
      },
      clear: () => {
        sendCommand('deleteAll');
      },
      setValue: (value: string) => {
        sendCommand('setValue', value);
      },
      moveToPreviousChar: () => {
        sendCommand('moveToPreviousChar');
      },
      moveToNextChar: () => {
        sendCommand('moveToNextChar');
      },
    }));

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'EXPRESSION_CHANGE') {
          onExpressionChange({
            asciiMath: data.asciiMath,
            latex: data.latex,
            mathJson: data.mathJson,
          });
        } else if (data.type === 'READY') {
          onReady?.();
        }
      } catch (e) {
        console.warn('Failed to parse WebView message', e);
      }
    };

    const source =
      Platform.OS === 'android'
        ? { uri: 'file:///android_asset/mathlive/index.html' }
        : { html: LOCAL_MATHLIVE_HTML, baseUrl: '' };

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={source}
          originWhitelist={['*']}
          style={styles.webView}
          containerStyle={styles.container}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webView: {
    backgroundColor: 'transparent',
  },
});
