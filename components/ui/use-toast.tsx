import React, { 
  createContext, 
  useState, 
  useContext, 
  useCallback, 
  ReactNode 
} from 'react';

// Toast Types
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

// Toast Interface
export interface ToastOptions {
  id?: string;
  type?: ToastVariant;
  message: string;
  description?: string;
  duration?: number;
}

// Toast Context Interface
interface ToastContextType {
  addToast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
  toasts: ToastOptions[];
}

// Create Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = options.id || Math.random().toString(36).substr(2, 9);
    const newToast: ToastOptions = {
      ...options,
      id,
      type: options.type || 'default',
      duration: options.duration || 3000
    };

    setToasts(currentToasts => [...currentToasts, newToast]);

    // Auto-dismiss
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(currentToasts => 
      currentToasts.filter(toast => toast.id !== id)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer: React.FC<{ 
  toasts: ToastOptions[], 
  removeToast: (id: string) => void 
}> = ({ toasts, removeToast }) => {
  const getToastClasses = (type: ToastVariant = 'default') => {
    const baseClasses = 'p-4 rounded-lg shadow-md mb-2 relative';
    switch (type) {
      case 'success': return `${baseClasses} bg-green-500 text-white`;
      case 'error': return `${baseClasses} bg-red-500 text-white`;
      case 'warning': return `${baseClasses} bg-yellow-500 text-black`;
      case 'info': return `${baseClasses} bg-blue-500 text-white`;
      default: return `${baseClasses} bg-gray-800 text-white`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-72">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={getToastClasses(toast.type)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold">{toast.message}</div>
              {toast.description && (
                <div className="text-sm opacity-90 mt-1">
                  {toast.description}
                </div>
              )}
            </div>
            <button 
              onClick={() => removeToast(toast.id!)}
              className="ml-2 text-white opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Singleton Toast Manager for non-hook contexts
class ToastManager {
  private static instance: ToastManager;
  private addToastFn: ((options: ToastOptions) => void) | null = null;

  private constructor() {}

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  public setAddToast(fn: (options: ToastOptions) => void) {
    this.addToastFn = fn;
  }

  public toast(options: ToastOptions) {
    if (!this.addToastFn) {
      console.error('Toast provider not initialized. Wrap your app with ToastProvider.');
      return;
    }
    this.addToastFn(options);
  }
}

// Export singleton toast manager
export const toast = ToastManager.getInstance().toast.bind(ToastManager.getInstance());