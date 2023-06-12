import { toast } from "react-toastify";

export const success = (message: string) => toast.success(message);

export const error = (message: string) => toast.error(message);
