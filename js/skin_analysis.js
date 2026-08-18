/**
 * HSAY - Dermatology & Facial Appearance Engine (Block 4)
 * Evaluates:
 * 1. Skin Homogeneity (CIELAB color variance σ, lightness uniformity)
 * 2. Carotenoid Undertone (CIELAB b* distribution)
 * 3. Microrelief Variance (Laplacian texture variance & local contrast)
 * 4. Periorbital Dark Circles (ΔL* infraorbital vs cheek)
 * 5. Malar-to-Submalar Luminance Contrast (Facial adiposity indicator)
 * 
 * Methodological Rules:
 * - Does not claim 'Golden' or 'Poreless' as universal absolute ideals.
 * - Compares measured pixel statistics to established empirical distributions.
 */
class SkinAnalyzer {
  /**
   * Performs pixel-level OpenCV & Colorimetric skin analysis
   * @param {HTMLCanvasElement} canvas - Aligned 1000x1000 face canvas
   * @param {Array} landmarks - Aligned 1000x1000 landmarks
   * @param {string} [gender] - 'male' | 'female' | 'universal'
   * @returns {Object} Dermatology and appearance scores and metrics
   */
  static analyze(canvas, landmarks, gender = 'male') {
    const ctx = canvas.getContext('2d');
    const pts = landmarks;

    // ROI Bounding Boxes
    const cheekLeftBox = {
      x: Math.max(0, Math.round(pts[116].x - 30)),
      y: Math.max(0, Math.round(pts[116].y - 30)),
      w: 60, h: 60
    };
    const cheekHollowBox = {
      x: Math.max(0, Math.round(pts[123].x - 25)),
      y: Math.max(0, Math.round(pts[123].y + 10)),
      w: 50, h: 50
    };
    const foreheadBox = {
      x: Math.max(0, Math.round(pts[10].x - 40)),
      y: Math.max(0, Math.round(pts[10].y + 15)),
      w: 80, h: 50
    };
    const underEyeLeftBox = {
      x: Math.max(0, Math.round(pts[145].x - 20)),
      y: Math.max(0, Math.round(pts[145].y + 8)),
      w: 40, h: 25
    };

    // Lip Ratio
    const upperLipTop = pts[0] || pts[12];
    const lipLineMid = pts[13];
    const lowerLipBottom = pts[17];
    const upperLipH = Math.abs(lipLineMid.y - upperLipTop.y) || 1;
    const lowerLipH = Math.abs(lowerLipBottom.y - lipLineMid.y) || 1;
    const lipRatioVal = lowerLipH / upperLipH;
    let lipIdeal = gender === 'female' ? 1.6 : (gender === 'male' ? 1.4 : 1.5);
    const lipDev = Math.abs(lipRatioVal - lipIdeal);
    const scoreLipRatio = Math.max(20, Math.min(99, Math.round(100 - lipDev * 85)));

    // Fallback if OpenCV is not loaded
    if (typeof cv === 'undefined' || !cv.Mat) {
      return this._nativeAnalysis(ctx, cheekLeftBox, cheekHollowBox, foreheadBox, underEyeLeftBox, lipRatioVal, scoreLipRatio, gender);
    }

    try {
      // 1. Cheek CIELAB Uniformity & Carotenoid b* Saturation
      const cheekImgData = ctx.getImageData(cheekLeftBox.x, cheekLeftBox.y, cheekLeftBox.w, cheekLeftBox.h);
      const srcMat = cv.matFromImageData(cheekImgData);
      
      const rgbMat = new cv.Mat();
      cv.cvtColor(srcMat, rgbMat, cv.COLOR_RGBA2RGB);

      const labMat = new cv.Mat();
      cv.cvtColor(rgbMat, labMat, cv.COLOR_RGB2Lab);

      const labChannels = new cv.MatVector();
      cv.split(labMat, labChannels);

      const channelL = labChannels.get(0); // L* lightness
      const channelA = labChannels.get(1); // a* erythema
      const channelB = labChannels.get(2); // b* yellowness

      const meanA = new cv.Mat(), stddevA = new cv.Mat();
      cv.meanStdDev(channelA, meanA, stddevA);

      const meanB = new cv.Mat(), stddevB = new cv.Mat();
      cv.meanStdDev(channelB, meanB, stddevB);

      const meanL = new cv.Mat(), stddevL = new cv.Mat();
      cv.meanStdDev(channelL, meanL, stddevL);

      const stdAVal = stddevA.data64F[0];
      const stdBVal = stddevB.data64F[0];
      const meanBVal = meanB.data64F[0];
      const cheekLVal = meanL.data64F[0];

      const colorStdDevAvg = (stdAVal + stdBVal) / 2;
      const scoreUniformity = Math.max(20, Math.min(99, Math.round(100 - (colorStdDevAvg - 2.0) * 8.5)));

      const bStarNormalized = meanBVal - 128;
      let scoreCarotenoid = 90;
      if (bStarNormalized < 6) {
        scoreCarotenoid = Math.max(40, Math.round(95 - (6 - bStarNormalized) * 5.0));
      } else if (bStarNormalized > 24) {
        scoreCarotenoid = Math.max(50, Math.round(95 - (bStarNormalized - 24) * 4.0));
      }

      // 2. Laplacian Microrelief Variance
      const grayMat = new cv.Mat();
      cv.cvtColor(rgbMat, grayMat, cv.COLOR_RGB2GRAY);

      const laplacianMat = new cv.Mat();
      cv.Laplacian(grayMat, laplacianMat, cv.CV_64F);

      const meanLap = new cv.Mat(), stddevLap = new cv.Mat();
      cv.meanStdDev(laplacianMat, meanLap, stddevLap);
      const lapVariance = Math.pow(stddevLap.data64F[0], 2);
      const scoreSmoothness = Math.max(20, Math.min(99, Math.round(100 - (lapVariance - 30) * 0.30)));

      // 3. Under-eye Dark Circles (Delta L*)
      const underEyeImgData = ctx.getImageData(underEyeLeftBox.x, underEyeLeftBox.y, underEyeLeftBox.w, underEyeLeftBox.h);
      const underEyeSrc = cv.matFromImageData(underEyeImgData);
      const underEyeRgb = new cv.Mat(), underEyeLab = new cv.Mat();
      cv.cvtColor(underEyeSrc, underEyeRgb, cv.COLOR_RGBA2RGB);
      cv.cvtColor(underEyeRgb, underEyeLab, cv.COLOR_RGB2Lab);

      const underEyeChannels = new cv.MatVector();
      cv.split(underEyeLab, underEyeChannels);

      const meanUnderL = new cv.Mat(), stddevUnderL = new cv.Mat();
      cv.meanStdDev(underEyeChannels.get(0), meanUnderL, stddevUnderL);

      const deltaL = (meanUnderL.data64F[0] - cheekLVal) * (100 / 255);
      let scoreDarkCircles = 94;
      if (deltaL < -0.5) {
        scoreDarkCircles = Math.max(20, Math.round(94 - Math.abs(deltaL) * 6.5));
      }

      // 4. Malar-to-Submalar Luminance Contrast (Facial Adiposity Indicator)
      const hollowImgData = ctx.getImageData(cheekHollowBox.x, cheekHollowBox.y, cheekHollowBox.w, cheekHollowBox.h);
      const hollowSrc = cv.matFromImageData(hollowImgData);
      const hollowRgb = new cv.Mat(), hollowLab = new cv.Mat();
      cv.cvtColor(hollowSrc, hollowRgb, cv.COLOR_RGBA2RGB);
      cv.cvtColor(hollowRgb, hollowLab, cv.COLOR_RGB2Lab);
      const hollowChannels = new cv.MatVector();
      cv.split(hollowLab, hollowChannels);
      const meanHollowL = new cv.Mat(), stddevHollowL = new cv.Mat();
      cv.meanStdDev(hollowChannels.get(0), meanHollowL, stddevHollowL);

      const hollowContrast = ((cheekLVal - meanHollowL.data64F[0]) / (cheekLVal + 1e-5)) * 100;
      let scoreAdiposity = 84;
      if (hollowContrast > 2.0 && hollowContrast < 18.0) {
        scoreAdiposity = Math.min(96, Math.round(84 + hollowContrast * 0.7));
      } else if (hollowContrast <= 2.0) {
        scoreAdiposity = Math.max(45, Math.round(84 - (2.0 - hollowContrast) * 6.5));
      }

      // Cleanup OpenCV objects
      srcMat.delete(); rgbMat.delete(); labMat.delete(); labChannels.delete();
      channelL.delete(); channelA.delete(); channelB.delete();
      meanA.delete(); stddevA.delete(); meanB.delete(); stddevB.delete();
      meanL.delete(); stddevL.delete(); grayMat.delete(); laplacianMat.delete();
      meanLap.delete(); stddevLap.delete();
      underEyeSrc.delete(); underEyeRgb.delete(); underEyeLab.delete(); underEyeChannels.delete();
      meanUnderL.delete(); stddevUnderL.delete();
      hollowSrc.delete(); hollowRgb.delete(); hollowLab.delete(); hollowChannels.delete();
      meanHollowL.delete(); stddevHollowL.delete();

      const scoreSkinQuality = Math.round((scoreUniformity + scoreSmoothness + scoreCarotenoid) / 3);
      const scoreSoftTissue = Math.round((scoreAdiposity + scoreDarkCircles + scoreLipRatio) / 3);
      const subTotalSkin = Math.round(
        (scoreUniformity + scoreSmoothness + scoreCarotenoid + scoreDarkCircles + scoreAdiposity) / 5
      );


      return {
        subTotalScore: Math.max(10, Math.min(99, subTotalSkin)),
        scoreSkinQuality,
        scoreSoftTissue,
        status: 'ESTIMATED',
        domain: 'PHOTO PROXY',
        metrics: {
          adiposity: {
            value: `Contrast: ${hollowContrast.toFixed(1)}%`,
            score: scoreAdiposity,
            ideal: '4.0% – 12.0% (Malar Contour)',
            status: 'ESTIMATED',
            domain: 'PHOTO PROXY'
          },
          uniformity: {
            value: `σ = ${colorStdDevAvg.toFixed(1)}`,
            score: scoreUniformity,
            ideal: 'σ < 3.8 (CIELAB Homogeneity)',
            status: 'ESTIMATED',
            domain: 'PHOTO PROXY'
          },
          smoothness: {
            value: `Var = ${Math.round(lapVariance)}`,
            score: scoreSmoothness,
            ideal: 'Var 25 – 55 (Microrelief)',
            status: 'ESTIMATED',
            domain: 'PHOTO PROXY'
          },
          carotenoid: {
            value: `b* = +${bStarNormalized.toFixed(1)}`,
            score: scoreCarotenoid,
            ideal: 'b* +8.0 to +18.0 (Warm Undertone)',
            status: 'ESTIMATED',
            domain: 'PHOTO PROXY'
          },
          darkCircles: {
            value: `ΔL* = ${deltaL.toFixed(1)}`,
            score: scoreDarkCircles,
            ideal: 'ΔL* ≥ -1.5 (Minimal Dark Circles)',
            status: 'ESTIMATED',
            domain: 'PHOTO PROXY'
          }
        }
      };
    } catch (e) {
      return this._nativeAnalysis(ctx, cheekLeftBox, cheekHollowBox, foreheadBox, underEyeLeftBox, lipRatioVal, scoreLipRatio, gender);
    }
  }

