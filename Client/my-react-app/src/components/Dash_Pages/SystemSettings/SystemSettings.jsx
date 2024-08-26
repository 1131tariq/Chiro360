import SystemSettingsTabs from "./SystemSettingsTabs/SystemSettingsTabs";

function SystemSettings({ cptCodes, executeQuery, users, branches }) {
  return (
    <SystemSettingsTabs
      executeQuery={executeQuery}
      branches={branches}
      cptCodes={cptCodes}
      users={users}
    />
  );
}

export default SystemSettings;
