import i18n from "../../i18n";

function getHighestAlert(alerts) {
  if (!alerts || alerts.length === 0)
    return {
      level: null,
      title: i18n.t("widgets.last_packet.no_alerts"),
    };
  const alertLevels = {
    good: 0,
    suspicious: 1,
    warning: 2,
    critical: 3,
  };

  let highestLevel = 0;
  let highestAlert = { level: null, title: i18n.t("widgets.last_packet.no_text") };

  alerts.forEach((alert) => {
    if (alertLevels[alert.danger_level] >= highestLevel) {
      highestLevel = alertLevels[alert.danger_level];
      highestAlert.level = i18n.t(`evaluations.${alert.danger_level}`);
      highestAlert.title = alert?.title || alert?.content || i18n.t("widgets.last_packet.no_text");
    }
  });

  return highestAlert;
}
export default getHighestAlert;
