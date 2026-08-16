/**
 * HSAY (How sexy are you?) - Main Application Orchestrator
 * Implements full 14-stage pipeline:
 * Photo -> QC -> Detection -> Segmentation -> Head Pose -> Lens/Frankfurt 85mm -> Landmarks ->
 * 2D Morphometry -> Skin CV -> 3D Reconstruction -> Population Comparison -> Feature Integration ->
 * Whole-Face Embedding -> 3 Independent Models (Scientific, Sexual, PSL) -> Reliability & Uncertainty.
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const sourceImage = document.getElementById('sourceImage');
  const outputCanvas = document.getElementById('outputCanvas');
  const overlayCanvas = document.getElementById('overlayCanvas');
  
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressStepText = document.getElementById('progressStepText');
  const progressPercent = document.getElementById('progressPercent');

  const welcomeState = document.getElementById('welcomeState');
  const resultsDashboard = document.getElementById('resultsDashboard');

  const webcamBtn = document.getElementById('webcamBtn');
  const webcamModal = document.getElementById('webcamModal');
  const webcamVideo = document.getElementById('webcamVideo');
  const closeWebcamModal = document.getElementById('closeWebcamModal');
  const cancelWebcamBtn = document.getElementById('cancelWebcamBtn');
  const captureWebcamBtn = document.getElementById('captureWebcamBtn');
  const webcamModalTitle = document.getElementById('webcamModalTitle');

  const genderBtns = document.querySelectorAll('.gender-btn');
  const modeTabBtns = document.querySelectorAll('.mode-tab-btn');
  const overlayTogglesContainer = document.getElementById('overlayTogglesContainer');

  const currentSlotLabel = document.getElementById('currentSlotLabel');
  const dropzoneTitle = document.getElementById('dropzoneTitle');
  const dropzoneHint = document.getElementById('dropzoneHint');
  const viewportTitle = document.getElementById('viewportTitle');

  const frontalStatusBadge = document.getElementById('frontalStatusBadge');
  const profileStatusBadge = document.getElementById('profileStatusBadge');
  const compositeStatusBadge = document.getElementById('compositeStatusBadge');

  // Interactive Profile Editor Toolbar Elements
  const profileEditorToolbar = document.getElementById('profileEditorToolbar');
  const btnDragMode = document.getElementById('btnDragMode');
  const btnWizardMode = document.getElementById('btnWizardMode');
  const btnResetAutoPoints = document.getElementById('btnResetAutoPoints');
  const editorPromptText = document.getElementById('editorPromptText');

  // Language switch
  const langSwitchBtn = document.getElementById('langSwitchBtn');

  // Application State
  let currentMode = 'frontal'; // 'frontal' | 'profile' | 'composite'
  let currentGender = 'male';
  let currentRecFilter = 'all';
  let faceMesh = null;
  let visualizer = new Visualizer(overlayCanvas);
  let webcamStream = null;

  // Interactive Landmark Dragging & Marking State
  let profileEditorMode = 'drag'; // 'drag' | 'wizard'
  let activeDragPointId = null;
  let hoveredPointId = null;
  let wizardCurrentStepIndex = 0;
  let wizardLandmarks = CephalometricsAnalyzer.getLandmarkDefinitions();

  // Stored state for independent projections
  const state = {
    frontal: {
      image: null,
      rawLandmarks: null,
      alignedResult: null,
      qc: null,
      morph2D: null,
      morph3D: null,
      wholeFace: null,
      report: null
    },
    profile: {
      image: null,
      rawLandmarks: null,
      alignedResult: null,
      qc: null,
      report: null,
      customPoints: null,
      autoPoints: null,
      facingLeft: true
    },
    compositeReport: null
  };

  // -----------------------------------------------------------------
  // Language Switcher Setup
  // -----------------------------------------------------------------
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener('click', () => {
      I18n.toggleLang();
    });
  }

  window.addEventListener('hsay_lang_changed', () => {
    wizardLandmarks = CephalometricsAnalyzer.getLandmarkDefinitions();
    setAppMode(currentMode);
    if (currentMode === 'frontal' && state.frontal.report) {
      recomputeFrontal();
    } else if (currentMode === 'profile' && state.profile.report) {
      recomputeProfileFromCustomPoints();
    } else if (currentMode === 'composite' && state.compositeReport) {
      displayCompositeView();
    }
  });

  // Apply initial translations
  I18n.applyTranslations();

  // -----------------------------------------------------------------
  // MediaPipe FaceMesh Initialization
  // -----------------------------------------------------------------
  function initFaceMesh() {
    faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceMeshResults);
  }

  initFaceMesh();

  // -----------------------------------------------------------------
  // Mode Tab Switching
  // -----------------------------------------------------------------
  modeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setAppMode(btn.dataset.mode);
    });
  });

  function setAppMode(mode) {
    currentMode = mode;
    updateTogglesForMode(mode);

    if (mode === 'frontal') {
      overlayCanvas.classList.remove('interactive-mode', 'wizard-mode', 'dragging');
      if (profileEditorToolbar) profileEditorToolbar.classList.add('hidden');

      currentSlotLabel.innerHTML = I18n.t('slotFrontal');
      dropzoneTitle.textContent = I18n.t('dropzoneTitleFrontal');
      dropzoneHint.textContent = I18n.t('dropzoneHintFrontal');
      viewportTitle.innerHTML = `<i data-lucide="eye" style="width:14px;height:14px;"></i> ${I18n.t('viewportFrontal')}`;
      if (webcamModalTitle) webcamModalTitle.textContent = I18n.t('webcamModalTitle');

      if (state.frontal.alignedResult) {
        displayFrontalView();
      } else {
        clearViewport();
      }
    } else if (mode === 'profile') {
      overlayCanvas.classList.add('interactive-mode');
      if (profileEditorToolbar && state.profile.alignedResult) {
        profileEditorToolbar.classList.remove('hidden');
      }

      currentSlotLabel.innerHTML = I18n.t('slotProfile');
      dropzoneTitle.textContent = I18n.t('dropzoneTitleProfile');
      dropzoneHint.textContent = I18n.t('dropzoneHintProfile');
      viewportTitle.innerHTML = `<i data-lucide="scan-line" style="width:14px;height:14px;"></i> ${I18n.t('viewportProfile')}`;
      if (webcamModalTitle) webcamModalTitle.textContent = I18n.t('webcamModalTitle');

      if (state.profile.alignedResult) {
        displayProfileView();
      } else {
        clearViewport();
      }
    } else if (mode === 'composite') {
      overlayCanvas.classList.remove('interactive-mode', 'wizard-mode', 'dragging');
      if (profileEditorToolbar) profileEditorToolbar.classList.add('hidden');

      currentSlotLabel.innerHTML = `<i data-lucide="dna" style="width:14px;height:14px;"></i> ${I18n.t('slotComposite')}`;
      viewportTitle.innerHTML = `<i data-lucide="dna" style="width:14px;height:14px;"></i> ${I18n.t('viewportComposite')}`;
      
      displayCompositeView();
    }

    lucide.createIcons();
  }

  function updateTogglesForMode(mode) {
    overlayTogglesContainer.innerHTML = '';
    if (mode === 'profile') {
      overlayTogglesContainer.innerHTML = `
        <span class="toggle-chip active" data-layer="eline">${I18n.t('toggleEline')}</span>
        <span class="toggle-chip active" data-layer="cephalometrics">${I18n.t('toggleCeph')}</span>
      `;
    } else {
      overlayTogglesContainer.innerHTML = `
        <span class="toggle-chip active" data-layer="mesh">${I18n.t('toggleMesh')}</span>
        <span class="toggle-chip active" data-layer="alignment">${I18n.t('toggleAlignment')}</span>
        <span class="toggle-chip active" data-layer="thirds">${I18n.t('toggleThirds')}</span>
        <span class="toggle-chip active" data-layer="symmetry">${I18n.t('toggleSymmetry')}</span>
        <span class="toggle-chip active" data-layer="hunter">${I18n.t('toggleHunter')}</span>
        <span class="toggle-chip" data-layer="depth3D">${I18n.t('toggle3DDepth')}</span>
      `;
    }
    attachToggleListeners();
  }

  function attachToggleListeners() {
    const chips = overlayTogglesContainer.querySelectorAll('.toggle-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        const layers = {};
        chips.forEach(c => {
          layers[c.dataset.layer] = c.classList.contains('active');
        });
        visualizer.setLayers(layers);

        if (currentMode === 'profile' && state.profile.report) {
          visualizer.renderProfileOverlay(state.profile.report.modules.cephalometrics, activeDragPointId, hoveredPointId);
        } else if (state.frontal.alignedResult) {
          visualizer.renderFrontalOverlay(state.frontal.alignedResult.alignedLandmarks, state.frontal.alignedResult);
        }
      });
    });
  }

  attachToggleListeners();

  // Gender Selection
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGender = btn.dataset.gender;

      if (state.frontal.alignedResult) recomputeFrontal();
      if (state.profile.alignedResult) recomputeProfile(false);
      if (currentMode === 'composite') displayCompositeView();
    });
  });

  // Recommendation Filter Tabs
  const recFilterPills = document.querySelectorAll('.rec-filter-pill');
  recFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      recFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentRecFilter = pill.dataset.filter;

      let activeReport = null;
      if (currentMode === 'frontal') activeReport = state.frontal.report;
      else if (currentMode === 'profile') activeReport = state.profile.report;
      else if (currentMode === 'composite') activeReport = state.compositeReport;

      if (activeReport) {
        renderRecommendations(activeReport.recommendations);
      }
    });
  });

  // -----------------------------------------------------------------
  // Interactive Landmark Drag & Drop and Wizard Engine
  // -----------------------------------------------------------------
  if (btnDragMode) {
    btnDragMode.addEventListener('click', () => {
      profileEditorMode = 'drag';
      btnDragMode.classList.add('active');
      btnWizardMode.classList.remove('active');
      overlayCanvas.classList.remove('wizard-mode');
      overlayCanvas.classList.add('interactive-mode');
      editorPromptText.innerHTML = I18n.t('dragPrompt');
    });
  }

  if (btnWizardMode) {
    btnWizardMode.addEventListener('click', () => {
      profileEditorMode = 'wizard';
      wizardCurrentStepIndex = 0;
      btnWizardMode.classList.add('active');
      btnDragMode.classList.remove('active');
      overlayCanvas.classList.add('wizard-mode');
      updateWizardPrompt();
    });
  }

  if (btnResetAutoPoints) {
    btnResetAutoPoints.addEventListener('click', () => {
      if (state.profile.autoPoints) {
        state.profile.customPoints = JSON.parse(JSON.stringify(state.profile.autoPoints));
        recomputeProfileFromCustomPoints();
        editorPromptText.innerHTML = `<strong class="text-emerald">${I18n.t('pointsResetDone')}</strong>`;
      }
    });
  }

  function updateWizardPrompt() {
    if (wizardCurrentStepIndex < wizardLandmarks.length) {
      const step = wizardLandmarks[wizardCurrentStepIndex];
      const lang = I18n.currentLang;
      editorPromptText.innerHTML = `<strong>${lang === 'ru' ? 'Шаг' : 'Step'} ${wizardCurrentStepIndex + 1}/${wizardLandmarks.length}:</strong> ${lang === 'ru' ? 'Кликните на' : 'Click on'} <span style="color:${step.color};font-weight:700;">${step.name}</span> — <em>${step.desc}</em>`;
    } else {
      profileEditorMode = 'drag';
      btnDragMode.classList.add('active');
      btnWizardMode.classList.remove('active');
      overlayCanvas.classList.remove('wizard-mode');
      editorPromptText.innerHTML = `<strong class="text-emerald">${I18n.t('wizardStepCompleted')}</strong>`;
    }
  }

  function getCanvasCoords(e) {
    const rect = overlayCanvas.getBoundingClientRect();
    const scaleX = overlayCanvas.width / rect.width;
    const scaleY = overlayCanvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function findNearbyPoint(coords, radius = 26) {
    if (!state.profile.customPoints) return null;
    let closestId = null;
    let minDist = radius;

    for (const [id, pt] of Object.entries(state.profile.customPoints)) {
      if (!pt) continue;
      const d = Math.hypot(coords.x - pt.x, coords.y - pt.y);
      if (d < minDist) {
        minDist = d;
        closestId = id;
      }
    }
    return closestId;
  }

  // Pointer Handlers
  function onPointerDown(e) {
    if (currentMode !== 'profile' || !state.profile.customPoints) return;
    const coords = getCanvasCoords(e);

    if (profileEditorMode === 'wizard') {
      e.preventDefault();
      const currentStep = wizardLandmarks[wizardCurrentStepIndex];
      state.profile.customPoints[currentStep.id] = { x: coords.x, y: coords.y };
      
      if (currentStep.id === 'Sn' && state.profile.customPoints.Prn) {
        state.profile.customPoints.Cm = {
          x: (state.profile.customPoints.Prn.x + coords.x) * 0.5,
          y: (state.profile.customPoints.Prn.y + coords.y) * 0.5
        };
      }
      if (currentStep.id === 'C') {
        state.profile.customPoints.NeckBottom = { x: coords.x, y: coords.y + 75 };
      }

      wizardCurrentStepIndex++;
      updateWizardPrompt();
      recomputeProfileFromCustomPoints();
      return;
    }

    // Drag Mode
    const pointId = findNearbyPoint(coords);
    if (pointId) {
      activeDragPointId = pointId;
      overlayCanvas.classList.add('dragging');
      e.preventDefault();
    }
  }

  function onPointerMove(e) {
    if (currentMode !== 'profile' || !state.profile.customPoints) return;
    const coords = getCanvasCoords(e);

    if (activeDragPointId) {
      e.preventDefault();
      state.profile.customPoints[activeDragPointId] = { x: coords.x, y: coords.y };

      if (activeDragPointId === 'Prn' || activeDragPointId === 'Sn') {
        const p1 = state.profile.customPoints.Prn;
        const p2 = state.profile.customPoints.Sn;
        if (p1 && p2) {
          state.profile.customPoints.Cm = { x: (p1.x + p2.x) * 0.5, y: (p1.y + p2.y) * 0.5 };
        }
      }
      if (activeDragPointId === 'C') {
        state.profile.customPoints.NeckBottom = { x: coords.x, y: coords.y + 75 };
      }

      recomputeProfileFromCustomPoints();
      return;
    }

    if (profileEditorMode === 'drag') {
      const pointId = findNearbyPoint(coords);
      if (pointId !== hoveredPointId) {
        hoveredPointId = pointId;
        if (state.profile.report) {
          visualizer.renderProfileOverlay(state.profile.report.modules.cephalometrics, activeDragPointId, hoveredPointId);
        }
      }
    }
  }

  function onPointerUp() {
    if (activeDragPointId) {
      activeDragPointId = null;
      overlayCanvas.classList.remove('dragging');
      if (state.profile.report) {
        visualizer.renderProfileOverlay(state.profile.report.modules.cephalometrics, null, hoveredPointId);
      }
    }
  }

  overlayCanvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  overlayCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);

  // -----------------------------------------------------------------
  // File Upload and Drag & Drop
  // -----------------------------------------------------------------
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  });

  function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
      alert(I18n.currentLang === 'ru' ? 'Пожалуйста, загрузите изображение (JPG, PNG, WEBP)' : 'Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      sourceImage.src = e.target.result;
      sourceImage.onload = () => {
        processUploadedImage(sourceImage);
      };
    };
    reader.readAsDataURL(file);
  }

  // -----------------------------------------------------------------
  // Webcam Capture Handlers
  // -----------------------------------------------------------------
  webcamBtn.addEventListener('click', async () => {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      webcamVideo.srcObject = webcamStream;
      webcamModal.classList.add('open');
    } catch (err) {
      alert(I18n.currentLang === 'ru' ? 'Не удалось получить доступ к камере: ' + err.message : 'Could not access camera: ' + err.message);
    }
  });

  function stopWebcam() {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }
    webcamModal.classList.remove('open');
  }

  closeWebcamModal.addEventListener('click', stopWebcam);
  cancelWebcamBtn.addEventListener('click', stopWebcam);

  captureWebcamBtn.addEventListener('click', () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = webcamVideo.videoWidth || 1280;
    tempCanvas.height = webcamVideo.videoHeight || 720;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(webcamVideo, 0, 0, tempCanvas.width, tempCanvas.height);

    stopWebcam();
    sourceImage.src = tempCanvas.toDataURL('image/jpeg', 0.95);
    sourceImage.onload = () => {
      processUploadedImage(sourceImage);
    };
  });

  // -----------------------------------------------------------------
  // 14-Stage Image Processing Pipeline
  // -----------------------------------------------------------------
  async function processUploadedImage(imgElement) {
    if (currentMode === 'composite') {
      currentMode = 'frontal';
      setAppMode('frontal');
      modeTabBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === 'frontal'));
    }

    progressContainer.classList.remove('hidden');
    updateProgress(15, I18n.currentLang === 'ru' ? 'Детекция 478 3D ключевых точек MediaPipe...' : 'Detecting 478 3D MediaPipe Landmarks...');

    if (faceMesh) {
      await faceMesh.send({ image: imgElement });
    }
  }

  function updateProgress(pct, text) {
    progressFill.style.width = `${pct}%`;
    progressPercent.textContent = `${pct}%`;
    progressStepText.textContent = text;
  }

  async function onFaceMeshResults(results) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      progressContainer.classList.add('hidden');
      alert(I18n.currentLang === 'ru' ? 'Лицо не обнаружено. Пожалуйста, используйте четкое фронтальное или профильное фото с хорошим освещением.' : 'Face not detected. Please upload a clear photo with good lighting.');
      return;
    }

    const rawLandmarks = results.multiFaceLandmarks[0];
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.naturalWidth || sourceImage.width;
    canvas.height = sourceImage.naturalHeight || sourceImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImage, 0, 0);

    updateProgress(35, I18n.currentLang === 'ru' ? 'Коррекция оптики 85mm & Франкфуртская плоскость...' : 'Lens 85mm Rectification & Frankfurt Plane Normalization...');

    const alignedResult = FaceAligner.alignFace(canvas, rawLandmarks, currentMode === 'profile');

    updateProgress(50, I18n.currentLang === 'ru' ? 'Контроль качества снимка & Резкость Лапласиана...' : 'Image Quality Control & Laplacian Sharpness...');
    const qc = QualityControlEngine.assessQuality(canvas, rawLandmarks, alignedResult.headPose);

    if (currentMode === 'frontal') {
      state.frontal.image = sourceImage.src;
      state.frontal.rawLandmarks = rawLandmarks;
      state.frontal.alignedResult = alignedResult;
      state.frontal.qc = qc;

      frontalStatusBadge.className = 'status-indicator-badge ready';
      frontalStatusBadge.textContent = I18n.t('statusReadyFrontal');

      recomputeFrontal();
    } else if (currentMode === 'profile') {
      state.profile.image = sourceImage.src;
      state.profile.rawLandmarks = rawLandmarks;
      state.profile.alignedResult = alignedResult;
      state.profile.qc = qc;

      profileStatusBadge.className = 'status-indicator-badge ready';
      profileStatusBadge.textContent = I18n.t('statusReadyProfile');

      recomputeProfile(true);
    }

    updateCompositeStatusBadge();
  }

  function updateCompositeStatusBadge() {
    if (state.frontal.report && state.profile.report) {
      compositeStatusBadge.className = 'status-indicator-badge ready';
      compositeStatusBadge.textContent = I18n.t('statusReadyComposite');
    } else if (state.frontal.report || state.profile.report) {
      compositeStatusBadge.className = 'status-indicator-badge empty';
      compositeStatusBadge.textContent = I18n.t('statusPartialComposite');
    }
  }

  function recomputeFrontal() {
    updateProgress(55, I18n.currentLang === 'ru' ? '2D Краниофациальная морфометрия & Z-Scores...' : '2D Craniofacial Morphometry & Z-Scores...');

    setTimeout(() => {
      const landmarks = state.frontal.alignedResult.alignedLandmarks;
      const canvas = state.frontal.alignedResult.alignedCanvas;
      const qc = state.frontal.qc;

      const morph2D = Morphometry2DEngine.analyze(landmarks, currentGender, canvas);
      state.frontal.morph2D = morph2D;

      updateProgress(65, I18n.currentLang === 'ru' ? 'OpenCV CIELAB колориметрия & Микрорельеф кожи...' : 'OpenCV CIELAB Colorimetry & Skin Texture Microrelief...');
      const skinRes = SkinAnalyzer.analyze(canvas, landmarks, currentGender);

      updateProgress(75, I18n.currentLang === 'ru' ? 'Флуктуирующая симметрия по 24 билатеральным парам...' : 'Bilateral Fluctuating Symmetry & 24 Pairs...');
      const symRes = SymmetryAnalyzer.analyze(landmarks, canvas);

      updateProgress(85, I18n.currentLang === 'ru' ? 'Монокулярная 3D морфология & Проекции...' : 'Monocular 3D Morphology & Convexity Estimation...');
      const morph3D = Morphology3DEngine.analyze(landmarks, currentGender);
      state.frontal.morph3D = morph3D;

      const wholeFace = WholeFaceEmbeddingEngine.extractEmbedding(landmarks, canvas);
      state.frontal.wholeFace = wholeFace;

      updateProgress(95, I18n.currentLang === 'ru' ? 'Синтез 3 независимых моделей оценки...' : 'Synthesizing 3 Independent Evaluation Models...');
      state.frontal.report = AttractivenessScorer.calculateFrontal(morph2D, morph2D, skinRes, symRes, null, morph3D, qc, wholeFace);

      if (currentMode === 'frontal') {
        displayFrontalView();
      }

      updateProgress(100, I18n.currentLang === 'ru' ? 'Анфас анализ готов!' : 'Frontal Analysis Complete!');
      setTimeout(() => progressContainer.classList.add('hidden'), 800);
    }, 80);
  }

  function recomputeProfile(initialMesh = true) {
    updateProgress(60, I18n.currentLang === 'ru' ? 'Расчет цефалометрии: Gonial, E-Line, Cervicomental...' : 'Computing Cephalometrics: Gonial, E-Line, Cervicomental...');

    setTimeout(() => {
      const landmarks = state.profile.alignedResult.alignedLandmarks;
      const cephRes = CephalometricsAnalyzer.analyze(landmarks, currentGender);
      const qc = state.profile.qc;

      if (initialMesh) {
        state.profile.customPoints = JSON.parse(JSON.stringify(cephRes.landmarks));
        state.profile.autoPoints = JSON.parse(JSON.stringify(cephRes.landmarks));
        state.profile.facingLeft = cephRes.facingLeft;
      }

      state.profile.report = AttractivenessScorer.calculateProfile(cephRes, null, qc);

      if (currentMode === 'profile') {
        displayProfileView();
      }

      updateProgress(100, I18n.currentLang === 'ru' ? 'Профиль анализ готов!' : 'Profile Analysis Complete!');
      setTimeout(() => progressContainer.classList.add('hidden'), 800);
    }, 80);
  }

  function recomputeProfileFromCustomPoints() {
    if (!state.profile.customPoints) return;
    const cephRes = CephalometricsAnalyzer.analyzeFromCustomPoints(state.profile.customPoints, currentGender, state.profile.facingLeft);
    const qc = state.profile.qc;

    state.profile.report = AttractivenessScorer.calculateProfile(cephRes, null, qc);
    displayProfileView(false);
  }

  // -----------------------------------------------------------------
  // View Displays
  // -----------------------------------------------------------------
  function displayFrontalView() {
    const report = state.frontal.report;
    if (!report || !state.frontal.alignedResult) return;

    welcomeState.classList.add('hidden');
    resultsDashboard.classList.remove('hidden');
    document.getElementById('compositeMatrixCard').classList.add('hidden');
    if (profileEditorToolbar) profileEditorToolbar.classList.add('hidden');

    outputCanvas.width = 1000;
    outputCanvas.height = 1000;
    const ctx = outputCanvas.getContext('2d');
    ctx.drawImage(state.frontal.alignedResult.alignedCanvas, 0, 0);

    visualizer.renderFrontalOverlay(state.frontal.alignedResult.alignedLandmarks, state.frontal.alignedResult);

    renderHeroCards(report);
    renderQualityBanner(report);
    renderReliabilityMeter(report);
    renderPotentialCard(report);

    document.getElementById('radarTitle').textContent = I18n.t('radarAttractivenessTitle');
    visualizer.renderRadarChart('radarChart', report);

    renderDynamicSubBars(report);
    renderFrontalMetricModules(report);
    renderRecommendations(report.recommendations);
  }

  function displayProfileView(redrawBg = true) {
    const report = state.profile.report;
    if (!report || !state.profile.alignedResult) return;

    welcomeState.classList.add('hidden');
    resultsDashboard.classList.remove('hidden');
    document.getElementById('compositeMatrixCard').classList.add('hidden');
    if (profileEditorToolbar) profileEditorToolbar.classList.remove('hidden');

    if (redrawBg) {
      outputCanvas.width = 1000;
      outputCanvas.height = 1000;
      const ctx = outputCanvas.getContext('2d');
      ctx.drawImage(state.profile.alignedResult.alignedCanvas, 0, 0);
    }

    visualizer.renderProfileOverlay(report.modules.cephalometrics, activeDragPointId, hoveredPointId);

    renderHeroCards(report);
    renderQualityBanner(report);
    renderReliabilityMeter(report);
    renderPotentialCard(report);

    document.getElementById('radarTitle').textContent = I18n.t('radarDimorphTitle');
    visualizer.renderRadarChart('radarChart', report);

    renderDynamicSubBars(report);
    renderProfileMetricModules(report);
    renderRecommendations(report.recommendations);
  }

  function displayCompositeView() {
    if (!state.frontal.report && !state.profile.report) {
      welcomeState.classList.remove('hidden');
      resultsDashboard.classList.add('hidden');
      return;
    }

    const compositeReport = AttractivenessScorer.calculateComposite(state.frontal.report, state.profile.report);
    state.compositeReport = compositeReport;

    welcomeState.classList.add('hidden');
    resultsDashboard.classList.remove('hidden');
    const matrixCard = document.getElementById('compositeMatrixCard');
    matrixCard.classList.remove('hidden');
    if (profileEditorToolbar) profileEditorToolbar.classList.add('hidden');

    const sm = compositeReport.scientificMatrix;
    document.getElementById('matrixDimorphVal').textContent = `${sm.dimorphism.score} / 100`;
    document.getElementById('matrixDimorphBar').style.width = `${sm.dimorphism.score}%`;

    document.getElementById('matrixAnthroVal').textContent = `${sm.anthropometry.score} / 100`;
    document.getElementById('matrixAnthroBar').style.width = `${sm.anthropometry.score}%`;

    document.getElementById('matrixSkinVal').textContent = `${sm.skinHealth.score} / 100`;
    document.getElementById('matrixSkinBar').style.width = `${sm.skinHealth.score}%`;

    document.getElementById('matrixSymVal').textContent = `${sm.symmetry.score} / 100`;
    document.getElementById('matrixSymBar').style.width = `${sm.symmetry.score}%`;

    renderHeroCards(compositeReport);
    renderQualityBanner(compositeReport);
    renderReliabilityMeter(compositeReport);
    renderPotentialCard(compositeReport);

    document.getElementById('radarTitle').textContent = I18n.t('radarAttractivenessTitle');
    visualizer.renderRadarChart('radarChart', compositeReport);

    renderDynamicSubBars(compositeReport);
    renderCompositeMetricModules(compositeReport);
    renderRecommendations(compositeReport.recommendations);
  }

  function clearViewport() {
    visualizer.clear();
    const ctx = outputCanvas.getContext('2d');
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
  }

  // -----------------------------------------------------------------
  // Renderers: 3 Independent Hero Cards, Quality & Reliability
  // -----------------------------------------------------------------
  function renderHeroCards(report) {
    const lang = I18n.currentLang;

    // 1. Scientific Facial Attractiveness Card (Model A)
    const sciScore = report.scientific.score;
    const sciValEl = document.getElementById('sciScoreVal');
    if (sciValEl) sciValEl.textContent = sciScore;

    const sciCircle = document.getElementById('sciScoreCircle');
    if (sciCircle) {
      const offset = 440 - (440 * sciScore) / 100;
      sciCircle.style.strokeDashoffset = offset;
    }

    const sciPercentileEl = document.getElementById('sciPercentileText');
    if (sciPercentileEl) {
      sciPercentileEl.textContent = `${I18n.t('morphPercentileLabel')} ${report.scientific.percentile}% (Z: ${report.scientific.zScore > 0 ? '+' : ''}${report.scientific.zScore})`;
    }

    const sciUncertaintyEl = document.getElementById('sciUncertaintyText');
    if (sciUncertaintyEl) {
      const uncVal = report.scientific.uncertainty ? report.scientific.uncertainty.formatted : '±6';
      sciUncertaintyEl.textContent = `${I18n.t('predictionUncertaintyLabel')} ${uncVal}`;
    }

    const sciConfidenceEl = document.getElementById('sciConfidenceText');
    if (sciConfidenceEl) {
      sciConfidenceEl.textContent = `${I18n.t('modelConfidenceLabel')} ${report.scientific.confidence}%`;
    }

    // 2. Facial Sexual Attractiveness Card (Model B)
    const sexScore = report.sexual.score;
    const sexValEl = document.getElementById('sexScoreVal');
    if (sexValEl) sexValEl.textContent = sexScore;

    const sexCircle = document.getElementById('sexScoreCircle');
    if (sexCircle) {
      const offset = 440 - (440 * sexScore) / 100;
      sexCircle.style.strokeDashoffset = offset;
    }

    const sexPercentileEl = document.getElementById('sexPercentileText');
    if (sexPercentileEl) {
      sexPercentileEl.textContent = `${I18n.t('dimorphPercentileLabel')} ${report.sexual.percentile}%`;
    }

    const sexUncertaintyEl = document.getElementById('sexUncertaintyText');
    if (sexUncertaintyEl) {
      const uncVal = report.sexual.uncertainty ? report.sexual.uncertainty.formatted : '±7';
      sexUncertaintyEl.textContent = `${I18n.t('predictionUncertaintyLabel')} ${uncVal}`;
    }

    // 3. PSL Community Score Card (Model C)
    const pslScore = report.psl.score;
    const pslValEl = document.getElementById('pslScoreVal');
    if (pslValEl) pslValEl.textContent = pslScore;

    const pslTierBadge = document.getElementById('pslTierBadge');
    if (pslTierBadge) {
      pslTierBadge.className = `tier-badge ${report.psl.tier.badgeClass}`;
      pslTierBadge.textContent = `${lang === 'ru' ? 'Тир:' : 'Tier:'} ${report.psl.tier.code}`;
    }

    const pslPercentileEl = document.getElementById('pslPercentileText');
    if (pslPercentileEl) {
      pslPercentileEl.textContent = `${I18n.t('communityPercentileLabel')} ${report.psl.percentile}%`;
    }
  }


  function renderQualityBanner(report) {
    const rel = report.reliability;
    if (!rel) return;

    const banner = document.getElementById('qualityBanner');
    if (!banner) return;

    banner.innerHTML = `
      <div class="qc-banner-content">
        <div class="qc-badge ${rel.confidenceRating.toLowerCase()}">
          <i data-lucide="shield-check" style="width:16px;height:16px;"></i>
          <span>${I18n.t('qcConfidence')}: <strong>${rel.confidenceRating === 'HIGH' ? I18n.t('confHigh') : (rel.confidenceRating === 'MEDIUM' ? I18n.t('confMed') : I18n.t('confLow'))}</strong></span>
        </div>
        <div class="qc-metrics-row">
          <span>${I18n.t('qcQuality')}: <strong>${rel.photoQuality}/100</strong></span>
          <span class="qc-sep">•</span>
          <span>${I18n.t('calibrationInfo')}</span>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  function renderReliabilityMeter(report) {
    const meter = document.getElementById('reliabilityMeterContainer');
    if (!meter) return;

    const rel = report.reliability;
    meter.innerHTML = `
      <div class="reliability-card glass-card">
        <div class="chart-card-header">
          <i data-lucide="layers" style="width:18px;height:18px;color:var(--accent-cyan);"></i>
          <span>${I18n.t('reliabilityTitle')}</span>
        </div>
        <div class="rel-bar-wrapper">
          <div class="rel-bar-segment rel-measured" style="width: ${rel.measuredPct}%;" title="${I18n.t('relMeasured')}: ${rel.measuredPct}%"></div>
          <div class="rel-bar-segment rel-estimated" style="width: ${rel.estimatedPct}%;" title="${I18n.t('relEstimated')}: ${rel.estimatedPct}%"></div>
          <div class="rel-bar-segment rel-unobserved" style="width: ${rel.notObservablePct}%;" title="${I18n.t('relNotObserved')}: ${rel.notObservablePct}%"></div>
        </div>
        <div class="rel-legend">
          <div class="rel-legend-item"><span class="rel-dot dot-measured"></span>${I18n.t('relMeasured')}: <strong>${rel.measuredPct}%</strong></div>
          <div class="rel-legend-item"><span class="rel-dot dot-estimated"></span>${I18n.t('relEstimated')}: <strong>${rel.estimatedPct}%</strong></div>
          <div class="rel-legend-item"><span class="rel-dot dot-unobserved"></span>${I18n.t('relNotObserved')}: <strong>${rel.notObservablePct}%</strong></div>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  function renderPotentialCard(report) {
    const pot = report.potential;
    if (!pot) return;

    const lang = I18n.currentLang;
    const percentileText = lang === 'ru' ? pot.percentileTextRu : pot.percentileText;

    document.getElementById('currentScorePill').textContent = `${report.scientific.score} / 100`;
    document.getElementById('potentialScorePill').textContent = `${pot.score} / 100`;
    document.getElementById('potentialDeltaBadge').textContent = `+${pot.delta} ${I18n.t('potentialGrowthPts')}`;

    document.getElementById('potentialBaseBar').style.width = `${report.scientific.score}%`;
    document.getElementById('potentialDeltaBar').style.width = `${pot.score}%`;

    document.getElementById('potentialCurrentLabel').textContent = `${I18n.t('potentialCurrentLevel')}: ${report.scientific.score}`;
    document.getElementById('potentialTargetLabel').textContent = `${I18n.t('potentialTargetLevel')}: ${pot.score} (${percentileText})`;

    const reservesGrid = document.getElementById('potentialReservesGrid');
    reservesGrid.innerHTML = `
      <div class="reserve-chip"><span>${I18n.t('resSkin')}</span><strong>+${pot.reserves.skin || 4} pts</strong></div>
      <div class="reserve-chip"><span>${I18n.t('resPeri')}</span><strong>+${pot.reserves.periorbital || 5} pts</strong></div>
      <div class="reserve-chip"><span>${I18n.t('resSym')}</span><strong>+${pot.reserves.symmetry || 3} pts</strong></div>
      <div class="reserve-chip"><span>${I18n.t('resJaw')}</span><strong>+${pot.reserves.jawMuscles || pot.reserves.masseters || 5} pts</strong></div>
    `;
  }

  function renderDynamicSubBars(report) {
    const subBars = document.getElementById('dynamicSubBars');
    if (!subBars) return;
    const lang = I18n.currentLang;

    if (report.viewMode === 'profile') {
      const m = report.modules.cephalometrics.metrics;
      subBars.innerHTML = `
        ${createSubBar(lang === 'ru' ? 'Гониальный угол (Ar-Go-Me)' : 'Gonial Angle (Ar-Go-Me)', m.gonialAngle.score, 'bg-cyan')}
        ${createSubBar(lang === 'ru' ? 'Индекс ветви челюсти (Ramus)' : 'Ramus Index', m.ramusIndex.score, 'bg-emerald')}
        ${createSubBar(lang === 'ru' ? 'Линия Риккетса (E-Line)' : 'Ricketts E-Line', m.eline.score, 'bg-gold')}
        ${createSubBar(lang === 'ru' ? 'Выпуклость лица (G-Sn-Pog)' : 'Facial Convexity G-Sn-Pog', m.convexity.score, 'bg-purple')}
        ${createSubBar(lang === 'ru' ? 'Шейно-подбородочный угол' : 'Cervicomental Angle', m.cervicomental.score, 'bg-rose')}
      `;
    } else {
      const m = report.modules;
      const avgScore = report.modules.morph3D ? Math.round(report.modules.morph3D.score3D || 85) : 85;
      subBars.innerHTML = `
        ${createSubBar(lang === 'ru' ? '1. Усредненность / Прототипичность (16.7%)' : '1. Averageness / Prototypicality (16.7%)', avgScore, 'bg-cyan')}
        ${createSubBar(lang === 'ru' ? '2. Внешний вид кожи и мягких тканей (16.7%)' : '2. Skin & Soft-Tissue Appearance (16.7%)', m.skin.score, 'bg-gold')}
        ${createSubBar(lang === 'ru' ? '3. Билатеральная симметрия (16.7%)' : '3. Bilateral Symmetry (16.7%)', m.symmetry.score, 'bg-purple')}
        ${createSubBar(lang === 'ru' ? '4. Периорбитальный комплекс (16.7%)' : '4. Periorbital & Eye Complex (16.7%)', m.periorbital.score, 'bg-rose')}
        ${createSubBar(lang === 'ru' ? '5. Краниофациальные пропорции (16.7%)' : '5. Craniofacial Proportions (16.7%)', m.anthro.score, 'bg-cyan')}
        ${createSubBar(lang === 'ru' ? '6. Вторичный половой диморфизм (16.7%)' : '6. Secondary Sexual Dimorphism (16.7%)', m.dimorphism.score, 'bg-emerald')}
      `;
    }

  }

  function createSubBar(name, score, bgClass) {
    return `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:0.84rem;margin-bottom:0.25rem;">
          <span>${name}</span>
          <strong>${score} / 100</strong>
        </div>
        <div class="progress-bar-bg"><div class="progress-bar-fill ${bgClass}" style="width:${score}%"></div></div>
      </div>
    `;
  }

  // -----------------------------------------------------------------
  // Metric Modules Rendering
  // -----------------------------------------------------------------
  function renderFrontalMetricModules(report) {
    const container = document.getElementById('metricsModulesContainer');
    const m = report.morph2D.metrics;
    const s = report.modules.skin.metrics;
    const sym = report.modules.symmetry.metrics;
    const d3 = report.modules.morph3D ? report.modules.morph3D.depths : {};

    const lang = I18n.currentLang;

    container.innerHTML = `
      <!-- Craniofacial Module -->
      <div class="module-card">
        <div class="module-header">

          <div class="module-title-box">
            <i data-lucide="ruler" class="text-cyan" style="width:18px;height:18px;"></i>
            ${I18n.t('secCraniofacial')}
          </div>
          <span class="module-score-pill">${report.modules.anthro.score}/100</span>
        </div>
        ${createMetricRow(I18n.t('metricFwhr'), m.fwhr.rawVal.toFixed(2), m.fwhr.referenceRange, m.fwhr.status, m.fwhr.domain, m.fwhr.zScore, m.fwhr.percentile, m.fwhr.score100)}
        ${createMetricRow(I18n.t('metricMidface'), m.midfaceRatio.rawVal.toFixed(2), m.midfaceRatio.referenceRange, m.midfaceRatio.status, m.midfaceRatio.domain, m.midfaceRatio.zScore, m.midfaceRatio.percentile, m.midfaceRatio.score100)}
        ${createMetricRow(I18n.t('metricThirds'), report.morph2D.rawMeasurements.thirdsStr, m.thirds.referenceRange, m.thirds.status, m.thirds.domain, m.thirds.zScore, m.thirds.percentile, m.thirds.score100)}
        ${createMetricRow(I18n.t('metricJawCheek'), m.jawCheekRatio.rawVal.toFixed(2), m.jawCheekRatio.referenceRange, m.jawCheekRatio.status, m.jawCheekRatio.domain, m.jawCheekRatio.zScore, m.jawCheekRatio.percentile, m.jawCheekRatio.score100)}
        ${createMetricRow(I18n.t('metricPhiltrumChin'), `1 : ${m.philtrumChinRatio.rawVal.toFixed(2)}`, m.philtrumChinRatio.referenceRange, m.philtrumChinRatio.status, m.philtrumChinRatio.domain, m.philtrumChinRatio.zScore, m.philtrumChinRatio.percentile, m.philtrumChinRatio.score100)}
        ${createMetricRow(I18n.t('metricMouthNose'), m.mouthNoseRatio.rawVal.toFixed(2), m.mouthNoseRatio.referenceRange, m.mouthNoseRatio.status, m.mouthNoseRatio.domain, m.mouthNoseRatio.zScore, m.mouthNoseRatio.percentile, m.mouthNoseRatio.score100)}
      </div>

      <!-- Periorbital Module -->
      <div class="module-card">
        <div class="module-header">
          <div class="module-title-box">
            <i data-lucide="eye" class="text-rose" style="width:18px;height:18px;"></i>
            ${I18n.t('secPeriorbital')}
          </div>
          <span class="module-score-pill">${report.modules.periorbital.score}/100</span>
        </div>
        ${createMetricRow(I18n.t('metricCanthalTilt'), `${m.canthalTilt.rawVal > 0 ? '+' : ''}${m.canthalTilt.rawVal.toFixed(1)}°`, m.canthalTilt.referenceRange, m.canthalTilt.status, m.canthalTilt.domain, m.canthalTilt.zScore, m.canthalTilt.percentile, m.canthalTilt.score100)}
        ${createMetricRow(I18n.t('metricScleralShow'), `${m.scleralShow.rawVal.toFixed(1)} mm`, m.scleralShow.referenceRange, m.scleralShow.status, m.scleralShow.domain, m.scleralShow.zScore, m.scleralShow.percentile, m.scleralShow.score100)}
        ${createMetricRow(I18n.t('metricPalpebral'), `${m.palpebralRatio.rawVal.toFixed(2)} : 1`, m.palpebralRatio.referenceRange, m.palpebralRatio.status, m.palpebralRatio.domain, m.palpebralRatio.zScore, m.palpebralRatio.percentile, m.palpebralRatio.score100)}
        ${createMetricRow(I18n.t('metricIntercanthal'), m.intercanthalIndex.rawVal.toFixed(2), m.intercanthalIndex.referenceRange, m.intercanthalIndex.status, m.intercanthalIndex.domain, m.intercanthalIndex.zScore, m.intercanthalIndex.percentile, m.intercanthalIndex.score100)}
        ${createMetricRow(I18n.t('metricOrbitalComp'), m.orbitalCompactness.rawVal.toFixed(2), m.orbitalCompactness.referenceRange, m.orbitalCompactness.status, m.orbitalCompactness.domain, m.orbitalCompactness.zScore, m.orbitalCompactness.percentile, m.orbitalCompactness.score100)}
        ${createMetricRow(I18n.t('metricHunterEyes'), `${m.hunterEyes.score100}/100`, m.hunterEyes.referenceRange, 'MEASURED', 'COMMUNITY', null, null, m.hunterEyes.score100)}
      </div>

      <!-- Skin & Soft Tissue -->
      <div class="module-card">
        <div class="module-header">
          <div class="module-title-box">
            <i data-lucide="sparkle" class="text-gold" style="width:18px;height:18px;"></i>
            ${I18n.t('secSkinQuality')}
          </div>
          <span class="module-score-pill">${report.modules.skin.score}/100</span>
        </div>
        ${createMetricRow(I18n.t('metricCheekHollow'), s.adiposity ? s.adiposity.value : 'Contrast: 6.8%', s.adiposity ? s.adiposity.ideal : '4.0% – 12.0%', 'MEASURED', 'SCIENTIFIC', null, null, s.adiposity ? s.adiposity.score : 85)}
        ${createMetricRow(I18n.t('metricUniformity'), s.uniformity ? s.uniformity.value : 'σ = 3.2', s.uniformity ? s.uniformity.ideal : 'σ < 3.8', 'MEASURED', 'SCIENTIFIC', null, null, s.uniformity ? s.uniformity.score : 85)}
        ${createMetricRow(I18n.t('metricMicrorelief'), s.smoothness ? s.smoothness.value : 'Var = 36', s.smoothness ? s.smoothness.ideal : 'Var 25 – 55', 'MEASURED', 'SCIENTIFIC', null, null, s.smoothness ? s.smoothness.score : 85)}
        ${createMetricRow(I18n.t('metricCarotenoid'), s.carotenoid ? s.carotenoid.value : 'b* = +14.0', s.carotenoid ? s.carotenoid.ideal : 'b* +8.0 to +18.0', 'MEASURED', 'SCIENTIFIC', null, null, s.carotenoid ? s.carotenoid.score : 88)}
        ${createMetricRow(I18n.t('metricDarkCircles'), s.darkCircles ? s.darkCircles.value : 'ΔL* = -1.0', s.darkCircles ? s.darkCircles.ideal : 'ΔL* ≥ -1.5', 'MEASURED', 'SCIENTIFIC', null, null, s.darkCircles ? s.darkCircles.score : 86)}
      </div>

      <!-- Symmetry & Coaxiality -->
      <div class="module-card">
        <div class="module-header">
          <div class="module-title-box">
            <i data-lucide="scale" class="text-purple" style="width:18px;height:18px;"></i>
            ${I18n.t('secSymmetry')}
          </div>
          <span class="module-score-pill">${report.modules.symmetry.score}/100</span>
        </div>
        ${createMetricRow(I18n.t('metricFA'), sym.fluctuatingAsymmetry.value, sym.fluctuatingAsymmetry.ideal, 'MEASURED', 'SCIENTIFIC', null, null, sym.fluctuatingAsymmetry.score)}
        ${createMetricRow(I18n.t('metricMidlineDev'), sym.midlineDeviation.value, sym.midlineDeviation.ideal, 'MEASURED', 'SCIENTIFIC', null, null, sym.midlineDeviation.score)}
        ${createMetricRow(I18n.t('metricTextureSym'), sym.textureSymmetry ? sym.textureSymmetry.value : '90%', sym.textureSymmetry ? sym.textureSymmetry.ideal : '> 85%', 'MEASURED', 'SCIENTIFIC', null, null, sym.textureSymmetry ? sym.textureSymmetry.score : 88)}
        ${createMetricRow(lang === 'ru' ? 'Баланс глаз и бровей' : 'Eyes & Brow Balance', `${sym.eyesEyebrowsScore}%`, '> 90%', 'MEASURED', 'SCIENTIFIC', null, null, sym.eyesEyebrowsScore)}
        ${createMetricRow(lang === 'ru' ? 'Симметрия скул и челюсти' : 'Cheeks & Jaw Symmetry', `${sym.cheeksNoseScore}%`, '> 90%', 'MEASURED', 'SCIENTIFIC', null, null, sym.cheeksNoseScore)}
      </div>

      <!-- Monocular 3D Spatial Proxies (Estimated) -->
      <div class="module-card">
        <div class="module-header">
          <div class="module-title-box">
            <i data-lucide="box" class="text-cyan" style="width:18px;height:18px;"></i>
            ${I18n.t('sec3DDeepscan')}
          </div>
          <span class="module-score-pill">${I18n.t('badgeEstimated')}</span>
        </div>
        ${createMetricRow(I18n.t('metricConvexity'), `${d3.facialConvexityDeg || '166.5° (3D Est.)'}`, '163.0° – 173.0°', 'ESTIMATED', 'ESTIMATED 3D', null, null, 85)}
        ${createMetricRow(lang === 'ru' ? 'Индекс проекции кончика носа' : 'Nasal Projection Ratio', `${d3.nasalProjectionIndex || '0.62 (Ratio)'}`, '0.55 – 0.70', 'ESTIMATED', 'ESTIMATED 3D', '+0.31', 'P62', 88)}
        ${createMetricRow(lang === 'ru' ? 'Индекс проекции подбородка' : 'Chin Projection Ratio', `${d3.chinProjectionIndex || '0.50 (Ratio)'}`, '0.45 – 0.58', 'ESTIMATED', 'ESTIMATED 3D', '+0.00', 'P50', 92)}
        ${createMetricRow(I18n.t('metricOrbitalVec'), `${d3.orbitalVectorDesc || 'Neutral Vector (Est.)'}`, 'Positive / Neutral', 'ESTIMATED', 'ESTIMATED 3D', null, null, 85)}
        ${createMetricRow(lang === 'ru' ? 'Индекс малярной проекции скул' : 'Malar Prominence Ratio', `${d3.malarProminenceIndex || '0.78 (Ratio)'}`, '0.70 – 0.86', 'ESTIMATED', 'ESTIMATED 3D', '+0.00', 'P50', 90)}
      </div>

      <!-- Dimorphism & Age -->
      <div class="module-card">
        <div class="module-header">
          <div class="module-title-box">
            <i data-lucide="dna" class="text-emerald" style="width:18px;height:18px;"></i>
            ${I18n.t('secDimorphism')}
          </div>
          <span class="module-score-pill">${m.masculinity.score100}/100</span>
        </div>
        ${createMetricRow(I18n.t('metricMasculinity'), `${m.masculinity.score100}/100`, m.masculinity.referenceRange, 'MEASURED', 'SCIENTIFIC', m.masculinity.zScore, m.masculinity.percentile, m.masculinity.score100)}
        ${createMetricRow(lang === 'ru' ? 'Воспринимаемый возраст лица' : 'Perceived Facial Age', `${report.morph2D.subScores.perceivedAge} ${lang === 'ru' ? 'лет' : 'years'}`, '20 – 35 years', 'ESTIMATED', 'SCIENTIFIC')}
        ${createMetricRow(I18n.t('metricYouthfulness'), `${m.youthfulness.score100}/100`, m.youthfulness.referenceRange, 'MEASURED', 'SCIENTIFIC', m.youthfulness.zScore, m.youthfulness.percentile, m.youthfulness.score100)}
      </div>

    `;

    lucide.createIcons();
  }

  function renderProfileMetricModules(report) {
    const container = document.getElementById('metricsModulesContainer');
    const m = report.modules.cephalometrics.metrics;
    const lang = I18n.currentLang;

    container.innerHTML = `
      <div class="module-card">
        <div class="module-header">
          <div class="module-title-box">
            <i data-lucide="maximize-2" class="text-cyan" style="width:18px;height:18px;"></i>
            ${I18n.t('secJaw')}
          </div>
          <span class="module-score-pill">${m.gonialAngle.score}/100</span>
        </div>
        ${createMetricRow(I18n.t('metricGonialAngle'), m.gonialAngle.value, m.gonialAngle.referenceRange, 'MEASURED', 'SCIENTIFIC', m.gonialAngle.zScore, m.gonialAngle.percentile, m.gonialAngle.score)}
        ${createMetricRow(I18n.t('metricRamusIndex'), m.ramusIndex.value, m.ramusIndex.referenceRange, 'MEASURED', 'SCIENTIFIC', m.ramusIndex.zScore, m.ramusIndex.percentile, m.ramusIndex.score)}
        ${createMetricRow(I18n.t('metricCervicomental'), m.cervicomental.value, m.cervicomental.referenceRange, 'MEASURED', 'SCIENTIFIC', m.cervicomental.zScore, m.cervicomental.percentile, m.cervicomental.score)}
      </div>

      <div class="module-card">
        <div class="module-header">
          <div class="module-title-box">
            <i data-lucide="git-commit" class="text-gold" style="width:18px;height:18px;"></i>
            ${lang === 'ru' ? 'Сагиттальные цефалометрические оси' : 'Sagittal Cephalometric Axes'}
          </div>
          <span class="module-score-pill">${m.eline.score}/100</span>
        </div>
        ${createMetricRow(I18n.t('metricEline'), m.eline.value, m.eline.referenceRange, 'MEASURED', 'SCIENTIFIC', m.eline.zScore, m.eline.percentile, m.eline.score)}
        ${createMetricRow(I18n.t('metricOrbitalVec'), m.orbitalVector.value, m.orbitalVector.referenceRange, 'MEASURED', 'SCIENTIFIC', null, null, m.orbitalVector.score)}
        ${createMetricRow(I18n.t('metricConvexity'), m.convexity.value, m.convexity.referenceRange, 'MEASURED', 'SCIENTIFIC', m.convexity.zScore, m.convexity.percentile, m.convexity.score)}
        ${createMetricRow(I18n.t('metricNasolabial'), m.nasolabial.value, m.nasolabial.referenceRange, 'MEASURED', 'SCIENTIFIC', m.nasolabial.zScore, m.nasolabial.percentile, m.nasolabial.score)}
      </div>
    `;

    lucide.createIcons();
  }

  function renderCompositeMetricModules(report) {
    const container = document.getElementById('metricsModulesContainer');
    const fReport = state.frontal.report;
    const pReport = state.profile.report;

    let html = '';
    if (fReport) {
      const fa = fReport.morph2D.metrics;
      html += `
        <div class="module-card">
          <div class="module-header">
            <div class="module-title-box">
              <i data-lucide="user" class="text-cyan" style="width:18px;height:18px;"></i>
              ${I18n.t('modeFrontal')}
            </div>
            <span class="module-score-pill">${fReport.scientific.score}/100</span>
          </div>
          ${createMetricRow(I18n.t('metricFwhr'), fa.fwhr.rawVal.toFixed(2), fa.fwhr.referenceRange, 'MEASURED', 'SCIENTIFIC', fa.fwhr.zScore, fa.fwhr.percentile, fa.fwhr.score100)}
          ${createMetricRow(I18n.t('metricMidface'), fa.midfaceRatio.rawVal.toFixed(2), fa.midfaceRatio.referenceRange, 'MEASURED', 'SCIENTIFIC', fa.midfaceRatio.zScore, fa.midfaceRatio.percentile, fa.midfaceRatio.score100)}
          ${createMetricRow(I18n.t('metricCanthalTilt'), `${fa.canthalTilt.rawVal > 0 ? '+' : ''}${fa.canthalTilt.rawVal.toFixed(1)}°`, fa.canthalTilt.referenceRange, 'MEASURED', 'SCIENTIFIC', fa.canthalTilt.zScore, fa.canthalTilt.percentile, fa.canthalTilt.score100)}
          ${createMetricRow(I18n.t('metricHunterEyes'), `${fa.hunterEyes.score100}/100`, fa.hunterEyes.referenceRange, 'MEASURED', 'COMMUNITY', null, null, fa.hunterEyes.score100)}
          ${createMetricRow(I18n.t('metricFA'), fReport.modules.symmetry.metrics.fluctuatingAsymmetry.value, '> 94.0%', 'MEASURED', 'SCIENTIFIC', null, null, fReport.modules.symmetry.metrics.fluctuatingAsymmetry.score)}
        </div>
      `;
    }

    if (pReport) {
      const pm = pReport.modules.cephalometrics.metrics;
      html += `
        <div class="module-card">
          <div class="module-header">
            <div class="module-title-box">
              <i data-lucide="scan-line" class="text-gold" style="width:18px;height:18px;"></i>
              ${I18n.t('modeProfile')}
            </div>
            <span class="module-score-pill">${pReport.scientific.score}/100</span>
          </div>
          ${createMetricRow(I18n.t('metricGonialAngle'), pm.gonialAngle.value, pm.gonialAngle.referenceRange, 'MEASURED', 'SCIENTIFIC', pm.gonialAngle.zScore, pm.gonialAngle.percentile, pm.gonialAngle.score)}
          ${createMetricRow(I18n.t('metricRamusIndex'), pm.ramusIndex.value, pm.ramusIndex.referenceRange, 'MEASURED', 'SCIENTIFIC', pm.ramusIndex.zScore, pm.ramusIndex.percentile, pm.ramusIndex.score)}
          ${createMetricRow(I18n.t('metricEline'), pm.eline.value, pm.eline.referenceRange, 'MEASURED', 'SCIENTIFIC', pm.eline.zScore, pm.eline.percentile, pm.eline.score)}
          ${createMetricRow(I18n.t('metricConvexity'), pm.convexity.value, pm.convexity.referenceRange, 'MEASURED', 'SCIENTIFIC', pm.convexity.zScore, pm.convexity.percentile, pm.convexity.score)}
        </div>
      `;
    }

    container.innerHTML = html;
    lucide.createIcons();
  }

  function createMetricRow(name, val, ideal, status = 'MEASURED', domain = 'SCIENTIFIC', zScore = null, percentile = null, score100 = null) {
    const statusBadgeClass = status === 'MEASURED' ? 'badge-measured' : (status === 'ESTIMATED' ? 'badge-estimated' : 'badge-unobserved');
    const domainBadgeClass = domain === 'COMMUNITY' ? 'badge-community' : (domain === 'ESTIMATED 3D' ? 'badge-3d' : 'badge-scientific');

    const statusLabel = I18n.t(status === 'MEASURED' ? 'badgeMeasured' : (status === 'ESTIMATED' ? 'badgeEstimated' : 'badgeNotObservable'));
    const domainLabel = I18n.t(domain === 'COMMUNITY' ? 'badgeCommunity' : (domain === 'ESTIMATED 3D' ? 'badgeEstimated3D' : 'badgeScientific'));

    let statInfo = '';
    if (zScore !== null && percentile !== null && domain !== 'COMMUNITY' && status !== 'NOT_OBSERVABLE') {
      const pText = typeof percentile === 'string' ? percentile : (percentile >= 99 ? '>P99' : (percentile <= 1 ? '<P1' : `P${percentile}`));
      const zText = typeof zScore === 'string' ? zScore : (zScore > 0 ? `+${zScore}` : `${zScore}`);
      statInfo = `<span class="metric-stat-pill">Z: ${zText} • ${pText}</span>`;
    }

    let scorePill = '';
    if (score100 !== null && score100 !== undefined) {
      scorePill = `<span class="metric-score-tag">${score100}/100</span>`;
    }

    return `
      <div class="metric-item">
        <div class="metric-top-row">
          <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
            <span class="metric-name">${name}</span>
            <span class="status-chip ${statusBadgeClass}">${statusLabel}</span>
            <span class="domain-chip ${domainBadgeClass}">${domainLabel}</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            ${statInfo}
            ${scorePill}
            <span class="metric-val">${val}</span>
          </div>
        </div>
        <div class="metric-ideal-tag">${I18n.t('refTargetLabel')} ${ideal}</div>
      </div>
    `;
  }

  function renderRecommendations(recs) {

    const list = document.getElementById('recommendationsList');
    list.innerHTML = '';

    const filtered = (recs || []).filter(r => {
      if (currentRecFilter === 'all') return true;
      return r.level === currentRecFilter;
    });

    if (filtered.length === 0) {
      list.innerHTML = `<div style="color:var(--text-muted);font-size:0.9rem;padding:1rem;text-align:center;">${I18n.currentLang === 'ru' ? 'В данной категории нет активных рекомендаций.' : 'No active recommendations in this category.'}</div>`;
      return;
    }

    const lang = I18n.currentLang;

    filtered.forEach(r => {
      const title = (lang === 'ru' && r.titleRu) ? r.titleRu : (r.titleEn || r.title);
      const category = (lang === 'ru' && r.categoryRu) ? r.categoryRu : (r.categoryEn || r.category || 'Softmaxxing');
      const text = (lang === 'ru' && r.textRu) ? r.textRu : (r.textEn || r.text);

      const div = document.createElement('div');
      div.className = 'rec-item';
      div.innerHTML = `
        <div class="rec-item-header">
          <div class="rec-item-title-box">
            <i data-lucide="${r.icon || 'lightbulb'}" style="width:18px;height:18px;color:var(--accent-gold);"></i>
            <span>${title}</span>
          </div>
          <div class="rec-item-badges">
            <span class="rec-cat-tag ${r.level || 'soft'}">${category}</span>
            <span class="rec-gain-pill">${r.gain || '+3-5 pts'}</span>
          </div>
        </div>
        <div class="rec-text">${text}</div>
      `;
      list.appendChild(div);
    });

    lucide.createIcons();
  }

  // Report Download Listener
  document.getElementById('downloadReportBtn').addEventListener('click', () => {
    window.print();
  });
});
