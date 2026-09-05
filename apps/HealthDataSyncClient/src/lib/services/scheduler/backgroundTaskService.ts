import BackgroundFetch from 'react-native-background-fetch';
import type {
  BackgroundFetchConfig,
  HeadlessEvent,
} from 'react-native-background-fetch';
import HealthConnectScheduleService from './healthConnectScheduleService';

const minimumFetchMinutes = 15;
const healthConnectScheduleService = new HealthConnectScheduleService();

const fetchConfig: BackgroundFetchConfig = {
  minimumFetchInterval: minimumFetchMinutes,
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true,
  requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
};

let isConfigured = false;

const executeFetchTask = async (taskId: string): Promise<void> => {
  try {
    await healthConnectScheduleService.executeDueSchedules();
    console.log('Executed background fetch task.');
  } catch (error) {
    console.error('Background task execution failed.', error);
  } finally {
    BackgroundFetch.finish(taskId);
  }
};

export const backgroundTaskService = {
  async initialize(): Promise<void> {
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
    if (event.timeout) {
      BackgroundFetch.finish(event.taskId);
      return;
    }

    await executeFetchTask(event.taskId);
  },
};
