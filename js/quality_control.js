/**
 * HSAY - Image Quality Control & Face Validation Engine
 * Evaluates resolution, lighting uniformity, Laplacian sharpness, head pose,
 * and boundary containment before downstream biometric morphometry.
 */
class QualityControlEngine {
  /**
   * Performs full quality analysis on the source image canvas & raw landmarks
   * @param {HTMLCanvasElement} canvas - Source image canvas
   * @param {Array} rawLandmarks - MediaPipe 478 raw landmarks
   * @param {Object} headPose - { rollDeg, pitchDeg, yawDeg }
   * @returns {Object} Quality metrics, photo reliability score (0-100), and confidence level
   */
  static assessQuality(canvas, rawLandmarks, headPose = { rollDeg: 0, pitchDeg: 0, yawDeg: 0 }) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');

    // 1. Resolution Check
    const minDim = Math.min(width, height);
    let scoreResolution = 100;
    if (minDim < 500) {
      scoreResolution = Math.max(30, (minDim / 500) * 100);
    }

    // 2. Face Coverage in Frame
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    rawLandmarks.forEach(pt => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });

    const faceWidthRel = maxX - minX;
    const faceHeightRel = maxY - minY;
    let scoreFraming = 100;
    if (faceHeightRel < 0.35) {
      scoreFraming = Math.max(40, (faceHeightRel / 0.35) * 100);
    } else if (minX < 0.02 || maxX > 0.98 || minY < 0.02 || maxY > 0.98) {
      scoreFraming = 80; // Truncation warning
    }

    // 3. Head Pose Alignment Penalty (Frontal vs Profile)
    const isProfile = Math.abs(headPose.yawDeg) > 45;
    let scorePose = 100;
    if (!isProfile) {
      const yawPenalty = Math.abs(headPose.yawDeg) * 2.5;
      const pitchPenalty = Math.abs(headPose.pitchDeg) * 2.2;
      const rollPenalty = Math.abs(headPose.rollDeg) * 1.5;
      scorePose = Math.max(40, 100 - (yawPenalty + pitchPenalty + rollPenalty));
    }

    // 4. Lighting Uniformity & Sharpness
    let scoreLighting = 90;
    let scoreSharpness = 90;

    try {
      const step = Math.max(1, Math.floor(minDim / 100));
      const sampleW = Math.min(200, width);
      const sampleH = Math.min(200, height);
      const imgData = ctx.getImageData(Math.floor((width - sampleW) / 2), Math.floor((height - sampleH) / 2), sampleW, sampleH);
      const data = imgData.data;

      let sumLumLeft = 0, countLeft = 0;
      let sumLumRight = 0, countRight = 0;
      let laplacianSum = 0, countLap = 0;

      for (let y = 1; y < sampleH - 1; y += 2) {
        for (let x = 1; x < sampleW - 1; x += 2) {
          const idx = (y * sampleW + x) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

          if (x < sampleW / 2) {
            sumLumLeft += lum;
            countLeft++;
          } else {
            sumLumRight += lum;
            countRight++;
          }

          // Approx discrete Laplacian
          const idxUp = ((y - 1) * sampleW + x) * 4;
          const idxDown = ((y + 1) * sampleW + x) * 4;
          const idxLeft = (y * sampleW + (x - 1)) * 4;
          const idxRight = (y * sampleW + (x + 1)) * 4;

          const lumUp = 0.299 * data[idxUp] + 0.587 * data[idxUp + 1] + 0.114 * data[idxUp + 2];
          const lumDown = 0.299 * data[idxDown] + 0.587 * data[idxDown + 1] + 0.114 * data[idxDown + 2];
          const lumL = 0.299 * data[idxLeft] + 0.587 * data[idxLeft + 1] + 0.114 * data[idxLeft + 2];
          const lumR = 0.299 * data[idxRight] + 0.587 * data[idxRight + 1] + 0.114 * data[idxRight + 2];

          const lap = Math.abs(lumUp + lumDown + lumL + lumR - 4 * lum);
          laplacianSum += lap;
          countLap++;
        }
      }

      const avgLumLeft = sumLumLeft / (countLeft || 1);
      const avgLumRight = sumLumRight / (countRight || 1);
      const lightAsymmetry = (Math.abs(avgLumLeft - avgLumRight) / (Math.max(avgLumLeft, avgLumRight) + 1e-4)) * 100;
      scoreLighting = Math.max(40, Math.min(100, 100 - lightAsymmetry * 1.5));

      const avgLap = laplacianSum / (countLap || 1);
      scoreSharpness = Math.max(40, Math.min(100, 30 + avgLap * 4.5));
    } catch (e) {
      scoreLighting = 88;
      scoreSharpness = 88;
    }

    // Weighted Overall Photo Reliability Score (0-100)
    const photoReliability = Math.round(
      0.30 * scorePose +
      0.25 * scoreSharpness +
      0.20 * scoreLighting +
      0.15 * scoreFraming +
      0.10 * scoreResolution
    );

    let confidenceRating = 'HIGH';
    if (photoReliability < 65) {
      confidenceRating = 'LOW';
    } else if (photoReliability < 82) {
      confidenceRating = 'MEDIUM';
    }

    return {
      photoReliability: Math.max(10, Math.min(99, photoReliability)),
      confidenceRating,
      details: {
        resolutionScore: Math.round(scoreResolution),
        framingScore: Math.round(scoreFraming),
        poseScore: Math.round(scorePose),
        lightingScore: Math.round(scoreLighting),
        sharpnessScore: Math.round(scoreSharpness),
        minDimensionPx: minDim
      }
    };
  }
}

window.QualityControlEngine = QualityControlEngine;
