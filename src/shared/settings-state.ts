export type IntervalSaveState =
  | "loading"
  | "saving"
  | "saved"
  | "invalid"
  | "load-error"
  | "save-error";

export type ExtensionSaveState = "loading" | "idle" | "saving" | "error";
