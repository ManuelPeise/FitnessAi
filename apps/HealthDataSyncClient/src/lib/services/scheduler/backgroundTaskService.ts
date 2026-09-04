import BackgroundFetch from 'react-native-background-fetch';
import type {
  BackgroundFetchConfig,
  HeadlessEvent,
} from 'react-native-background-fetch';
import { healthConnectScheduleExecutionService } from './healthConnectScheduleExecutionService';

const fetchConfig: BackgroundFetchConfig = {
  minimumFetchInterval: 15,
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true,
  requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
};

let isConfigured = false;
const isDevelopmentMode = typeof __DEV__ !== 'undefined' && __DEV__;

const executeFetchTask = async (taskId: string): Promise<void> => {
  try {
    await healthConnectScheduleExecutionService.executeDueSchedules();
  } catch (error) {
    console.error('Background task execution failed.', error);
  } finally {
    BackgroundFetch.finish(taskId);
  }
};

export const backgroundTaskService = {
  async initialize(): Promise<void> {
    if (isDevelopmentMode) {
      try {
        await BackgroundFetch.stop();
      } catch (stopError) {
        console.error(
          'Failed to stop background fetch while in development mode.',
          stopError,
        );
      }
      return;
    }

    if (isConfigured) {
      return;
    }

    await BackgroundFetch.configure(
      fetchConfig,
      async taskId => {
        await executeFetchTask(taskId);
      },
      async taskId => {
        BackgroundFetch.finish(taskId);
      },
    );

    await BackgroundFetch.start();
    isConfigured = true;
  },
  async handleHeadlessTask(event: HeadlessEvent): Promise<void> {
    if (isDevelopmentMode) {
      BackgroundFetch.finish(event.taskId);
      return;
    }

    if (event.timeout) {
      BackgroundFetch.finish(event.taskId);
      return;
    }

    await executeFetchTask(event.taskId);
  },
};
