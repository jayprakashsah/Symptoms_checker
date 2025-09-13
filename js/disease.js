// disease.js
// Place in js/disease.js and make sure path in disease.html matches (js/disease.js)

const MODEL_PATH = "./my_model/"; // <- ensure model folder is here relative to disease.html
const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

let model = null;
let maxPredictions = 0;
let stream = null;
let modelLoaded = false;

// DOM elements
const startBtn = document.getElementById("startBtn");
const captureBtn = document.getElementById("captureBtn");
const stopBtn = document.getElementById("stopBtn");
const uploadInput = document.getElementById("uploadInput");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const previewImg = document.getElementById("previewImg");
const resultCard = document.getElementById("resultCard");
const statusEl = document.getElementById("status");
const retestBtn = document.getElementById("retestBtn");
const locHospBtn = document.getElementById("locHospBtn");

// Demo mapping: update names to match your model's classes
const DISEASE_MAP = {
  "Acne": {
    safety: "Keep face clean, avoid oily creams, wash regularly, don’t squeeze pimples.",
    doctor: "Dermatologist",
    hospitalFallback: "Skin & Hair Care Clinic"
  },
  "Actinic Keratosis": {
    safety: "Avoid sunlight, use sunscreen, wear protective clothing.",
    doctor: "Dermatologist",
    hospitalFallback: "Apollo Dermatology Dept"
  },
  "Benign Tumors": {
    safety: "Usually harmless but should be checked for abnormal growth.",
    doctor: "Dermatologist / Oncologist",
    hospitalFallback: "City General Hospital"
  },
  "Bullous": {
    safety: "Do not pop blisters, keep skin clean, seek immediate care if severe.",
    doctor: "Dermatologist",
    hospitalFallback: "Specialized Skin Hospital"
  },
  "Candidiasis": {
    safety: "Keep skin dry, use antifungal creams as recommended.",
    doctor: "Dermatologist",
    hospitalFallback: "General Hospital Dermatology Dept"
  },
  "Drug Eruption": {
    safety: "Stop suspected medication, seek medical help immediately.",
    doctor: "Dermatologist / General Physician",
    hospitalFallback: "Emergency Care Hospital"
  },
  "Eczema": {
    safety: "Moisturize skin, avoid harsh soaps, don’t scratch.",
    doctor: "Dermatologist",
    hospitalFallback: "Skin Care Center"
  },
  "Infestations/Bites": {
    safety: "Clean area, apply antiseptic, avoid scratching, monitor for infection.",
    doctor: "Dermatologist",
    hospitalFallback: "Community Health Center"
  },
  "Lichen": {
    safety: "Avoid skin irritation, use prescribed ointments.",
    doctor: "Dermatologist",
    hospitalFallback: "Skin & Allergy Clinic"
  },
  "Lupus": {
    safety: "Avoid sunlight, follow prescribed medication, monitor regularly.",
    doctor: "Rheumatologist / Dermatologist",
    hospitalFallback: "Autoimmune Specialty Hospital"
  },
  "Moles": {
    safety: "Monitor for changes in size or color, avoid scratching.",
    doctor: "Dermatologist",
    hospitalFallback: "Skin Cancer Clinic"
  },
  "Psoriasis": {
    safety: "Moisturize, avoid triggers like stress and alcohol.",
    doctor: "Dermatologist",
    hospitalFallback: "Special Psoriasis Clinic"
  },
  "Rosacea": {
    safety: "Avoid hot drinks, spicy food, and sunlight.",
    doctor: "Dermatologist",
    hospitalFallback: "Skin & Cosmetic Clinic"
  },
  "Seborrheic Keratoses": {
    safety: "Usually harmless, but consult doctor for sudden changes.",
    doctor: "Dermatologist",
    hospitalFallback: "General Dermatology Clinic"
  },
  "Skin Cancer": {
    safety: "Seek immediate medical attention, avoid sunlight.",
    doctor: "Oncologist / Dermatologist",
    hospitalFallback: "Cancer Institute"
  },
  "Sun/Sunlight Damage": {
    safety: "Apply sunscreen, wear hats, avoid peak sun hours.",
    doctor: "Dermatologist",
    hospitalFallback: "Dermatology & Cosmetic Center"
  },
  "Tinea": {
    safety: "Keep skin dry, use antifungal cream as prescribed.",
    doctor: "Dermatologist",
    hospitalFallback: "Skin Infection Clinic"
  },
  "Unknown/Normal": {
    safety: "No major concerns detected. Maintain hygiene & skin care.",
    doctor: "No specialist needed",
    hospitalFallback: "N/A"
  },
  "Vascular Tumors": {
    safety: "Monitor growth, consult if painful or bleeding.",
    doctor: "Dermatologist / Oncologist",
    hospitalFallback: "Specialty Hospital"
  },
  "Vasculitis": {
    safety: "Avoid injury, consult doctor for medication immediately.",
    doctor: "Rheumatologist / Dermatologist",
    hospitalFallback: "City Hospital"
  },
  "Vitiligo": {
    safety: "Use sunscreen, avoid harsh chemicals, consult for treatment options.",
    doctor: "Dermatologist",
    hospitalFallback: "Vitiligo Treatment Center"
  },
  "Warts": {
    safety: "Avoid scratching, don’t share towels, use prescribed treatment.",
    doctor: "Dermatologist",
    hospitalFallback: "Skin & Nail Clinic"
  }
};