  /**
   * Native HTML5 Canvas Fallback Pipeline
   */
  static _nativeAnalysis(ctx, cheekBox, hollowBox, foreheadBox, underEyeBox, lipRatioVal, scoreLipRatio, gender) {
    // OpenCV may still be loading when the user starts an analysis.  Use real
    // canvas pixels in that case; never substitute a flattering fixed score.
    try {
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      const sample = box => {
        const image = ctx.getImageData(box.x, box.y, box.w, box.h);
        const data = image.data;
        const lumAt = index => 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
        let sum = 0, sumSq = 0, edgeSum = 0, chromaSum = 0, count = 0;
        for (let y = 1; y < box.h - 1; y += 2) {
          for (let x = 1; x < box.w - 1; x += 2) {
            const index = (y * box.w + x) * 4;
            const lum = lumAt(index);
            sum += lum;
            sumSq += lum * lum;
            chromaSum += data[index] - data[index + 2];
            edgeSum += Math.abs(lum - lumAt(((y - 1) * box.w + x) * 4)) + Math.abs(lum - lumAt((y * box.w + x - 1) * 4));
            count++;
          }
        }
        const mean = sum / Math.max(count, 1);
        return {
          mean,
          std: Math.sqrt(Math.max(0, sumSq / Math.max(count, 1) - mean * mean)),
          edge: edgeSum / Math.max(count, 1),
          chroma: chromaSum / Math.max(count, 1)
        };
      };
      const cheek = sample(cheekBox);
      const hollow = sample(hollowBox);
      const underEye = sample(underEyeBox);
      const uniformity = Math.round(clamp(100 - Math.max(0, cheek.std - 9) * 3.2, 20, 96));
      const smoothness = Math.round(clamp(100 - Math.max(0, cheek.edge - 28) * 1.15, 20, 96));
      const darkDelta = ((underEye.mean - cheek.mean) / Math.max(cheek.mean, 1)) * 100;
      const darkCircles = Math.round(clamp(94 - Math.max(0, -darkDelta - 2) * 4.5, 20, 94));
      const hollowContrast = ((cheek.mean - hollow.mean) / Math.max(cheek.mean, 1)) * 100;
      const adiposity = Math.round(clamp(78 + Math.min(12, Math.max(-18, hollowContrast - 3) * 1.2), 35, 90));
      const colourBalance = Math.round(clamp(88 - Math.abs(cheek.chroma - 12) * 0.8, 35, 92));
      const subTotalScore = Math.round((uniformity + smoothness + colourBalance + darkCircles + adiposity) / 5);
      return {
        subTotalScore,
        scoreSkinQuality: Math.round((uniformity + smoothness + colourBalance) / 3),
        scoreSoftTissue: Math.round((adiposity + darkCircles + scoreLipRatio) / 3),
        status: 'ESTIMATED',
        domain: 'PHOTO PROXY',
        metrics: {
          adiposity: { value: `Luminance contrast: ${hollowContrast.toFixed(1)}%`, score: adiposity, ideal: 'Image proxy only', status: 'ESTIMATED', domain: 'PHOTO PROXY' },
          uniformity: { value: `Luminance sigma = ${cheek.std.toFixed(1)}`, score: uniformity, ideal: 'Even illumination and low local variance', status: 'ESTIMATED', domain: 'PHOTO PROXY' },
          smoothness: { value: `Edge activity = ${cheek.edge.toFixed(1)}`, score: smoothness, ideal: 'Photo proxy; affected by focus and compression', status: 'ESTIMATED', domain: 'PHOTO PROXY' },
          carotenoid: { value: `RGB colour balance = ${cheek.chroma.toFixed(1)}`, score: colourBalance, ideal: 'Photo proxy; not a dietary measure', status: 'ESTIMATED', domain: 'PHOTO PROXY' },
          darkCircles: { value: `Relative luminance delta = ${darkDelta.toFixed(1)}%`, score: darkCircles, ideal: 'Photo proxy; affected by light and sleep', status: 'ESTIMATED', domain: 'PHOTO PROXY' }
        }
      };
    } catch (error) {
      // Do not turn an unreadable image into a believable fixed skin score.
      return {
        subTotalScore: null,
        status: 'NOT_OBSERVABLE',
        reliability: 'LOW',
        domain: 'PHOTO PROXY',
        explanation: 'Skin pixels are unavailable to the local analyser. Retake the photo in a supported browser.',
        metrics: {
          adiposity: { value: 'Unavailable', score: null, ideal: 'No readable skin pixels', status: 'NOT_OBSERVABLE', domain: 'PHOTO PROXY' },
          uniformity: { value: 'Unavailable', score: null, ideal: 'No readable skin pixels', status: 'NOT_OBSERVABLE', domain: 'PHOTO PROXY' },
          smoothness: { value: 'Unavailable', score: null, ideal: 'No readable skin pixels', status: 'NOT_OBSERVABLE', domain: 'PHOTO PROXY' },
          carotenoid: { value: 'Unavailable', score: null, ideal: 'No readable skin pixels', status: 'NOT_OBSERVABLE', domain: 'PHOTO PROXY' },
          darkCircles: { value: 'Unavailable', score: null, ideal: 'No readable skin pixels', status: 'NOT_OBSERVABLE', domain: 'PHOTO PROXY' }
        }
      };
    }
  }
}

window.SkinAnalyzer = SkinAnalyzer;
