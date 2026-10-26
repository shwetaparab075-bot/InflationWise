import React from 'react';

const ConfirmDialog = ({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-lg border border-slate-100">
        <h3 className="text-lg font-bold text-[#10233F]">{title}</h3>
        <p className="text-sm text-[#6B7A90] mt-2">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
