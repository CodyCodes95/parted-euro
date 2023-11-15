import { toast } from "sonner";

export const asyncToast = (
  promise: Promise<any>,
  loadingMessage?: string,
  onSuccess?: () => string,
  onError?: () => string
) => {
  return new Promise((resolve, reject) => {
    toast.promise(promise, {
      loading: loadingMessage || "Loading...",
      success: (data) => {
        resolve(data);
        return onSuccess ? onSuccess() : "Success!";
      },
      error: (err) => {
        reject(err);
        return onError ? onError() : "Error!";
      },
    });
  });
};

