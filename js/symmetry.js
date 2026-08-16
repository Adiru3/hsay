/**
 * HSAY - Structural & Texture Symmetry Engine (Block 5)
 * Measures:
 * 1. Structural Bilateral Fluctuating Asymmetry (FA) across 24 landmark pairs
 * 2. Midline Coaxiality Deviation (Glabella, Nose, Incisors, Menton)
 * 3. Texture Symmetry (pixel luminance reflection difference)
 * 4. Distinct regional breakdowns (Upper face, eyes, brows, nose, cheeks, jaw, chin)
 */
class SymmetryAnalyzer {
  /**
   * Evaluates bilateral fluctuating asymmetry, midline deviation, and texture symmetry
   * @param {Array} landmarks - Aligned 1000x1000 landmarks
   * @param {HTMLCanvasElement} [canvas] - Optional aligned canvas for texture symmetry
   * @returns {Object} Symmetry scores, midline deviation, and regional sub-scores
   */
  static analyze(landmarks, canvas = null) {
    const pts = landmarks;

    // 1. True Sagittal Central Axis
    const ptTop = pts[9] || pts[168] || pts[6];
    const ptBottom = pts[2] || pts[0] || pts[152];

    const getXMidAtY = (y) => {
      if (Math.abs(ptBottom.y - ptTop.y) < 1e-5) return ptTop.x;
      const t = (y - ptTop.y) / (ptBottom.y - ptTop.y);
      return ptTop.x + t * (ptBottom.x - ptTop.x);
    };

    // 2. Comprehensive 24 Bilateral Landmark Pairs
    const featureGroups = {
      eyes: [
        [33, 263],   // Outer canthi (Exocanthion)
        [133, 362],  // Inner canthi (Endocanthion)
        [159, 386],  // Upper eyelid margin
        [145, 374]   // Lower eyelid margin
      ],
      eyebrows: [
        [70, 300],   // Eyebrow lateral tail
        [105, 334],  // Eyebrow central peak
        [66, 296]    // Eyebrow medial head
      ],
      midfaceCheeks: [
        [234, 454],  // Zygion (Cheekbones)
        [116, 345],  // Sub-pupillary cheek
        [123, 352],  // Buccal hollow
        [205, 425]   // Maxillary base
      ],
      nose: [
        [129, 358],  // Alar base (Alare)
        [98, 327],   // Nostril curvature
        [240, 460]   // Nasal flank
      ],
      lowerJaw: [
        [132, 361],  // Gonion (Mandibular angle)
        [172, 397],  // Mandibular body curve
        [58, 288]    // Pre-gonial notch
      ],
      mouthChin: [
        [61, 291],   // Cheilion (Mouth corners)
        [39, 269],   // Upper lip lateral peak
        [181, 405],  // Lower lip lateral margin
        [148, 377]   // Mentolabial sulcus side
      ]
    };

    const faceWidth = Math.hypot(pts[454].x - pts[234].x, pts[454].y - pts[234].y) || 350;

    let totalDiffSum = 0;
    let totalPairsCount = 0;
    const groupScores = {};
    const groupDiffs = {};

    for (const [groupName, pairs] of Object.entries(featureGroups)) {
      let groupDiffSum = 0;

      pairs.forEach(([idxLeft, idxRight]) => {
        const pLeft = pts[idxLeft];
        const pRight = pts[idxRight];

        const avgY = (pLeft.y + pRight.y) / 2;
        const xMid = getXMidAtY(avgY);

        const distLeft = Math.abs(xMid - pLeft.x);
        const distRight = Math.abs(pRight.x - xMid);

        const diff = Math.abs(distLeft - distRight);
        groupDiffSum += diff;
      });

      const avgGroupDiff = groupDiffSum / pairs.length;
      groupDiffs[groupName] = avgGroupDiff;

      const relGroupDiffPct = (avgGroupDiff / faceWidth) * 100;
      groupScores[groupName] = Math.max(20, Math.min(99, Math.round(100 - relGroupDiffPct * 18.0)));

      totalDiffSum += groupDiffSum;
      totalPairsCount += pairs.length;
    }

    const overallAvgDiff = totalDiffSum / totalPairsCount;
    const relOverallDiffPct = (overallAvgDiff / faceWidth) * 100;

    // 3. Midline Deviation
    const midlinePoints = [pts[9] || pts[168], pts[1] || pts[4], pts[2], pts[13], pts[152]];
    let midlineDevSum = 0;
    midlinePoints.forEach(p => {
      const idealX = getXMidAtY(p.y);
      midlineDevSum += Math.abs(p.x - idealX);
    });
    const avgMidlineDevPx = midlineDevSum / midlinePoints.length;
    const scoreMidline = Math.max(20, Math.min(99, Math.round(100 - (avgMidlineDevPx / faceWidth) * 480)));

    // Fluctuating Asymmetry (FA) score
    const scoreStructuralFA = Math.max(20, Math.min(99, Math.round(100 - relOverallDiffPct * 16.0)));

    // 4. Texture Symmetry Analysis (Optional Pixel Reflection Diff)
    let scoreTextureSymmetry = 88;
    if (canvas) {
      try {
        const ctx = canvas.getContext('2d');
        const sampleBox = { x: 350, y: 350, w: 300, h: 300 };
        const imgData = ctx.getImageData(sampleBox.x, sampleBox.y, sampleBox.w, sampleBox.h);
        const d = imgData.data;
        let diffSum = 0, countPix = 0;

        for (let y = 0; y < sampleBox.h; y += 4) {
          for (let x = 0; x < sampleBox.w / 2; x += 4) {
            const idxL = (y * sampleBox.w + x) * 4;
            const mirrorX = sampleBox.w - 1 - x;
            const idxR = (y * sampleBox.w + mirrorX) * 4;

            const lumL = 0.299 * d[idxL] + 0.587 * d[idxL + 1] + 0.114 * d[idxL + 2];
            const lumR = 0.299 * d[idxR] + 0.587 * d[idxR + 1] + 0.114 * d[idxR + 2];

            diffSum += Math.abs(lumL - lumR);
            countPix++;
          }
        }
        const avgPixDiff = diffSum / (countPix || 1);
        scoreTextureSymmetry = Math.max(30, Math.min(99, Math.round(100 - avgPixDiff * 0.9)));
      } catch (e) {
        scoreTextureSymmetry = 88;
      }
    }

    const subTotalSymmetry = Math.round(
      0.55 * scoreStructuralFA +
      0.25 * scoreMidline +
      0.20 * scoreTextureSymmetry
    );

    return {
      subTotalScore: Math.max(10, Math.min(99, subTotalSymmetry)),
      scoreStructural: scoreStructuralFA,
      scoreTexture: scoreTextureSymmetry,
      scoreMidline,
      avgDeviationPx: parseFloat(overallAvgDiff.toFixed(2)),
      midlineDevPx: parseFloat(avgMidlineDevPx.toFixed(1)),
      regionalScores: {
        eyes: groupScores.eyes,
        eyebrows: groupScores.eyebrows,
        cheeks: groupScores.midfaceCheeks,
        nose: groupScores.nose,
        jaw: groupScores.lowerJaw,
        mouthChin: groupScores.mouthChin
      },
      metrics: {
        fluctuatingAsymmetry: {
          value: `${(100 - relOverallDiffPct * 10).toFixed(1)}%`,
          score: scoreStructuralFA,
          ideal: '> 96% (High biological stability)'
        },
        midlineDeviation: {
          value: `${avgMidlineDevPx.toFixed(1)} px`,
          score: scoreMidline,
          ideal: '< 1.5 px (Coaxial alignment)'
        },
        textureSymmetry: {
          value: `${scoreTextureSymmetry}%`,
          score: scoreTextureSymmetry,
          ideal: '> 85% (Photometric balance)'
        },
        eyesEyebrowsScore: Math.round((groupScores.eyes + groupScores.eyebrows) / 2),
        cheeksNoseScore: Math.round((groupScores.midfaceCheeks + groupScores.nose) / 2),
        jawMouthScore: Math.round((groupScores.lowerJaw + groupScores.mouthChin) / 2)
      }
    };
  }
}

window.SymmetryAnalyzer = SymmetryAnalyzer;
