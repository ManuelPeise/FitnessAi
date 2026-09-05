import BackgroundFetch from 'react-native-background-fetch';
import type {
  BackgroundFetchConfig,
  HeadlessEvent,
} from 'react-native-background-fetch';
import HealthConnectScheduleService from './healthConnectScheduleService';

const minimumFetchMinutes = 1;
const healthConnectScheduleService = new HealthConnectScheduleService();

const fetchConfig: BackgroundFetchConfig = {
  minimumFetchInterval: minimumFetchMinutes,
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true,
  requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
};

let isConfigured = false;

type FetchExecutionSource = 'foreground' | 'headless';

const executeFetchTask = async (
  taskId: string,
  source: FetchExecutionSource,
): Promise<void> => {
  try {
    await healthConnectScheduleService.executeDueSchedules();
  } catch (error) {
    console.error(
      `[background-fetch:${source}] Task execution failed for id "${taskId}".`,
      error,
    );
  } finally {
    BackgroundFetch.finish(taskId);
  }
};

export const backgroundTaskService = {
  async initialize(): Promise<boolean> {
    if (isConfigured) {
      return true;
    }

    await BackgroundFetch.configure(
      fetchConfig,
      async taskId => {
        await executeFetchTask(taskId, 'foreground');
      },
      async taskId => {
        BackgroundFetch.finish(taskId);
      },
    );

    await BackgroundFetch.start();
    isConfigured = true;
    return true;
  },

  async handleHeadlessTask(event: HeadlessEvent): Promise<void> {
    if (event.timeout) {
      BackgroundFetch.finish(event.taskId);
      return;
    }

    await executeFetchTask(event.taskId, 'headless');
  },
};
