// Simple browser fingerprinting for anonymous user tracking
export function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprinting
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fish fingerprint 🐠', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0, // Optional property
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Get or create fingerprint from localStorage
export function getOrCreateFingerprint(): string {
  const stored = localStorage.getItem('fish_fingerprint');
  if (stored) {
    return stored;
  }
  
  const fingerprint = generateFingerprint();
  localStorage.setItem('fish_fingerprint', fingerprint);
  return fingerprint;
}