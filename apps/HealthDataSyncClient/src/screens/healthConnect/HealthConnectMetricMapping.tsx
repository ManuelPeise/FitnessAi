import React from 'react';
import HealthConnectMapping from './components/HealthConnectMapping';

const HealthConnectMetricMapping: React.FC = () => {
  return (
    <HealthConnectMapping
      type="HealthConnectMetric"
      titleResource="healthConnect.captionMetricMappings"
    />
  );
};

export default HealthConnectMetricMapping;
