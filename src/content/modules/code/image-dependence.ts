export interface VisionResult {
  id: string;
  withImage: boolean;
  blankImage: boolean;
}

/**
 * Control run: score the same questions with a blank image. Items answered correctly without
 * the image test recall, not vision, so they should not count towards a visual score.
 */
export function visionReport(results: VisionResult[]) {
  const rate = (f: (r: VisionResult) => boolean) => results.filter(f).length / Math.max(results.length, 1);
  const accuracy = rate((r) => r.withImage);
  const blankAccuracy = rate((r) => r.blankImage);
  const visual = results.filter((r) => !r.blankImage);
  return {
    accuracy,
    blankAccuracy,
    visualLift: accuracy - blankAccuracy,
    trueVisualAccuracy: visual.filter((r) => r.withImage).length / Math.max(visual.length, 1),
    imageBlindItems: results.filter((r) => r.blankImage).map((r) => r.id),
  };
}
