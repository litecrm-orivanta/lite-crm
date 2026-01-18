import { createContext, useContext, ReactNode, useEffect, useState } from "react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type PromptOptions = ConfirmOptions & {
  placeholder?: string;
  defaultValue?: string;
};

type DialogState =
  | (ConfirmOptions & { type: "confirm"; resolve: (result: boolean) => void })
  | (PromptOptions & { type: "prompt"; resolve: (result: string | null) => void });

interface DialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [promptValue, setPromptValue] = useState("");

  useEffect(() => {
    if (dialog?.type === "prompt") {
      setPromptValue(dialog.defaultValue ?? "");
    }
  }, [dialog]);

  function closeDialog() {
    setDialog(null);
  }

  function handleCancel() {
    if (!dialog) return;
    if (dialog.type === "confirm") {
      dialog.resolve(false);
    } else {
      dialog.resolve(null);
    }
    closeDialog();
  }

  function handleConfirm() {
    if (!dialog) return;
    if (dialog.type === "confirm") {
      dialog.resolve(true);
    } else {
      dialog.resolve(promptValue);
    }
    closeDialog();
  }

  function confirm(options: ConfirmOptions) {
    return new Promise<boolean>((resolve) => {
      setDialog({
        type: "confirm",
        confirmText: "Confirm",
        cancelText: "Cancel",
        ...options,
        resolve,
      });
    });
  }

  function prompt(options: PromptOptions) {
    return new Promise<string | null>((resolve) => {
      setDialog({
        type: "prompt",
        confirmText: "OK",
        cancelText: "Cancel",
        ...options,
        resolve,
      });
    });
  }

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-scale-in"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-4">
                {dialog.title && (
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{dialog.title}</h3>
                )}
                <p className="text-sm text-slate-700 whitespace-pre-line">{dialog.message}</p>
              </div>

              {dialog.type === "prompt" && (
                <input
                  value={promptValue}
                  onChange={(event) => setPromptValue(event.target.value)}
                  placeholder={dialog.placeholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  {dialog.cancelText || "Cancel"}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                    dialog.destructive
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {dialog.confirmText || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within DialogProvider");
  }
  return context;
}
