import React from 'react';
import HealthConnectMapping from './components/HealthConnectMapping';

const HealthConnectOriginMapping: React.FC = () => {
  return (
    <HealthConnectMapping
      type="HealthConnectOrigin"
      titleResource="healthConnect.captionOriginMappings"
    />
  );
};

export default HealthConnectOriginMapping;
