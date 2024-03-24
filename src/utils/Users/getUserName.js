export const getUserName = (user) => {
  if (!user) return undefined;
  let userName = "";
  if (user?.first_name || user?.last_name) {
    if (user.first_name !== "null" && user.last_name !== "null")
      userName = `${user.first_name || ""}  ${user.last_name || ""}`.trim();
    else userName = user.username;
  } else userName = user.username;
  return userName;
};
