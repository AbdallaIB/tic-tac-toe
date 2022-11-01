export const timestamp = () => {
  return new Date().toJSON();
};

export const getCurrentTimestamp = () => {
  return new Date(new Date().toJSON()).getTime();
};

export const getTimestamp = (date) => {
  return new Date(new Date(date).toJSON());
};

export const getTime = (date) => {
  // convert date to local time before getting time
  return new Date(new Date(date).toJSON()).getTime();
};
