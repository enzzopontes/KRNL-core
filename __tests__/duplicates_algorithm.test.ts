interface FileCandidate {
  path: string;
  size: number;
  partialHash?: string;
  fullHash?: string;
}

function findDuplicates3Stage(
  files: FileCandidate[],
  getPartial: (f: FileCandidate) => string,
  getFull: (f: FileCandidate) => string
) {
  // Etapa 1: Agrupar por tamanho exato
  const sizeGroups = new Map<number, FileCandidate[]>();
  for (const f of files) {
    const list = sizeGroups.get(f.size) || [];
    list.push(f);
    sizeGroups.set(f.size, list);
  }

  const duplicates: FileCandidate[][] = [];

  for (const [_, candidates] of sizeGroups.entries()) {
    if (candidates.length <= 1) continue;

    // Etapa 2: Hash parcial
    const partialGroups = new Map<string, FileCandidate[]>();
    for (const c of candidates) {
      const pHash = getPartial(c);
      const list = partialGroups.get(pHash) || [];
      list.push(c);
      partialGroups.set(pHash, list);
    }

    // Etapa 3: Hash completo somente dos empatados
    for (const [_, partialMatches] of partialGroups.entries()) {
      if (partialMatches.length <= 1) continue;

      const fullGroups = new Map<string, FileCandidate[]>();
      for (const m of partialMatches) {
        const fHash = getFull(m);
        const list = fullGroups.get(fHash) || [];
        list.push(m);
        fullGroups.set(fHash, list);
      }

      for (const [_, exactMatches] of fullGroups.entries()) {
        if (exactMatches.length > 1) {
          duplicates.push(exactMatches);
        }
      }
    }
  }

  return duplicates;
}

describe('3-Stage Duplicate Identification Algorithm', () => {
  it('correctly filters unique vs exact duplicate files', () => {
    const files: FileCandidate[] = [
      { path: '/a.mp4', size: 1000, partialHash: 'p1', fullHash: 'f1' },
      { path: '/b.mp4', size: 1000, partialHash: 'p1', fullHash: 'f1' }, // Duplicata exata de a
      { path: '/c.mp4', size: 1000, partialHash: 'p2', fullHash: 'f2' }, // Mesmo tamanho, hash diferente
      { path: '/d.mp4', size: 2000, partialHash: 'p3', fullHash: 'f3' }, // Tamanho único
    ];

    const result = findDuplicates3Stage(
      files,
      (f) => f.partialHash!,
      (f) => f.fullHash!
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    expect(result[0].map((f) => f.path)).toEqual(['/a.mp4', '/b.mp4']);
  });
});
