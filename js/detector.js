// js/detector.js
const URL = "./my_model/";  // must match folder name and relative position to index.html
let model, webcam, labelContainer, maxPredictions;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  // load the model and metadata
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // setup webcam
  const flip = true; // flip for user-facing camera
  webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
  await webcam.setup(); // prompts user for camera
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append webcam canvas and prepare label container
  const wc = document.getElementById("webcam-container");
  wc.innerHTML = ""; // clear any previous
  wc.appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = ""; // clear previous labels
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict(); // run prediction for current frame
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  // find best prediction
  let best = prediction[0];
  for (let i = 1; i < prediction.length; i++) {
    if (prediction[i].probability > best.probability) best = prediction[i];
  }
  // show only top result and advice
  const conf = (best.probability * 100).toFixed(2);
  labelContainer.innerHTML = `
    <div><strong>Possible condition:</strong> ${best.className}</div>
    <div><strong>Confidence:</strong> ${conf}%</div>
  `;

  // simple advice mapping (adjust labels to your classes)
  const advice = {
    "Acne": "Advice: Keep the area clean, avoid picking. See a dermatologist if severe.",
    "Eczema": "Advice: Use gentle moisturizing; avoid harsh soaps; consult dermatologist if worsening.",
    "Psoriasis": "Advice: Keep skin moisturized; avoid triggers; see a doctor for treatment."
    // add your model's exact class names here
  };

  if (advice[best.className]) {
    labelContainer.innerHTML += `<div style="margin-top:8px;"><strong>Advice:</strong> ${advice[best.className]}</div>`;
  }
}