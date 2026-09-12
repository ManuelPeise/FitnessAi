export type HealthConnectMetricFetchDescriptor<TKey extends string> = {
  key: TKey;
  isActive: boolean;
  fetch: () => Promise<unknown>;
};

export const utilsHealthConnect = {
  /**
   * Runs only the active metric fetches, in parallel, instead of sequentially
   * awaiting each one. A failed individual metric does not abort the others.
   */
  fetchActiveMetrics: async <TKey extends string>(
    descriptors: Array<HealthConnectMetricFetchDescriptor<TKey>>,
  ): Promise<Partial<Record<TKey, unknown>>> => {
    const activeDescriptors = descriptors.filter(
      descriptor => descriptor.isActive,
    );

    const settled = await Promise.allSettled(
      activeDescriptors.map(descriptor => descriptor.fetch()),
    );

    const results: Partial<Record<TKey, unknown>> = {};

    settled.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results[activeDescriptors[index].key] = result.value;
      } else {
        console.error(
          `Health Connect metric fetch failed for "${activeDescriptors[index].key}".`,
          result.reason,
        );
      }
    });

    return results;
  },
};
