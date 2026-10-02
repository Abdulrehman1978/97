/** Export only the displayed API result; never imply an official approval. */
export function downloadDraft(name: string, data: unknown, truthState: string) {
  const blob = new Blob([JSON.stringify({
    document_type: "Decision-support draft — not a certificate or sanction",
    exported_at: new Date().toISOString(),
    truth_state: truthState,
    data,
  }, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `${name}.json`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
