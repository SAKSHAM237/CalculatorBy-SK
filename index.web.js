import { AppRegistry } from 'react-native';
import name from './app.json';
import App from './App';

AppRegistry.registerComponent(name.name, () => App);
AppRegistry.runApplication(name.name, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
});