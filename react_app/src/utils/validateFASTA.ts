export async function validateFASTA(fasta: string) {
  const lines = fasta.split("\n").map((l) => l.trimRight());
  const headers = lines
    .map((l, i) => (l.startsWith(">") && l.length > 1 ? i : -1))
    .filter((hloc) => hloc !== -1);

  // ensure 1 or more headers exist
  if (headers.length === 0) throw new Error("No FASTA headers found");

  // sequence groups
  const seqs = headers.map((hloc) => {
    const seqStart = hloc + 1;
    const seqLen = lines
      .slice(hloc + 1)
      .findIndex((l) => !l.trim() || l.startsWith(">"));
    return [seqStart, seqLen === -1 ? lines.length : seqStart + seqLen];
  });

  // check that each sequence contains only allowed chars
  seqs.forEach(([start, stop]) => {
    const seq = lines.slice(start, stop);
    if (seq.length < 1) throw new Error(`Empty sequence on L${start}`);
    seq.forEach((l, i) => {
      if (!/^[ACDEFGHIKLMNPQRSTUVWY\s]+$/i.test(l))
        throw new Error(`Disallowed character on L${start + i + 1}`);
    });
  });
}
