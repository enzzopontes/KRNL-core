class TrashAccounting {
  private bytesInTrash = 0;
  private bytesFreed = 0;

  moveToTrash(bytes: number) {
    this.bytesInTrash += bytes;
    // IMPORTANTE: Mover para a lixeira NÃO conta como liberado!
  }

  emptyTrash(): number {
    const freed = this.bytesInTrash;
    this.bytesFreed += freed;
    this.bytesInTrash = 0;
    return freed;
  }

  getReport() {
    return {
      bytesInTrash: this.bytesInTrash,
      bytesFreed: this.bytesFreed,
    };
  }
}

describe('Trash Accounting Principle', () => {
  it('does not increment bytesFreed when moving items to trash/quarantine', () => {
    const acc = new TrashAccounting();
    acc.moveToTrash(500 * 1024 * 1024); // 500 MB para lixeira

    expect(acc.getReport().bytesInTrash).toBe(500 * 1024 * 1024);
    expect(acc.getReport().bytesFreed).toBe(0); // Deve ser estritamente zero!
  });

  it('only accounts as freed after explicitly emptying trash', () => {
    const acc = new TrashAccounting();
    acc.moveToTrash(250 * 1024 * 1024);
    acc.moveToTrash(250 * 1024 * 1024);

    expect(acc.getReport().bytesFreed).toBe(0);

    const freedNow = acc.emptyTrash();
    expect(freedNow).toBe(500 * 1024 * 1024);
    expect(acc.getReport().bytesInTrash).toBe(0);
    expect(acc.getReport().bytesFreed).toBe(500 * 1024 * 1024);
  });
});
