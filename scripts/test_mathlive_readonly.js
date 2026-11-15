const fs = require('fs');
const http = require('http');

// Let's create an html file to test with Chrome headless
const html = `
<!DOCTYPE html>
<html>
<head>
  <script src="E:/CALCULATOR/android/app/src/main/assets/mathlive/mathlive.min.js"></script>
</head>
<body>
  <math-field id="mf1" math-virtual-keyboard-policy="manual" read-only></math-field>
  <math-field id="mf2" math-virtual-keyboard-policy="manual"></math-field>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      const mf1 = document.getElementById('mf1');
      const mf2 = document.getElementById('mf2');
      
      // Test insert on mf1 (read-only)
      let mf1_insert_success = false;
      try {
        mf1.executeCommand(['insert', '5', { mode: 'math' }]);
        mf1_insert_success = (mf1.value === '5');
      } catch(e) {
        mf1_insert_success = false;
      }
      
      // Test setValue on mf1
      mf1.setValue('1+2');
      const mf1_setValue_success = (mf1.value === '1+2');
      
      console.log('RESULT:' + JSON.stringify({
        mf1_insert: mf1_insert_success,
        mf1_val_after_insert: mf1.value,
        mf1_setValue: mf1_setValue_success
      }));
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('E:/CALCULATOR/test_mathlive.html', html);
console.log('Wrote test_mathlive.html');
