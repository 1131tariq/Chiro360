import SystemSettingsTabs from "./SystemSettingsTabs/SystemSettingsTabs";

function SystemSettings({ userinfo, cptCodes, executeQuery, users, branches }) {
  return (
    <SystemSettingsTabs
      executeQuery={executeQuery}
      branches={branches}
      cptCodes={cptCodes}
      users={users}
      userinfo={userinfo}
    />
  );
}

export default SystemSettings;
