/**
 * @format
 */

import { AppRegistry } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import App from './App';
import { name as appName } from './app.json';
import { backgroundTaskService } from './src/lib/services/scheduler/backgroundTaskService';

BackgroundFetch.registerHeadlessTask(backgroundTaskService.handleHeadlessTask);

AppRegistry.registerComponent(appName, () => App);
