'use client';

import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
};

interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  type?: 'success' | 'error';
  button?: {
    label: string;
    onClick: () => void;
  };
}

function Toast(props: ToastProps) {
  const { title, description, button, id, type = 'success' } = props;
  
  const colors = {
    success: {
      bg: 'bg-green-600',
      text: 'text-white',
      buttonBg: 'bg-green-50',
      buttonText: 'text-green-600',
      buttonHover: 'hover:bg-green-100',
      icon: <CheckCircle className="size-5 text-green-500" />
    },
    error: {
      bg: 'bg-red-700',
      text: 'text-white',
      buttonBg: 'bg-red-50',
      buttonText: 'text-red-600',
      buttonHover: 'hover:bg-red-100',
      icon: <XCircle className="size-5 text-white" />
    }
  };

  const style = colors[type];

  return (
    <div className={`flex rounded-lg ${style.bg} shadow-lg ring-1 ring-black/5 w-full md:max-w-[364px] items-center p-4`}>
      <div className="shrink-0 mr-3">
        {style.icon}
      </div>
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-sm text-white">{description}</p>
        </div>
      </div>
      {button && (
        <div className="ml-5 shrink-0">
          <button 
            className={`rounded ${style.buttonBg} px-3 py-1 text-sm font-semibold ${style.buttonText} ${style.buttonHover}`}
            onClick={() => {
              button.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {button.label}
          </button>
        </div>
      )}
    </div>
  );
}

export function toast(props: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom((id) => (
    <Toast 
      id={id} 
      title={props.title} 
      description={props.description}
      type={props.type}
      button={props.button}
    />
  ));
}

export function successToast({ 
  title, 
  description, 
  button 
}: { 
  title: string; 
  description?: string; 
  button?: { label: string; onClick: () => void } 
}) {
  return toast({
    title,
    description,
    type: 'success',
    button
  });
}

export function errorToast({ 
  title, 
  description, 
  button 
}: { 
  title: string; 
  description?: string; 
  button?: { label: string; onClick: () => void } 
}) {
  return toast({
    title,
    description,
    type: 'error',
    button
  });
}