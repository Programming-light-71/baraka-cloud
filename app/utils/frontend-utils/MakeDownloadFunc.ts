export function handleDownloadFile(fileURL: string, fileName: string) {
  const link = document.createElement("a");
  link.href = `${fileURL}`; // Set the Base64 encoded file as href
  link.download = fileName; // Set the file name
  document.body.appendChild(link); // Append the link to the document
  link.click(); // Trigger the download
  document.body.removeChild(link); // Clean up the DOM by removing the link
}
