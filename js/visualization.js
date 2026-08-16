/**
 * HSAY - Visualization Overlay & Multi-Mode Radar Chart Renderer
 * Renders:
 * - Frontal Mesh (478 pts), Axes/Tilt, Thirds/Fifths, Central Axis & FA Symmetry bridges, Hunter Eyes box, 3D Depth vectors
 * - Sagittal Cephalometrics Overlay with Interactive Draggable Landmark Pins
 * - Multi-Mode Radar Charts (Frontal, Profile, Composite) with bilingual support
 */
class Visualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.chartInstance = null;

    this.activeLayers = {
      mesh: true,
      alignment: true,
      thirds: true,
      symmetry: true,
      hunter: true,
      depth3D: false,
      cephalometrics: true,
      eline: true
    };
  }

  setLayers(layerState) {
    this.activeLayers = { ...this.activeLayers, ...layerState };
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Renders Frontal Overlays
   */
  renderFrontalOverlay(landmarks, alignmentData) {
    this.clear();
    if (!landmarks || landmarks.length === 0) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. MediaPipe Mesh (478 points)
    if (this.activeLayers.mesh) {
      landmarks.forEach((pt, i) => {
        const isKeyPoint = [10, 9, 6, 2, 0, 152, 132, 361, 234, 454, 33, 133, 362, 263, 468, 473, 61, 291].includes(i);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isKeyPoint ? 3.5 : 1.2, 0, 2 * Math.PI);
        ctx.fillStyle = isKeyPoint ? '#fbbf24' : 'rgba(244, 63, 94, 0.45)';
        ctx.fill();
      });
    }

    // 2. Axes & Eye Horizon / Canthal Tilt Vectors
    if (this.activeLayers.alignment) {
      const leftEye = { x: (landmarks[33].x + landmarks[133].x) / 2, y: (landmarks[33].y + landmarks[133].y) / 2 };
      const rightEye = { x: (landmarks[362].x + landmarks[263].x) / 2, y: (landmarks[362].y + landmarks[263].y) / 2 };

      // Horizontal Eye Horizon Line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.moveTo(leftEye.x - 70, leftEye.y);
      ctx.lineTo(rightEye.x + 70, rightEye.y);
      ctx.stroke();

      // Canthal Tilt vectors
      ctx.setLineDash([]);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.2;
      // Left eye tilt (133 -> 33)
      ctx.beginPath();
      ctx.moveTo(landmarks[133].x, landmarks[133].y);
      ctx.lineTo(landmarks[33].x, landmarks[33].y);
      ctx.stroke();
      // Right eye tilt (362 -> 263)
      ctx.beginPath();
      ctx.moveTo(landmarks[362].x, landmarks[362].y);
      ctx.lineTo(landmarks[263].x, landmarks[263].y);
      ctx.stroke();
    }


    // 3. Facial Thirds Horizontal Guides
    if (this.activeLayers.thirds) {
      const yForehead = landmarks[10].y;
      const yGlabella = (landmarks[9] || landmarks[168]).y;
      const yNoseBase = landmarks[2].y;
      const yChin = landmarks[152].y;

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      [
        { y: yForehead, label: 'Trichion' },
        { y: yGlabella, label: 'Glabella' },
        { y: yNoseBase, label: 'Subnasale' },
        { y: yChin, label: 'Menton' }
      ].forEach(line => {
        ctx.beginPath();
        ctx.moveTo(60, line.y);
        ctx.lineTo(w - 60, line.y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
        ctx.font = '11px Outfit, sans-serif';
        ctx.fillText(line.label, 65, line.y - 4);
      });
      ctx.setLineDash([]);
    }

    // 4. Central Vertical Median Axis X_mid & FA Symmetry Bridges
    if (this.activeLayers.symmetry) {
      const ptTop = landmarks[9] || landmarks[6];
      const ptBottom = landmarks[2] || landmarks[152];

      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.moveTo(ptTop.x, 40);
      ctx.lineTo(ptBottom.x, h - 40);
      ctx.stroke();

      const symPairs = [[33, 263], [133, 362], [234, 454], [132, 361], [61, 291], [159, 386]];
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 3]);

      symPairs.forEach(([pL, pR]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[pL].x, landmarks[pL].y);
        ctx.lineTo(landmarks[pR].x, landmarks[pR].y);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // 5. Periorbital Hunter Eyes Aspect Ratio & Eye Aperture Bounding Box
    if (this.activeLayers.hunter) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.lineWidth = 1.8;

      // Left eye box
      const eLminX = Math.min(landmarks[33].x, landmarks[133].x);
      const eLmaxX = Math.max(landmarks[33].x, landmarks[133].x);
      const eLminY = Math.min(landmarks[159].y, landmarks[158].y, landmarks[160].y, landmarks[33].y, landmarks[133].y);
      const eLmaxY = Math.max(landmarks[145].y, landmarks[144].y, landmarks[153].y, landmarks[33].y, landmarks[133].y);
      ctx.strokeRect(eLminX - 3, eLminY - 2, eLmaxX - eLminX + 6, eLmaxY - eLminY + 4);

      // Right eye box
      const eRminX = Math.min(landmarks[362].x, landmarks[263].x);
      const eRmaxX = Math.max(landmarks[362].x, landmarks[263].x);
      const eRminY = Math.min(landmarks[386].y, landmarks[385].y, landmarks[387].y, landmarks[362].y, landmarks[263].y);
      const eRmaxY = Math.max(landmarks[374].y, landmarks[373].y, landmarks[380].y, landmarks[362].y, landmarks[263].y);
      ctx.strokeRect(eRminX - 3, eRminY - 2, eRmaxX - eRminX + 6, eRmaxY - eRminY + 4);
    }

    // 6. 3D Depth Vectors Overlay
    if (this.activeLayers.depth3D) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 1.5;
      const noseTip = landmarks[1];
      const glabella = landmarks[9];
      const chin = landmarks[152];
      const cheekL = landmarks[116], cheekR = landmarks[345];

      [noseTip, glabella, chin, cheekL, cheekR].forEach(pt => {
        if (!pt) return;
        const zOffset = (pt.z || 0) * 0.4;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + zOffset, pt.y - zOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pt.x + zOffset, pt.y - zOffset, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
      });
    }
  }

  /**
   * Renders Profile Cephalometric Overlays with Interactive Draggable Pins
   */
  renderProfileOverlay(cephModule, activeDragId = null, hoveredId = null) {
    this.clear();
    if (!cephModule || !cephModule.landmarks) return;

    const ctx = this.ctx;
    const pts = cephModule.landmarks;
    const { G, N, Prn, Sn, Ls, Li, Pog, Me, Go, Ar, Cornea, C } = pts;

    // 1. Ricketts E-Line (Prn -> Pog)
    if (this.activeLayers.eline && Prn && Pog) {
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.moveTo(Prn.x, Prn.y);
      ctx.lineTo(Pog.x, Pog.y);
      ctx.stroke();

      if (Li) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.moveTo(Li.x, Li.y);
        ctx.lineTo(Prn.x + ((Li.y - Prn.y) / (Pog.y - Prn.y)) * (Pog.x - Prn.x), Li.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 2. Cephalometric Angle Polygons & Vectors
    if (this.activeLayers.cephalometrics) {
      // True Gonial Angle (Ar -> Go -> Me)
      if (Ar && Go && Me) {
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.4;
        ctx.moveTo(Ar.x, Ar.y);
        ctx.lineTo(Go.x, Go.y);
        ctx.lineTo(Me.x, Me.y);
        ctx.stroke();
      }

      // Facial Convexity (G -> Sn -> Pog)
      if (G && Sn && Pog) {
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.0;
        ctx.moveTo(G.x, G.y);
        ctx.lineTo(Sn.x, Sn.y);
        ctx.lineTo(Pog.x, Pog.y);
        ctx.stroke();
      }

      // Cervicomental Transition (Me -> C -> NeckBottom)
      const NeckBottom = pts.NeckBottom || { x: C.x, y: C.y + 75 };
      if (Me && C) {
        ctx.beginPath();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.0;
        ctx.moveTo(Me.x, Me.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(NeckBottom.x, NeckBottom.y);
        ctx.stroke();
      }
    }

    // 3. Render Interactive Landmark Pins
    for (const [id, pt] of Object.entries(pts)) {
      if (!pt || id === 'NeckBottom' || id === 'Cm' || id === 'Infraorbital') continue;

      const isDragged = (id === activeDragId);
      const isHovered = (id === hoveredId);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isDragged ? 9 : (isHovered ? 7.5 : 5.5), 0, 2 * Math.PI);
      ctx.fillStyle = isDragged ? '#f59e0b' : (isHovered ? '#fff' : '#06b6d4');
      ctx.fill();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pin Label
      ctx.fillStyle = '#fff';
      ctx.font = isHovered || isDragged ? 'bold 13px Outfit, sans-serif' : '11px Outfit, sans-serif';
      ctx.fillText(id, pt.x + 8, pt.y - 6);
    }
  }

  /**
   * Renders Modern Radar Chart with Bilingual Labels
   */
  renderRadarChart(canvasId, report) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const lang = (window.I18n && window.I18n.currentLang) || 'en';
    let labels = [];
    let dataScores = [];

    if (report.viewMode === 'profile') {
      const m = report.modules.cephalometrics.metrics;
      labels = lang === 'ru' ? [
        'Гониальный угол', 'Ветвь Ramus', 'Линия E-Line',
        'Выпуклость G-Sn-Pog', 'Носогубный угол', 'Шейно-подбородочный угол'
      ] : [
        'Gonial Angle', 'Ramus Index', 'Ricketts E-Line',
        'Facial Convexity', 'Nasolabial Angle', 'Cervicomental Angle'
      ];
      dataScores = [
        m.gonialAngle.score100 || m.gonialAngle.score || 80,
        m.ramusIndex.score100 || m.ramusIndex.score || 80,
        m.eline.score100 || m.eline.score || 80,
        m.convexity.score100 || m.convexity.score || 80,
        m.nasolabial.score100 || m.nasolabial.score || 80,
        m.cervicomental.score100 || m.cervicomental.score || 80
      ];
    } else if (report.viewMode === 'composite') {

      const sm = report.scientificMatrix;
      labels = lang === 'ru' ? [
        'Половой диморфизм', 'Краниофациальная база', 'Качество кожи & Жир',
        'Симметрия & FA', 'Челюстной каркас', 'Гармония лица'
      ] : [
        'Sexual Dimorphism', 'Craniofacial Base', 'Skin & Soft Tissue',
        'Symmetry & FA', 'Jaw Architecture', 'Facial Harmony'
      ];
      dataScores = [
        sm.dimorphism.score || 80,
        sm.anthropometry.score || 80,
        sm.skinHealth.score || 80,
        sm.symmetry.score || 80,
        (report.profileReport && report.profileReport.modules.cephalometrics.metrics.gonialAngle.score) || 85,
        (report.frontalReport && report.frontalReport.harmony) || 88
      ];
    } else {
      // Frontal default
      const m = report.modules;
      labels = lang === 'ru' ? [
        'Краниофациал', 'Hunter Eyes', 'Кожа & Жир',
        'Симметрия FA', 'Диморфизм', 'Гармония черт'
      ] : [
        'Craniofacial', 'Periorbital', 'Skin & Fat',
        'Symmetry FA', 'Dimorphism', 'Harmony'
      ];
      dataScores = [
        m.anthro.score || 80,
        m.periorbital.score || 80,
        m.skin.score || 80,
        m.symmetry.score || 80,
        m.dimorphism.score || 80,
        report.harmony || 85
      ];
    }


    const ctx = canvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: lang === 'ru' ? 'Текущий профиль' : 'Current Profile',
          data: dataScores,
          backgroundColor: 'rgba(225, 29, 72, 0.28)',
          borderColor: '#f43f5e',
          borderWidth: 2,
          pointBackgroundColor: '#fbbf24',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#fbbf24',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(244, 63, 94, 0.15)' },
            grid: { color: 'rgba(244, 63, 94, 0.15)' },
            pointLabels: {
              color: '#fda4af',
              font: { family: 'Outfit, sans-serif', size: 11, weight: '500' }
            },
            ticks: {
              color: '#9f7587',
              backdropColor: 'transparent',
              stepSize: 20,
              font: { size: 9 }
            },
            min: 0,
            max: 100
          }
        },

        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

window.Visualizer = Visualizer;
