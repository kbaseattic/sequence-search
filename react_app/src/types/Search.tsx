import { Namespace } from '../types/Namespace';

interface SeqAlignment {
  sequenceId: string,
  sequenceLength: number,
  data: string,
  start: number,
  length: number,
  isForwardStrand: boolean
}

interface Alignment {
  queryAlignment: SeqAlignment,
  targetAlignment: SeqAlignment,
  bitscore: number,
  evalue: number
}

interface Result {
  engine: "last",
  alignments: Alignment[],
  namespaces: Namespace[]
};

export interface Search {
  id: string,
  namespace?: Namespace['id'],
  status?: "queued" | "processing" | "completed" | "failed",
  result?: Result
}