import { Namespace } from '../types/Namespace';

interface Alignment {
  queryid: string,
  queryalignseq: string,
  querylenseq: number,
  queryalignstart: number,
  targetid: string,
  targetalignseq: string,
  targetlenseq: number,
  targetalignstart: number,
  bitscore: number,
  evalue: number
}

interface Result {
  impl: "last",
  alignments: Alignment[],
  namespaces: Namespace[]
};

export interface Search {
  ticketId: string,
  status?: "queued" | "processing" | "completed",
  result?: Result
}