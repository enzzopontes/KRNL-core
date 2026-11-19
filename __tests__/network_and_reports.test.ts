import { runNetworkDiagnostics } from '../src/services/networkTest';

describe('Network Diagnostics Benchmark', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('FL=32\nh=cloudflare.com\nip=1.1.1.1\nts=1690000000\n'),
      });
    }) as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calculates ping, jitter, and throughput without throwing', async () => {
    const steps: string[] = [];
    const res = await runNetworkDiagnostics((step) => {
      steps.push(step);
    });

    expect(res.completed).toBe(true);
    expect(res.pingMs).toBeGreaterThanOrEqual(0);
    expect(res.jitterMs).toBeGreaterThanOrEqual(0);
    expect(res.downloadMbps).toBeGreaterThan(0);
    expect(steps).toContain('PING');
    expect(steps).toContain('DOWNLOAD');
  });
});
