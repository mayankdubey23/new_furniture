export const ADMIN_TOAST_EVENT = 'new-furniture-admin-toast';

export type AdminToastDetail = {
  type: 'success' | 'error';
  message: string;
};

export function emitAdminToast(detail: AdminToastDetail) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<AdminToastDetail>(ADMIN_TOAST_EVENT, { detail }));
}
