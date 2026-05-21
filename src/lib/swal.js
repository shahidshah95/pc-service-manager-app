import Swal from 'sweetalert2';

// ─── Base config shared by ALL alerts ────────────────────────────────────────
const base = {
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  background: 'linear-gradient(135deg, #1e1e2e 0%, #16213e 100%)',
  color: '#e2e8f0',
  borderRadius: '20px',
  backdrop: 'rgba(0,0,0,0.65)',
  customClass: {
    popup:          'swal-popup',
    title:          'swal-title',
    htmlContainer:  'swal-html',
    confirmButton:  'swal-btn-confirm',
    cancelButton:   'swal-btn-cancel',
    icon:           'swal-icon',
  },
};

// Inject styles once
if (!document.getElementById('swal-custom-styles')) {
  const style = document.createElement('style');
  style.id = 'swal-custom-styles';
  style.textContent = `
    .swal-popup {
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) !important;
      padding: 36px 32px 28px !important;
      backdrop-filter: blur(20px) !important;
    }
    .swal-title {
      font-size: 22px !important;
      font-weight: 700 !important;
      letter-spacing: -0.3px !important;
      color: #f1f5f9 !important;
      margin-bottom: 6px !important;
    }
    .swal-html {
      font-size: 14px !important;
      color: #94a3b8 !important;
      line-height: 1.6 !important;
    }
    .swal-btn-confirm {
      border-radius: 10px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      padding: 10px 28px !important;
      letter-spacing: 0.2px !important;
      box-shadow: none !important;
      border: none !important;
      transition: all 0.2s ease !important;
    }
    .swal-btn-confirm:hover {
      filter: brightness(1.15) !important;
      transform: translateY(-1px) !important;
    }
    .swal-btn-cancel {
      border-radius: 10px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      padding: 10px 28px !important;
      background: rgba(255,255,255,0.08) !important;
      color: #94a3b8 !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      box-shadow: none !important;
      transition: all 0.2s ease !important;
    }
    .swal-btn-cancel:hover {
      background: rgba(255,255,255,0.14) !important;
      color: #e2e8f0 !important;
      transform: translateY(-1px) !important;
    }
    .swal-icon {
      border: none !important;
      margin-bottom: 8px !important;
    }
    /* Animate in */
    .swal2-show { animation: swalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
    .swal2-hide { animation: swalFadeOut 0.2s ease !important; }
    @keyframes swalSlideIn {
      from { opacity: 0; transform: scale(0.88) translateY(20px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes swalFadeOut {
      from { opacity: 1; transform: scale(1); }
      to   { opacity: 0; transform: scale(0.94); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Toast for quick non-blocking messages ────────────────────────────────────
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  background: '#1e293b',
  color: '#f1f5f9',
  iconColor: '#38bdf8',
  customClass: { popup: 'swal-toast' },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

// ─── Exported helpers ─────────────────────────────────────────────────────────

/** ✅ Success toast (bottom-right, non-blocking) */
export function alertSuccess(title, text) {
  if (text) {
    return Swal.fire({
      ...base,
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Got it',
      confirmButtonColor: '#22c55e',
      timer: 2000,
      showConfirmButton: false,
    });
  }
  return Toast.fire({ icon: 'success', title });
}

/** ❌ Error alert */
export function alertError(title, text) {
  return Swal.fire({
    ...base,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Close',
    confirmButtonColor: '#ef4444',
  });
}

/** ⚠️ Warning alert */
export function alertWarning(title, text) {
  return Swal.fire({
    ...base,
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
  });
}

/** 🗑️ Delete confirmation dialog */
export function alertConfirmDelete(customerName) {
  return Swal.fire({
    ...base,
    icon: 'warning',
    title: 'Delete Entry?',
    html: `<span style="color:#94a3b8">This will permanently remove <strong style="color:#f1f5f9">${customerName}</strong>'s service record.<br>This action cannot be undone.</span>`,
    showCancelButton: true,
    confirmButtonText: '🗑️ Yes, Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    reverseButtons: true,
    focusCancel: true,
  });
}

/** ℹ️ Fields missing */
export function alertMissingField(text) {
  return Swal.fire({
    ...base,
    icon: 'info',
    title: 'Missing Information',
    text,
    confirmButtonText: 'OK, Fix It',
    confirmButtonColor: '#6366f1',
  });
}
