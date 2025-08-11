import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction } from "@/components/ui/toast";
import { useLocale } from '@/contexts/LocaleContext';

export function CustomToaster() {
  const { toasts } = useToast();
  const { t } = useLocale();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, titleKey, descriptionKey, descriptionValues, action, ...props }) {
        const finalTitle = titleKey ? t(titleKey) : title;
        const finalDescription = descriptionKey ? t(descriptionKey, descriptionValues) : description;

        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {finalTitle && <ToastTitle>{finalTitle}</ToastTitle>}
              {finalDescription && (
                <ToastDescription>{finalDescription}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}