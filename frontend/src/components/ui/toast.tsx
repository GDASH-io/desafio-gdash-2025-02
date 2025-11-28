import { Toaster as SonnerToaster, toast as sonnerToast, type ExternalToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info';

export function useToast() {
    const notify = (message: string, type: ToastType = 'info', _icon?: string) => {
        const options: ExternalToast = { description: undefined };
        if (type === 'success') {
            sonnerToast.success(message, options);
        } else if (type === 'error') {
            sonnerToast.error(message, options);
        } else {
            sonnerToast(message, options);
        }
    };
    return { notify };
}

export function Toaster() {
    return <SonnerToaster position="bottom-right" richColors closeButton />;
}