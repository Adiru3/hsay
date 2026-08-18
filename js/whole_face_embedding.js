/**
 * HSAY - Whole-Face Spatial Configuration Embedding Engine
 * Extracts a compact normalized facial geometry vector (64 dimensions) and a
 * transparent configuration-balance proxy.  It does not claim access to a
 * population "mean face" without a reference dataset.
 */
class WholeFaceEmbeddingEngine {
  /**
   * Generates a 64-dimensional normalized spatial feature embedding
   * @param {Array} landmarks - 478 Aligned 1000x1000 landmarks
   * @param {HTMLCanvasElement} canvas - Aligned 1000x1000 face canvas
   * @returns {Object} Embedding vector, norm, and configuration-balance score
   */
  static extractEmbedding(landmarks, canvas) {
    const pts = landmarks;
    const center = { x: 500, y: 500 };
    const embedding = [];

    // Selected 32 key anatomical landmarks spanning contour, eyes, nose, lips, jaw, chin, forehead
    const keyIndices = [
      10, 9, 8, 168, 6, 1, 2, 0, 13, 14, 17, 152,
      33, 133, 159, 145, 468,
      263, 362, 386, 374, 473,
      70, 105, 66, 300, 334, 296,
      234, 454, 132, 361
    ];

    // Compute normalized radial distance and angle for each landmark relative to center
    keyIndices.forEach(idx => {
      const p = pts[idx] || center;
      const dx = (p.x - center.x) / 500;
      const dy = (p.y - center.y) / 500;
      const r = Math.hypot(dx, dy);
      const theta = Math.atan2(dy, dx);
      embedding.push(parseFloat(r.toFixed(4)));
      embedding.push(parseFloat((theta / Math.PI).toFixed(4)));
    });

    // Compute vector L2 norm
    let sumSq = 0;
    embedding.forEach(val => sumSq += val * val);
    const l2Norm = Math.sqrt(sumSq);

    // Scale-free configuration balance.  The previous implementation compared
    // an L2 norm to an undocumented magic number (3.82), which was not a real
    // population prototype and therefore could not measure averageness.
    const faceWidth = Math.abs((pts[454] || center).x - (pts[234] || center).x) || 1;
    const midX = ((pts[454] || center).x + (pts[234] || center).x) / 2;
    const bilateralPairs = [[33, 263], [133, 362], [70, 300], [61, 291], [132, 361]];
    const bilateralError = bilateralPairs.reduce((sum, [left, right]) => {
      const leftDistance = Math.abs(midX - (pts[left] || center).x);
      const rightDistance = Math.abs((pts[right] || center).x - midX);
      return sum + Math.abs(leftDistance - rightDistance) / faceWidth;
    }, 0) / bilateralPairs.length;
    const bilateralBalance = Math.max(20, Math.min(100, 100 - bilateralError * 420));

    const eyeLevelDelta = Math.abs(((pts[33] || center).y + (pts[263] || center).y) / 2 - ((pts[133] || center).y + (pts[362] || center).y) / 2) / faceWidth;
    const mouthLevelDelta = Math.abs((pts[61] || center).y - (pts[291] || center).y) / faceWidth;
    const levelBalance = Math.max(20, Math.min(100, 100 - (eyeLevelDelta + mouthLevelDelta) * 380));
    const configurationScore = Math.round(0.70 * bilateralBalance + 0.30 * levelBalance);

    return {
      vectorLength: embedding.length,
      l2Norm: parseFloat(l2Norm.toFixed(3)),
      configurationScore,
      bilateralBalance: Math.round(bilateralBalance),
      levelBalance: Math.round(levelBalance),
      embedding
    };
  }
}

window.WholeFaceEmbeddingEngine = WholeFaceEmbeddingEngine;