// utility: set status and console log
function setStatus(text, isError = false) {
  statusEl.textContent = "Status: " + text;
  if (isError) console.error(text); else console.log(text);
}

// try loading model (graceful fallback to demo)
async function loadModel() {
  if (modelLoaded) return;
  setStatus("Loading model...");
  try {
    const modelURL = MODEL_PATH + "model.json";
    const metadataURL = MODEL_PATH + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    modelLoaded = true;
    setStatus("Model loaded (" + maxPredictions + " classes)");
    console.log("Model loaded:", model, "classes:", maxPredictions);
  } catch (err) {
    setStatus("Model load failed — running in DEMO mode (check ./my_model).", true);
    console.warn("Model load error:", err);
    modelLoaded = false; // we'll still let UI work with fake predictions
  }
}

// Start camera
async function startCamera() {
  await loadModel();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera API not supported in this browser.");
    setStatus("Camera API not supported.", true);
    return;
  }

  startBtn.disabled = true;
  setStatus("Requesting camera permission...");
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "environment" } });
    video.srcObject = stream;
    await video.play();
    captureBtn.disabled = false;
    stopBtn.disabled = false;
    retestBtn.disabled = true;
    locHospBtn.disabled = true;
    setStatus("Camera started");
    console.log("Camera stream started:", stream);
  } catch (err) {
    setStatus("Camera access denied or unavailable. Check permissions.", true);
    console.error("getUserMedia error:", err);
    startBtn.disabled = false;
  }
}

// Stop camera
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
    video.srcObject = null;
    setStatus("Camera stopped");
  } else {
    setStatus("Camera is not running");
  }
  startBtn.disabled = false;
  captureBtn.disabled = true;
  stopBtn.disabled = true;
}

// Capture photo from video to canvas and predict
async function capturePhoto() {
  await loadModel();
  if (!video || !video.srcObject) {
    alert("Camera is not started. Click 'Start Camera' first.");
    setStatus("Capture failed: camera is not started.", true);
    return;
  }

  // set canvas size to actual video resolution
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // show preview image (optional)
  previewImg.src = canvas.toDataURL("image/jpeg");
  previewImg.hidden = false;

  setStatus("Captured image — running prediction...");
  await predictFromElement(canvas);
}

// Handle image upload
async function handleUpload(event) {
  await loadModel();
  const file = event.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewImg.hidden = false;

  // create new Image object to pass to model.predict
  const img = new Image();
  img.src = url;
  img.onload = async () => {
    // draw to canvas for consistent size (optional)
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    setStatus("Image loaded — running prediction...");
    await predictFromElement(img);
  };
  img.onerror = () => {
    setStatus("Failed to load uploaded image.", true);
  };
}

// Predict wrapper (element may be canvas or image)
async function predictFromElement(element) {
  try {
    let predictions;
    if (modelLoaded && model) {
      predictions = await model.predict(element);
    } else {
      // DEMO fake prediction if model not loaded
      predictions = fakePrediction();
    }

    if (!predictions || predictions.length === 0) {
      setStatus("No predictions returned.", true);
      return;
    }

    // pick top prediction
    predictions.sort((a,b) => b.probability - a.probability);
    const best = predictions[0];
    console.log("Top prediction:", best);
    displayResult(best);
  } catch (err) {
    setStatus("Prediction failed: " + (err.message || err), true);
    console.error("prediction error", err);
  }
}

