export const getDownloadableURL = (filePath?: string) => {
  return `${process.env.SERVER_FILED_URL}${filePath}`;
};
