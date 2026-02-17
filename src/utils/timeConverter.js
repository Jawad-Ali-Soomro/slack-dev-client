export const toUTCDate = (date, time, timeZone) => {
  const localDateTime = `${date}T${time}:00`;

  const local = new Date(localDateTime);

  const utcDate = new Date(
    local.toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );

  return utcDate;
};
