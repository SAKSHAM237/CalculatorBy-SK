/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

const COMPONENT_NAME = 'SakshamCalculator';

AppRegistry.registerComponent(COMPONENT_NAME, () => App);

if (appName && appName !== COMPONENT_NAME) {
  AppRegistry.registerComponent(appName, () => App);
}
