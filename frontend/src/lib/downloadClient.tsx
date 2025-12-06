import { API_BASE_URL, getSecureToken } from "./client"

export function RequestDownloadFile(path: string) {
  const token = getSecureToken()
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${API_BASE_URL}${path}`, true);
  xhr.setRequestHeader("Authorization", token || "")
  xhr.responseType = "blob";

  xhr.onload = function() {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      console.error('Error downloading file:', xhr.statusText);
    }
    
  };

  xhr.onerror = function() {
    console.error('Network error during file download.');
  };

  xhr.send();
}