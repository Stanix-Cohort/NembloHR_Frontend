import { Toaster } from "sonner";

function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      expand={false}
      visibleToasts={4}
    />
  );
}

export default ToastProvider;
