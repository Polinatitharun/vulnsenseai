import { toast } from 'sonner';

let activeToastCount = 0; 

const TOAST_COLORS = {
    success: { background: '#10B981' , color: '#FFFFFF' }, 
    error: { background: '#EF4444', color: '#FFFFFF' },  
    warning: { background: '#F59E0B', color: '#FFFFFF' }, 
    info: { background: '#3B82F6', color: '#FFFFFF' },   
    default: { background: 'red', color: '#000000' }, 
};

export const showToast = (message='no message specified', type = 'default') => {
    activeToastCount++; 

  
    const colors = TOAST_COLORS[type] || TOAST_COLORS.default;

    const baseToastOptions = {
        duration: 1000,
      
        style: {
            zIndex: 1000 + activeToastCount, 
            marginTop: `${(activeToastCount - 1) * 10}px`,
            ...colors,
        },
        onClose: () => {
            activeToastCount--; 
        },
    };

    let toastOptions = { ...baseToastOptions };

    switch (type) {
        case 'success':
            toast.success(message, toastOptions);
            break;
        case 'error':
            toast.error(message, toastOptions);
            break;
        case 'warning':
            (toast.warn || toast.warning || toast)(message, toastOptions);
            break;
        case 'info':
        case 'default':
        default:
            toast(message, toastOptions);
            break;
    }
};
