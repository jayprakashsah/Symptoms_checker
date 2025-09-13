document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // 1. TAB SYSTEM FOR DIFFERENT INPUT METHODS
    // =============================================
    const methodTabs = document.querySelectorAll('.method-tab');
    const methodPanes = document.querySelectorAll('.method-pane');
    
    methodTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs/panes
            methodTabs.forEach(t => t.classList.remove('active'));
            methodPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding pane
            const method = this.getAttribute('data-method');
            document.getElementById(`${method}-input`).classList.add('active');
        });
    });

    // =============================================
    // 2. SYMPTOM CHECKER FUNCTIONALITY
    // =============================================
    const symptomTags = document.querySelectorAll('.symptom-tags .tag');
    const symptomText = document.getElementById('symptomText');
    const analyzeBtn = document.getElementById('analyzeSymptoms');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Tag selection functionality
    symptomTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent;
            const cursorPos = symptomText.selectionStart;
            const currentText = symptomText.value;
            
            // Check if tag already exists at cursor position
            const textBefore = currentText.substring(0, cursorPos);
            const textAfter = currentText.substring(cursorPos);
            
            if (textBefore.includes(tagText) || textAfter.includes(tagText)) {
                // Remove the tag if it exists nearby
                symptomText.value = currentText.replace(tagText, '').trim();
                this.classList.remove('selected');
            } else {
                // Insert the tag at cursor position
                symptomText.value = `${textBefore} ${tagText} ${textAfter}`.trim();
                this.classList.add('selected');
                symptomText.focus();
                symptomText.setSelectionRange(cursorPos + tagText.length + 1, cursorPos + tagText.length + 1);
            }
        });
    });
    
    // Symptom analysis function
    if (analyzeBtn && resultsContainer) {
        analyzeBtn.addEventListener('click', function() {
            const symptoms = symptomText.value.trim();
            
            if (!symptoms) {
                showAlert('Please describe your symptoms', 'error');
                return;
            }
            
            showLoadingState();
            
            // Simulate API call with timeout
            setTimeout(() => {
                const response = generateAIResponse(symptoms);
                showAnalysisResults(response, symptoms);
            }, 2000);
        });
    }
    
    // =============================================
    // 3. VOICE RECORDING FUNCTIONALITY
    // =============================================
    const startRecording = document.getElementById('startRecording');
    const voiceTranscript = document.getElementById('voiceTranscript');
    let isRecording = false;
    let recognition;
    
    // Check for browser support
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            voiceTranscript.innerHTML = `<p>${transcript}</p>`;
            symptomText.value = transcript;
        };
        
        recognition.onerror = function(event) {
            showAlert('Voice recognition error: ' + event.error, 'error');
        };
        
        recognition.onend = function() {
            isRecording = false;
            updateRecordingUI();
        };
    }
    
    if (startRecording) {
        startRecording.addEventListener('click', toggleRecording);
    }
    
    function toggleRecording() {
        if (!recognition) {
            showAlert('Voice recognition not supported in your browser', 'error');
            return;
        }
        
        isRecording = !isRecording;
        
        if (isRecording) {
            recognition.start();
            voiceTranscript.innerHTML = '<p>Listening... Speak now.</p>';
        } else {
            recognition.stop();
        }
        
        updateRecordingUI();
    }
    
    function updateRecordingUI() {
        const indicator = document.querySelector('.recording-indicator');
        const timer = document.querySelector('.voice-status span');
        
        if (isRecording) {
            startRecording.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            startRecording.classList.add('recording-active');
            indicator.style.display = 'inline-block';
            
            // Simple timer for demo purposes
            let seconds = 0;
            const timerInterval = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                
                if (!isRecording) {
                    clearInterval(timerInterval);
                }
            }, 1000);
        } else {
            startRecording.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
            startRecording.classList.remove('recording-active');
            indicator.style.display = 'none';
            timer.textContent = '00:00';
        }
    }
    
    // =============================================
    // 4. VISUAL SYMPTOM CHECKER (IMAGE UPLOAD)
    // =============================================
    const uploadArea = document.getElementById('uploadArea');
    const imageUpload = document.getElementById('imageUpload');
    const previewImage = document.getElementById('previewImage');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImage');
    const analyzeImageBtn = document.getElementById('analyzeImage');
    const visualOptions = document.querySelectorAll('.visual-option');
    
    // Drag and drop functionality
    if (uploadArea) {
        uploadArea.addEventListener('click', () => imageUpload.click());
        
        ['dragover', 'dragenter'].forEach(event => {
            uploadArea.addEventListener(event, (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
        });
        
        ['dragleave', 'dragend', 'drop'].forEach(event => {
            uploadArea.addEventListener(event, (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            });
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length) {
                imageUpload.files = files;
                handleImageUpload(files[0]);
            }
        });
    }
    
    // File input change handler
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleImageUpload(e.target.files[0]);
            }
        });
    }
    
    // Handle image preview
    function handleImageUpload(file) {
        if (!file.type.match('image.*')) {
            showAlert('Please upload an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
            analyzeImageBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    // Remove image
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            previewImage.src = '';
            previewImage.style.display = 'none';
            imageUpload.value = '';
            uploadArea.style.display = 'flex';
            imagePreview.style.display = 'none';
            analyzeImageBtn.disabled = true;
        });
    }
    
    // Visual options buttons
    visualOptions.forEach(option => {
        option.addEventListener('click', function() {
            const conditionType = this.getAttribute('data-type');
            showVisualGuide(conditionType);
        });
    });
    
    // Analyze image button
    if (analyzeImageBtn) {
        analyzeImageBtn.addEventListener('click', function() {
            if (!previewImage.src) return;
            
            showLoadingState();
            
            // Simulate image analysis
            setTimeout(() => {
                const condition = simulateImageAnalysis(previewImage.src);
                showVisualResults(condition);
            }, 2500);
        });
    }
    
    // =============================================
    // 5. FIRST AID GUIDES MODAL SYSTEM
    // =============================================
    const viewGuideBtns = document.querySelectorAll('.view-guide');
    const modal = document.getElementById('guideModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.querySelector('.modal-close');
    
    // Guide data
    const firstAidGuides = {
        cpr: {
            title: "CPR (Cardiopulmonary Resuscitation)",
            steps: [
                "Check the scene for safety and the person for responsiveness",
                "Call emergency services or ask someone to call",
                "Place the person on their back on a firm surface",
                "Place the heel of one hand on the center of the chest",
                "Place the other hand on top and interlock fingers",
                "Position shoulders directly over hands with arms straight",
                "Push hard and fast (2 inches deep at 100-120 compressions per minute)",
                "Continue until help arrives or the person shows signs of life"
            ],
            video: "https://www.youtube.com/embed/0dcmfqzuXDI",
            notes: "For adults and children over puberty. Use one hand for small children and two fingers for infants."
        },
        choking: {
            title: "Heimlich Maneuver for Choking",
            steps: [
                "Ask 'Are you choking?' - if they can't speak or cough, act immediately",
                "Stand behind the person and wrap your arms around their waist",
                "Make a fist with one hand and place it just above the navel",
                "Grasp your fist with your other hand",
                "Give quick upward thrusts into the abdomen",
                "Continue until the object is expelled or the person becomes unconscious",
                "If unconscious, begin CPR"
            ],
            video: "https://www.youtube.com/embed/7CgtIgSyAiU",
            notes: "Use chest thrusts instead for pregnant or obese individuals."
        },
        burns: {
            title: "Burn Treatment",
            steps: [
                "Cool the burn with cool (not cold) running water for 10-15 minutes",
                "Remove jewelry or tight clothing near the burned area",
                "Do not break blisters or apply butter/ointment",
                "Cover loosely with sterile, non-stick bandage",
                "Take over-the-counter pain reliever if needed",
                "Seek medical help for burns larger than 3 inches or on face/hands/joints"
            ],
            video: "https://www.youtube.com/embed/K42EFY2KXjM",
            notes: "For chemical burns, remove contaminated clothing and rinse with water for 20+ minutes."
        }
    };
    
    // Open modal with guide content
    viewGuideBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const guideId = this.getAttribute('data-guide');
            const guide = firstAidGuides[guideId];
            
            if (guide) {
                modalBody.innerHTML = `
                    <h2>${guide.title}</h2>
                    <div class="guide-video">
                        <iframe src="${guide.video}" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <div class="guide-steps">
                        <h3>Steps:</h3>
                        <ol>
                            ${guide.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                    <div class="guide-notes">
                        <h4>Important Notes:</h4>
                        <p>${guide.notes}</p>
                    </div>
                `;
                
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // =============================================
    // 6. COMMON CONDITIONS FILTERING
    // =============================================
    const conditionTabs = document.querySelectorAll('.condition-tab');
    const conditionsGrid = document.querySelector('.conditions-grid');
    
    // Sample conditions data
    const conditions = [
        { id: 1, name: "Common Cold", category: "respiratory", icon: "fa-head-side-cough", desc: "Viral infection of the upper respiratory tract" },
        { id: 2, name: "Influenza (Flu)", category: "respiratory", icon: "fa-lungs-virus", desc: "Contagious respiratory illness caused by flu viruses" },
        { id: 3, name: "Food Poisoning", category: "digestive", icon: "fa-utensils-slash", desc: "Illness caused by contaminated food" },
        { id: 4, name: "Migraine", category: "neurological", icon: "fa-brain", desc: "Recurrent headache disorder" },
        { id: 5, name: "Eczema", category: "skin", icon: "fa-allergies", desc: "Condition causing inflamed, itchy skin" },
        { id: 6, name: "Asthma", category: "respiratory", icon: "fa-wind", desc: "Chronic inflammatory disease of the airways" },
        { id: 7, name: "Heartburn", category: "digestive", icon: "fa-fire", desc: "Burning sensation in chest from acid reflux" },
        { id: 8, name: "Conjunctivitis", category: "skin", icon: "fa-eye", desc: "Inflammation or infection of the outer eyelid" }
    ];
    
    // Display all conditions initially
    displayConditions(conditions);
    
    // Filter conditions by category
    conditionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-condition');
            
            // Update active tab
            conditionTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter conditions
            const filteredConditions = category === 'all' 
                ? conditions 
                : conditions.filter(cond => cond.category === category);
            
            displayConditions(filteredConditions);
        });
    });
    
    // Display conditions in grid
    function displayConditions(conditionsToShow) {
        conditionsGrid.innerHTML = '';
        
        conditionsToShow.forEach(condition => {
            const card = document.createElement('div');
            card.className = 'condition-card';
            card.innerHTML = `
                <i class="fas ${condition.icon} condition-icon"></i>
                <h4>${condition.name}</h4>
                <p>${condition.desc}</p>
            `;
            
            card.addEventListener('click', () => {
                showConditionDetails(condition);
            });
            
            conditionsGrid.appendChild(card);
        });
    }
    
    // =============================================
    // HELPER FUNCTIONS
    // =============================================
    
    // Show loading state in results container
    function showLoadingState() {
        resultsContainer.innerHTML = `
            <div class="ai-response loading">
                <div class="ai-avatar">
                    <img src="images/ai-avatar.png" alt="AI Assistant">
                </div>
                <div class="ai-message">
                    <h3>Analyzing your input...</h3>
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Generate simulated AI response based on symptoms
    function generateAIResponse(symptoms) {
        const lowerSymptoms = symptoms.toLowerCase();
        
        // Emergency conditions
        if (lowerSymptoms.includes('chest pain') && 
            (lowerSymptoms.includes('shortness of breath') || lowerSymptoms.includes('sweating'))) {
            return {
                conditions: [
                    {
                        name: "Heart Attack",
                        probability: "Emergency",
                        description: "Symptoms suggest possible cardiac event requiring immediate attention."
                    }
                ],
                advice: "Call emergency services immediately. Chew aspirin if available and not allergic. Stay calm and rest while waiting for help.",
                severity: "high"
            };
        }
        
        // Common condition patterns
        if (lowerSymptoms.includes('fever') && lowerSymptoms.includes('cough')) {
            return {
                conditions: [
                    {
                        name: "Influenza (Flu)",
                        probability: "Likely",
                        description: "Viral infection causing fever, cough, and often body aches."
                    },
                    {
                        name: "COVID-19",
                        probability: "Possible",
                        description: "Respiratory illness with similar symptoms to flu."
                    }
                ],
                advice: "Rest, stay hydrated, and take fever reducers like acetaminophen. Isolate from others and get tested for COVID-19 if available.",
                severity: "moderate"
            };
        }
        
        if (lowerSymptoms.includes('rash') && lowerSymptoms.includes('itch')) {
            return {
                conditions: [
                    {
                        name: "Allergic Reaction",
                        probability: "Likely",
                        description: "Skin reaction to allergens like food, plants, or medications."
                    },
                    {
                        name: "Eczema",
                        probability: "Possible",
                        description: "Chronic condition causing itchy, inflamed skin."
                    }
                ],
                advice: "Apply cool compresses and over-the-counter hydrocortisone cream. Take antihistamines for itching. Seek help if rash spreads rapidly or breathing difficulties occur.",
                severity: "low"
            };
        }
        
        // Default response
        return {
            conditions: [
                {
                    name: "Multiple Possible Causes",
                    probability: "Varies",
                    description: "Your symptoms could indicate several conditions."
                }
            ],
            advice: "Monitor your symptoms. If they worsen or persist beyond 48 hours, consult a healthcare provider. For severe symptoms like difficulty breathing or intense pain, seek immediate care.",
            severity: "low"
        };
    }
    
    // Display analysis results
    function showAnalysisResults(response, symptoms) {
        let severityClass, severityIcon, severityText;
        
        switch(response.severity) {
            case 'high':
                severityClass = 'high-severity';
                severityIcon = 'fa-exclamation-triangle';
                severityText = 'Seek Immediate Medical Attention';
                break;
            case 'moderate':
                severityClass = 'moderate-severity';
                severityIcon = 'fa-info-circle';
                severityText = 'Consult a Healthcare Provider';
                break;
            default:
                severityClass = 'low-severity';
                severityIcon = 'fa-check-circle';
                severityText = 'Monitor Your Condition';
        }
        
        resultsContainer.innerHTML = `
            <div class="ai-response">
                <div class="ai-avatar">
                    <img src="images/ai-avatar.png" alt="AI Assistant">
                </div>
                <div class="ai-message">
                    <div class="message-header">
                        <h3>Health Analysis Report</h3>
                        <p class="symptoms-summary">"${symptoms}"</p>
                    </div>
                    
                    <div class="severity-alert ${severityClass}">
                        <i class="fas ${severityIcon}"></i>
                        <span>${severityText}</span>
                    </div>
                    
                    <div class="conditions-list">
                        <h4>Possible Conditions:</h4>
                        ${response.conditions.map(cond => `
                            <div class="condition">
                                <div class="condition-header">
                                    <span class="condition-name">${cond.name}</span>
                                    <span class="condition-probability ${cond.probability.toLowerCase()}">${cond.probability}</span>
                                </div>
                                <p class="condition-desc">${cond.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="medical-advice">
                        <h4>Recommendations:</h4>
                        <p>${response.advice}</p>
                    </div>
                    
                    <div class="response-actions">
                        <a href="emergency.html" class="btn btn-primary">
                            <i class="fas fa-ambulance"></i> Emergency Help
                        </a>
                        <a href="hospitals.html" class="btn btn-secondary">
                            <i class="fas fa-hospital"></i> Find Hospitals
                        </a>
                    </div>
                    
                    <div class="disclaimer">
                        <p><i class="fas fa-exclamation-circle"></i> <strong>Disclaimer:</strong> This is not a diagnosis. Our AI provides health information for educational purposes only. Always consult a healthcare professional for medical advice.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Simulate image analysis
    function simulateImageAnalysis(imageSrc) {
        // In a real app, this would call a computer vision API
        const conditions = [
            {
                name: "Poison Ivy Rash",
                confidence: "High",
                description: "Linear red rash with blisters, likely caused by contact with poison ivy.",
                treatment: "Wash area with soap and water. Apply calamine lotion or hydrocortisone cream. Take oral antihistamines for itching."
            },
            {
                name: "Eczema",
                confidence: "Medium",
                description: "Dry, scaly patches that may be red and inflamed.",
                treatment: "Apply moisturizer regularly. Use prescription topical steroids for flare-ups."
            },
            {
                name: "Contact Dermatitis",
                confidence: "Medium",
                description: "Red, itchy rash from contact with an irritant.",
                treatment: "Identify and avoid the irritant. Use topical corticosteroids."
            }
        ];
        
        return {
            image: imageSrc,
            primaryCondition: conditions[0],
            otherConditions: conditions.slice(1),
            severity: "low"
        };
    }
    
    // Show visual analysis results
    function showVisualResults(analysis) {
        resultsContainer.innerHTML = `
            <div class="ai-response">
                <div class="ai-avatar">
                    <img src="images/ai-avatar.png" alt="AI Assistant">
                </div>
                <div class="ai-message">
                    <div class="message-header">
                        <h3>Visual Analysis Results</h3>
                        <div class="image-preview-small">
                            <img src="${analysis.image}" alt="Uploaded condition">
                        </div>
                    </div>
                    
                    <div class="visual-condition">
                        <h4>Most Likely Condition:</h4>
                        <div class="condition-card primary">
                            <h5>${analysis.primaryCondition.name}</h5>
                            <p><strong>Confidence:</strong> ${analysis.primaryCondition.confidence}</p>
                            <p>${analysis.primaryCondition.description}</p>
                            <div class="treatment">
                                <h6>Recommended Treatment:</h6>
                                <p>${analysis.primaryCondition.treatment}</p>
                            </div>
                        </div>
                    </div>
                    
                    ${analysis.otherConditions.length > 0 ? `
                    <div class="other-conditions">
                        <h4>Other Possible Conditions:</h4>
                        <div class="other-conditions-grid">
                            ${analysis.otherConditions.map(cond => `
                                <div class="condition-card">
                                    <h5>${cond.name}</h5>
                                    <p><strong>Confidence:</strong> ${cond.confidence}</p>
                                    <p>${cond.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="response-actions">
                        <button class="btn btn-primary" id="saveAnalysis">
                            <i class="fas fa-save"></i> Save Results
                        </button>
                        <a href="hospitals.html#dermatology" class="btn btn-secondary">
                            <i class="fas fa-user-md"></i> Find a Dermatologist
                        </a>
                    </div>
                    
                    <div class="disclaimer">
                        <p><i class="fas fa-exclamation-circle"></i> <strong>Note:</strong> Computer vision analysis is not a substitute for professional medical diagnosis.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Show visual guide for specific condition
    function showVisualGuide(conditionType) {
        const guides = {
            rash: {
                title: "Skin Rash Identification Guide",
                instructions: [
                    "Take photo in good lighting",
                    "Include affected area and some surrounding skin",
                    "Take photos from multiple angles if needed",
                    "Include close-up and wider shots"
                ],
                examples: ["images/rash-example1.jpg", "images/rash-example2.jpg"]
            },
            wound: {
                title: "Wound Assessment Guide",
                instructions: [
                    "Clean wound gently before photographing",
                    "Include ruler or coin for scale if possible",
                    "Show depth if applicable",
                    "Photograph any drainage or discoloration"
                ],
                examples: ["images/wound-example1.jpg", "images/wound-example2.jpg"]
            },
            eye: {
                title: "Eye Condition Photography Guide",
                instructions: [
                    "Use macro mode if available",
                    "Photograph in natural light",
                    "Include both eyes for comparison",
                    "Show any discharge or swelling clearly"
                ],
                examples: ["images/eye-example1.jpg", "images/eye-example2.jpg"]
            }
        };
        
        const guide = guides[conditionType];
        if (!guide) return;
        
        resultsContainer.innerHTML = `
            <div class="visual-guide">
                <h3>${guide.title}</h3>
                
                <div class="guide-instructions">
                    <h4>How to photograph:</h4>
                    <ol>
                        ${guide.instructions.map(inst => `<li>${inst}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="guide-examples">
                    <h4>Example Photos:</h4>
                    <div class="example-grid">
                        ${guide.examples.map(ex => `
                            <div class="example">
                                <img src="${ex}" alt="Example">
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button class="btn btn-primary" id="continueToUpload">
                    <i class="fas fa-camera"></i> Continue to Upload
                </button>
            </div>
        `;
        
        // Set up continue button
        const continueBtn = document.getElementById('continueToUpload');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                document.querySelector(`.method-tab[data-method="visual"]`).click();
            });
        }
    }
    
    // Show condition details
    function showConditionDetails(condition) {
        modalBody.innerHTML = `
            <h2>${condition.name}</h2>
            <div class="condition-details">
                <div class="detail-section">
                    <h3><i class="fas fa-info-circle"></i> Overview</h3>
                    <p>${getConditionOverview(condition.id)}</p>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-list-check"></i> Common Symptoms</h3>
                    <ul>
                        ${getConditionSymptoms(condition.id).map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-lightbulb"></i> Self-Care Tips</h3>
                    <ul>
                        ${getConditionTips(condition.id).map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-exclamation-triangle"></i> When to Seek Help</h3>
                    <ul>
                        ${getConditionWarnings(condition.id).map(w => `<li>${w}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Condition detail data functions
    function getConditionOverview(id) {
        const overviews = {
            1: "The common cold is a viral infection of your nose and throat (upper respiratory tract). It's usually harmless, although it might not feel that way.",
            2: "Influenza is a viral infection that attacks your respiratory system — your nose, throat and lungs. Flu is different from cold viruses.",
            3: "Food poisoning results from eating contaminated food. Infectious organisms or their toxins are the most common causes.",
            4: "A migraine is a headache that can cause severe throbbing pain or a pulsing sensation, usually on one side of the head.",
            5: "Eczema is a condition that makes your skin red and itchy. It's common in children but can occur at any age.",
            6: "Asthma is a condition in which your airways narrow and swell and may produce extra mucus.",
            7: "Heartburn is a burning pain in your chest, just behind your breastbone, that often occurs after eating.",
            8: "Pink eye is an inflammation or infection of the transparent membrane that lines your eyelid and covers the white part of your eyeball."
        };
        return overviews[id] || "No overview available.";
    }
    
    function getConditionSymptoms(id) {
        const symptoms = {
            1: ["Runny or stuffy nose", "Sore throat", "Cough", "Congestion", "Slight body aches", "Sneezing", "Low-grade fever"],
            2: ["Fever over 100.4°F", "Muscle aches", "Chills and sweats", "Headache", "Dry cough", "Fatigue", "Nasal congestion"],
            3: ["Nausea", "Vomiting", "Watery diarrhea", "Abdominal pain", "Fever", "Loss of appetite"],
            4: ["Throbbing or pulsing pain", "Sensitivity to light/sound", "Nausea", "Vomiting", "Aura (visual disturbances)"],
            5: ["Dry skin", "Intense itching", "Red to brownish patches", "Small raised bumps", "Thickened skin"],
            6: ["Shortness of breath", "Chest tightness", "Wheezing", "Coughing", "Trouble sleeping due to symptoms"],
            7: ["Burning chest pain after eating", "Pain worsens when lying down", "Bitter taste in mouth", "Difficulty swallowing"],
            8: ["Redness in one or both eyes", "Itchiness in one or both eyes", "Gritty feeling", "Discharge forming crust"]
        };
        return symptoms[id] || ["No symptom information available"];
    }
    
    function getConditionTips(id) {
        const tips = {
            1: ["Drink plenty of fluids", "Rest", "Use saline nasal drops", "Gargle with salt water", "Use over-the-counter cold medicines"],
            2: ["Stay home and rest", "Drink plenty of fluids", "Take pain relievers for aches", "Use antiviral drugs if prescribed early"],
            3: ["Replace lost fluids", "Ease back into eating", "Avoid certain foods until recovered", "Consider probiotics"],
            4: ["Rest in quiet, dark room", "Apply cold or hot compress", "Try relaxation techniques", "Keep a migraine diary"],
            5: ["Moisturize daily", "Identify and avoid triggers", "Use anti-itch products", "Take warm (not hot) baths"],
            6: ["Identify and avoid triggers", "Monitor breathing", "Take medications as prescribed", "Get vaccinated for flu/pneumonia"],
            7: ["Maintain healthy weight", "Avoid tight clothing", "Avoid trigger foods", "Don't lie down after eating"],
            8: ["Apply cool compresses", "Use artificial tears", "Stop wearing contacts", "Practice good hygiene"]
        };
        return tips[id] || ["No self-care tips available"];
    }
    
    function getConditionWarnings(id) {
        const warnings = {
            1: ["Symptoms lasting more than 10 days", "High fever", "Severe sore throat", "Difficulty breathing"],
            2: ["Difficulty breathing", "Persistent chest pain", "Severe weakness", "Worsening symptoms"],
            3: ["Bloody stools", "High fever", "Signs of dehydration", "Symptoms lasting more than 3 days"],
            4: ["Sudden severe headache", "Headache with fever/stiff neck", "Headache after head injury", "Chronic headaches"],
            5: ["Infected eczema (oozing, crusts)", "No improvement with treatment", "Interferes with daily activities"],
            6: ["Quick-relief inhaler doesn't help", "Shortness of breath with minimal activity", "Peak flow meter readings in red zone"],
            7: ["Difficulty swallowing", "Persistent vomiting", "Weight loss due to eating difficulties"],
            8: ["Intense eye pain", "Vision changes", "Sensitivity to light", "Symptoms worsening after 24 hours"]
        };
        return warnings[id] || ["Seek medical attention if symptoms are severe or worsening"];
    }
    
    // Show alert message
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => alertDiv.remove(), 500);
        }, 3000);
    }
});