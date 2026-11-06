export interface PairLogProbs {
  chosen: number;
  rejected: number;
  refChosen: number;
  refRejected: number;
}

/** DPO: -log sigmoid(beta * [(chosen - refChosen) - (rejected - refRejected)]). No reward model. */
export function dpoLoss(p: PairLogProbs, beta = 0.1): number {
  const logits = beta * (p.chosen - p.refChosen - (p.rejected - p.refRejected));
  return Math.log1p(Math.exp(-logits));
}
