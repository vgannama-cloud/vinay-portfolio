// Downloads the resume PDF instead of opening it in a new tab.
// Supabase storage URLs are cross-origin, so we fetch the file and save it as a blob.
export async function downloadResume(url: string | null | undefined) {
  if (!url) return;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "Vinay_Gannamaneni_Resume.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank");
  }
}
