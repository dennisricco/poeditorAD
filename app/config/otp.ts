/**
 * OTP Configuration
 * 
 * Ubah nilai OTP_LENGTH jika Supabase mengirim OTP dengan jumlah digit berbeda.
 * Default Supabase: 6 digit
 * Your Supabase: 8 digit
 */

export const OTP_CONFIG = {
  /**
   * Panjang OTP yang dikirim oleh Supabase
   * Default: 6 digit
   * Current: 8 digit (sesuai dengan OTP yang dikirim di email)
   * 
   * Jika Anda menerima OTP dengan jumlah digit berbeda,
   * ubah nilai ini sesuai dengan yang Anda terima di email.
   */
  LENGTH: 8,  // ← Diubah dari 6 ke 8 karena Supabase mengirim 8 digit
  
  /**
   * Waktu expiry OTP dalam menit
   * Default Supabase: 60 menit
   */
  EXPIRY_MINUTES: 60,
  
  /**
   * Cooldown untuk resend OTP dalam detik
   */
  RESEND_COOLDOWN_SECONDS: 60,
} as const;

/**
 * Helper function untuk mendapatkan text deskripsi OTP
 */
export function getOTPDescription(): string {
  return `${OTP_CONFIG.LENGTH}-digit code`;
}

/**
 * Helper function untuk validasi OTP
 */
export function isValidOTP(otp: string): boolean {
  return otp.length === OTP_CONFIG.LENGTH && /^\d+$/.test(otp);
}
