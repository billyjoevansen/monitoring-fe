export async function fileSaver(blob: Blob, filename: string) {
  const { saveAs } = await import('file-saver');
  saveAs(blob, filename);
}