// Display single result (with safety, doctor, hospitals)
async function displayResult(pred) {
  const name = pred.className || "Unknown";
  const conf = (pred.probability * 100).toFixed(2);

  const info = DISEASE_MAP[name] || {
    safety: "No specific guidance available. Use gloves and isolate infected samples.",
    doctor: "Agricultural Specialist",
    hospitalFallback: "Local Agriculture Office"
  };

  // try to fetch geo-based hospitals
  let hospitalsHtml = `<div class="row"><div class="label">Preferred Hospital</div><div class="value">${info.hospitalFallback}</div></div>`;

  // attempt geolocation -> Overpass query
  try {
    const pos = await getPosition(7000); // 7 second timeout
    setStatus("Location found, fetching nearby hospitals...");
    const hos = await findNearbyHospitals(pos.coords.latitude, pos.coords.longitude, 5000); // 5 km
    if (hos && hos.length) {
      hospitalsHtml = `<div class="row"><div class="label">Nearby Hospitals</div><div class="value"><ol>${hos.slice(0,5).map(h => `<li>${escapeHtml(h)}</li>`).join("")}</ol></div></div>`;
      setStatus("Result ready (with nearby hospitals).");
    } else {
      setStatus("Result ready (no nearby hospitals found).");
    }
  } catch (err) {
    console.warn("Geo/hospital lookup failed:", err);
    setStatus("Result ready (location/hospitals unavailable).");
  }

  // build HTML
  resultCard.classList.remove("empty");
  resultCard.innerHTML = `
    <h2>${escapeHtml(name)}</h2>
    <div class="row"><div class="label">Confidence</div><div class="value">${conf}%</div></div>
    <div class="row"><div class="label">Safety Measures</div><div class="value">${escapeHtml(info.safety)}</div></div>
    <div class="row"><div class="label">Doctor to Visit</div><div class="value">${escapeHtml(info.doctor)}</div></div>
    ${hospitalsHtml}
  `;

  // enable retest / locate buttons
  retestBtn.disabled = false;
  locHospBtn.disabled = false;
}

// small HTML escape
function escapeHtml(s){ return (s+"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

// Promise wrapper for geolocation
function getPosition(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation unsupported"));
    const timer = setTimeout(() => reject(new Error("Geolocation timeout")), timeoutMs);
    navigator.geolocation.getCurrentPosition(pos => {
      clearTimeout(timer);
      resolve(pos);
    }, err => {
      clearTimeout(timer);
      reject(err);
    }, {enableHighAccuracy:true, maximumAge: 0, timeout: timeoutMs});
  });
}

// Use Overpass API to find nearby hospitals (may be blocked by CORS in some environments)
// returns array of names
async function findNearbyHospitals(lat, lon, radius = 3000) {
  try {
    const q = `
[out:json][timeout:15];
(
  node["amenity"="hospital"](around:${radius},${lat},${lon});
  way["amenity"="hospital"](around:${radius},${lat},${lon});
  relation["amenity"="hospital"](around:${radius},${lat},${lon});
);
out center 20;`;
    const res = await fetch(OVERPASS_ENDPOINT, { method: "POST", body: q });
    if (!res.ok) throw new Error("Overpass query failed: " + res.status);
    const data = await res.json();
    const names = new Set();
    (data.elements || []).forEach(el => {
      const n = (el.tags && (el.tags.name || el.tags["operator"])) || el.tags && Object.values(el.tags)[0];
      if (n) names.add(n);
    });
    return Array.from(names);
  } catch (err) {
    console.warn("Overpass/OSM error:", err);
    // fallback sample list (replace with your region-specific hospitals if desired)
    return [
      "Apollo Hospital (fallback)",
      "City General Hospital (fallback)",
      "Krishi Vigyan Kendra (Agri support)"
    ];
  }
}

// fake prediction generator (used when model can't be loaded)
function fakePrediction() {
  const keys = Object.keys(DISEASE_MAP);
  const pick = keys[Math.floor(Math.random()*keys.length)];
  return [{className: pick, probability: 0.85}];
}

// event listeners
startBtn?.addEventListener("click", startCamera);
captureBtn?.addEventListener("click", capturePhoto);
stopBtn?.addEventListener("click", () => { stopCamera(); setStatus("Camera stopped by user"); });
uploadInput?.addEventListener("change", handleUpload);
retestBtn?.addEventListener("click", () => {
  // simple re-run using preview image if available
  if (previewImg && previewImg.src) {
    const img = new Image();
    img.src = previewImg.src;
    img.onload = () => predictFromElement(img);
  } else {
    setStatus("No image to retest");
  }
});
locHospBtn?.addEventListener("click", async () => {
  try {
    setStatus("Locating for hospitals...");
    const pos = await getPosition(7000);
    const hospitals = await findNearbyHospitals(pos.coords.latitude, pos.coords.longitude, 5000);
    alert("Nearby hospitals:\n" + hospitals.slice(0,6).join("\n"));
  } catch (err) {
    alert("Could not find hospitals: " + (err.message || err));
  }
});

// attempt loading model lazily so upload and UI still usable quickly
loadModel().catch(e => console.warn("Initial model load failed:", e));