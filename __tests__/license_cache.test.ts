interface LicenseCache {
  isPro: boolean;
  expiresAt: number; // timestamp ms
  cachedAt: number;
}

function checkLicenseValidity(cache: LicenseCache | null, currentTime: number): boolean {
  if (!cache) return false;
  if (!cache.isPro) return false;

  // Se passou da data de expiração, inválido
  if (currentTime > cache.expiresAt) return false;

  // Licença em cache é válida por até 7 dias offline
  const MAX_OFFLINE_CACHE_MS = 7 * 24 * 60 * 60 * 1000;
  if (currentTime - cache.cachedAt > MAX_OFFLINE_CACHE_MS) return false;

  return true;
}

describe('License Cache & Expiry Verification', () => {
  const now = 1792666000000;

  it('validates active cached license within validity window', () => {
    const validCache: LicenseCache = {
      isPro: true,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000, // expira em 30 dias
      cachedAt: now - 1 * 24 * 60 * 60 * 1000, // cache de ontem
    };
    expect(checkLicenseValidity(validCache, now)).toBe(true);
  });

  it('rejects expired subscription', () => {
    const expiredCache: LicenseCache = {
      isPro: true,
      expiresAt: now - 1000, // expirou
      cachedAt: now - 2000,
    };
    expect(checkLicenseValidity(expiredCache, now)).toBe(false);
  });

  it('rejects stale offline cache older than 7 days', () => {
    const staleCache: LicenseCache = {
      isPro: true,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000,
      cachedAt: now - 8 * 24 * 60 * 60 * 1000, // 8 dias sem sync
    };
    expect(checkLicenseValidity(staleCache, now)).toBe(false);
  });
});
