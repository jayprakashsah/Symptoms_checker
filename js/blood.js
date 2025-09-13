document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map centered on Coimbatore
    let map = L.map('bloodbank-map').setView([11.0168, 76.9558], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Sample blood bank data for Coimbatore
    const bloodBanks = [
        {
            id: 1,
            name: "PSG Blood Bank",
            address: "PSG Hospitals, Peelamedu, Coimbatore - 641004",
            rating: 4.8,
            phone: "+91 422 2570170",
            lat: 11.0186,
            lng: 77.0199,
            bloodTypes: {
                "A+": "available",
                "A-": "limited",
                "B+": "available",
                "B-": "critical",
                "AB+": "available",
                "AB-": "limited",
                "O+": "critical",
                "O-": "limited"
            }
        },
        {
            id: 2,
            name: "KMCH Blood Bank",
            address: "Kovai Medical Center, Avanashi Road, Coimbatore - 641014",
            rating: 4.7,
            phone: "+91 422 4323800",
            lat: 11.0274,
            lng: 77.0262,
            bloodTypes: {
                "A+": "available",
                "A-": "critical",
                "B+": "available",
                "B-": "limited",
                "AB+": "limited",
                "AB-": "critical",
                "O+": "critical",
                "O-": "critical"
            }
        },
        {
            id: 3,
            name: "Government Blood Bank",
            address: "Coimbatore Medical College, Coimbatore - 641018",
            rating: 4.3,
            phone: "+91 422 2245000",
            lat: 11.0025,
            lng: 77.0089,
            bloodTypes: {
                "A+": "limited",
                "A-": "limited",
                "B+": "available",
                "B-": "limited",
                "AB+": "critical",
                "AB-": "critical",
                "O+": "available",
                "O-": "limited"
            }
        },
        {
            id: 4,
            name: "Rotary Blood Bank",
            address: "RS Puram, Coimbatore - 641002",
            rating: 4.6,
            phone: "+91 422 2388888",
            lat: 11.0039,
            lng: 76.9618,
            bloodTypes: {
                "A+": "available",
                "A-": "available",
                "B+": "available",
                "B-": "limited",
                "AB+": "available",
                "AB-": "limited",
                "O+": "available",
                "O-": "limited"
            }
        },
        {
            id: 5,
            name: "Lions Blood Bank",
            address: "Gandhipuram, Coimbatore - 641012",
            rating: 4.5,
            phone: "+91 422 2498888",
            lat: 11.0356,
            lng: 77.0372,
            bloodTypes: {
                "A+": "available",
                "A-": "limited",
                "B+": "critical",
                "B-": "critical",
                "AB+": "limited",
                "AB-": "critical",
                "O+": "available",
                "O-": "critical"
            }
        }
    ];

    let markers = [];
    let currentLocation = null;
    let currentLocationMarker = null;
    let selectedBloodType = '';

    // Function to calculate distance between two coordinates in km (Haversine formula)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        return distance;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Function to display blood banks on the map and list
    function displayBloodBanks(filteredBloodBanks) {
        // Clear previous markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Clear blood bank list
        const bloodBankList = document.getElementById('bloodbank-list');
        bloodBankList.innerHTML = '';
        
        // Add markers to map and create list items
        filteredBloodBanks.forEach(bloodBank => {
            // Calculate distance if we have current location
            let distance = null;
            if (currentLocation) {
                distance = calculateDistance(
                    currentLocation.lat, 
                    currentLocation.lng, 
                    bloodBank.lat, 
                    bloodBank.lng
                );
                bloodBank.distance = distance; // Update the distance property
            }
            
            // Create marker
            const marker = L.marker([bloodBank.lat, bloodBank.lng]).addTo(map)
                .bindPopup(`<b>${bloodBank.name}</b><br>${bloodBank.address}`);
            markers.push(marker);
            
            // Create list item
            const bloodBankCard = document.createElement('div');
            bloodBankCard.className = 'bloodbank-card';
            bloodBankCard.dataset.id = bloodBank.id;
            
            // Get availability for selected blood type or general status
            let availabilityStatus = '';
            let availabilityClass = '';
            
            if (selectedBloodType) {
                availabilityStatus = bloodBank.bloodTypes[selectedBloodType];
                availabilityClass = availabilityStatus;
                availabilityStatus = availabilityStatus.charAt(0).toUpperCase() + availabilityStatus.slice(1);
            } else {
                // Count available types
                const availableCount = Object.values(bloodBank.bloodTypes).filter(status => status === 'available').length;
                const totalTypes = Object.keys(bloodBank.bloodTypes).length;
                
                if (availableCount === totalTypes) {
                    availabilityStatus = 'All Available';
                    availabilityClass = 'available';
                } else if (availableCount >= totalTypes / 2) {
                    availabilityStatus = 'Most Available';
                    availabilityClass = 'available';
                } else if (availableCount > 0) {
                    availabilityStatus = 'Some Available';
                    availabilityClass = 'limited';
                } else {
                    availabilityStatus = 'Critical';
                    availabilityClass = 'critical';
                }
            }
            
            // Format distance display
            let distanceDisplay = 'Distance not available';
            if (distance !== null) {
                distanceDisplay = `${distance.toFixed(1)} km away`;
            }
            
            bloodBankCard.innerHTML = `
                <div class="bloodbank-header">
                    <div>
                        <h3 class="bloodbank-name">${bloodBank.name}</h3>
                        <div class="bloodbank-distance">
                            <i class="fas fa-location-arrow"></i> ${distanceDisplay}
                        </div>
                    </div>
                    <div class="bloodbank-rating">
                        <i class="fas fa-star"></i> ${bloodBank.rating}
                    </div>
                </div>
                <div class="bloodbank-details">
                    <div class="bloodbank-detail">
                        <i class="fas fa-map-marker-alt"></i> ${bloodBank.address}
                    </div>
                    <div class="bloodbank-detail">
                        <i class="fas fa-phone"></i> ${bloodBank.phone}
                    </div>
                    <div class="bloodbank-detail">
                        <i class="fas fa-tint"></i> 
                        <span class="availability ${availabilityClass}">
                            ${availabilityStatus}
                        </span>
                    </div>
                </div>
                <div class="bloodbank-actions">
                    <button class="btn-directions" data-id="${bloodBank.id}">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                    <button class="btn-call" data-id="${bloodBank.id}">
                        <i class="fas fa-phone"></i> Call
                    </button>
                    <button class="btn-request" data-id="${bloodBank.id}">
                        <i class="fas fa-hand-holding-heart"></i> Request Blood
                    </button>
                </div>
            `;
            
            bloodBankList.appendChild(bloodBankCard);
            
            // Add click event to center map on blood bank
            bloodBankCard.addEventListener('click', function() {
                map.setView([bloodBank.lat, bloodBank.lng], 15);
                marker.openPopup();
                
                // Highlight selected blood bank
                document.querySelectorAll('.bloodbank-card').forEach(card => {
                    card.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
        
        // Fit map to show all markers plus current location if available
        if (filteredBloodBanks.length > 0) {
            const group = new L.featureGroup(markers);
            if (currentLocationMarker) {
                group.addLayer(currentLocationMarker);
            }
            map.fitBounds(group.getBounds().pad(0.2));
        }
    }

    // Function to filter blood banks based on user input
    function filterBloodBanks() {
        const bloodType = document.getElementById('blood-type-filter').value;
        const distanceFilter = parseInt(document.getElementById('distance-filter').value);
        const locationInput = document.getElementById('location-input').value.toLowerCase();
        
        let filtered = bloodBanks;
        
        // Filter by distance (only if we have current location)
        if (currentLocation) {
            filtered = filtered.filter(bloodBank => {
                const dist = calculateDistance(
                    currentLocation.lat, 
                    currentLocation.lng, 
                    bloodBank.lat, 
                    bloodBank.lng
                );
                return dist <= distanceFilter;
            });
        } else {
            // If no current location, we can't filter by distance
            // So we'll show all blood banks (or you could choose to show none)
        }
        
        // Filter by location search (if any)
        if (locationInput && locationInput !== "current location") {
            filtered = filtered.filter(bloodBank => 
                bloodBank.name.toLowerCase().includes(locationInput) || 
                bloodBank.address.toLowerCase().includes(locationInput)
            );
        }
        
        // Filter by blood type availability if selected
        if (bloodType) {
            selectedBloodType = bloodType;
            filtered = filtered.filter(bloodBank => 
                bloodBank.bloodTypes[bloodType] !== 'critical'
            );
        } else {
            selectedBloodType = '';
        }
        
        // Sort by active sort option
        const activeSort = document.querySelector('.sort-btn.active').dataset.sort;
        if (activeSort === 'distance' && currentLocation) {
            filtered.sort((a, b) => {
                const distA = calculateDistance(currentLocation.lat, currentLocation.lng, a.lat, a.lng);
                const distB = calculateDistance(currentLocation.lat, currentLocation.lng, b.lat, b.lng);
                return distA - distB;
            });
        } else if (activeSort === 'availability') {
            // Sort by worst availability status
            filtered.sort((a, b) => {
                const aCritical = Object.values(a.bloodTypes).filter(status => status === 'critical').length;
                const bCritical = Object.values(b.bloodTypes).filter(status => status === 'critical').length;
                return bCritical - aCritical;
            });
        } else if (activeSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }
        
        displayBloodBanks(filtered);
    }

    // Event listeners
    document.getElementById('search-btn').addEventListener('click', filterBloodBanks);
    
    // Current location button
    document.getElementById('current-location-btn').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Remove previous current location marker if exists
                    if (currentLocationMarker) {
                        map.removeLayer(currentLocationMarker);
                    }
                    
                    // Add new current location marker
                    currentLocationMarker = L.marker([currentLocation.lat, currentLocation.lng], {
                        icon: L.divIcon({
                            className: 'current-location-marker',
                            html: '<i class="fas fa-map-marker-alt" style="color: #e74c3c; font-size: 24px;"></i>',
                            iconSize: [24, 24],
                            iconAnchor: [12, 24]
                        })
                    }).addTo(map)
                    .bindPopup("Your current location");
                    
                    map.setView([currentLocation.lat, currentLocation.lng], 13);
                    document.getElementById('location-input').value = "Current Location";
                    
                    // Filter blood banks based on new location
                    filterBloodBanks();
                },
                function(error) {
                    alert("Unable to retrieve your location. Please enter it manually.");
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser. Please enter your location manually.");
        }
    });
    
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.sort-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            filterBloodBanks();
        });
    });
    
    // Blood type cards in availability section
    document.querySelectorAll('.blood-type-card').forEach(card => {
        card.addEventListener('click', function() {
            const bloodType = this.dataset.type;
            document.getElementById('blood-type-filter').value = bloodType;
            
            // Highlight selected card
            document.querySelectorAll('.blood-type-card').forEach(c => {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
            
            filterBloodBanks();
        });
    });
    
    // Call button delegation
    document.getElementById('bloodbank-list').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-call') || e.target.closest('.btn-call')) {
            const button = e.target.classList.contains('btn-call') ? e.target : e.target.closest('.btn-call');
            const bloodBankId = parseInt(button.dataset.id);
            const bloodBank = bloodBanks.find(b => b.id === bloodBankId);
            if (bloodBank) {
                // In a real app, this would initiate a phone call
                alert(`Calling ${bloodBank.name} at ${bloodBank.phone}`);
            }
        }
        
        if (e.target.classList.contains('btn-directions') || e.target.closest('.btn-directions')) {
            const button = e.target.classList.contains('btn-directions') ? e.target : e.target.closest('.btn-directions');
            const bloodBankId = parseInt(button.dataset.id);
            const bloodBank = bloodBanks.find(b => b.id === bloodBankId);
            if (bloodBank && currentLocation) {
                // Open Google Maps with directions
                const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${bloodBank.lat},${bloodBank.lng}&travelmode=driving`;
                window.open(url, '_blank');
            } else if (bloodBank) {
                // If no current location, just show the blood bank location
                const url = `https://www.google.com/maps?q=${bloodBank.lat},${bloodBank.lng}`;
                window.open(url, '_blank');
            }
        }
        
        if (e.target.classList.contains('btn-request') || e.target.closest('.btn-request')) {
            const button = e.target.classList.contains('btn-request') ? e.target : e.target.closest('.btn-request');
            const bloodBankId = parseInt(button.dataset.id);
            const bloodBank = bloodBanks.find(b => b.id === bloodBankId);
            if (bloodBank) {
                // Show blood request form
                showBloodRequestForm(bloodBank);
            }
        }
    });

    // Function to show blood request form
    function showBloodRequestForm(bloodBank) {
        const formHtml = `
            <div class="request-form-overlay">
                <div class="request-form">
                    <h3>Request Blood from ${bloodBank.name}</h3>
                    <form id="blood-request-form">
                        <div class="form-group">
                            <label for="patient-name">Patient Name</label>
                            <input type="text" id="patient-name" required>
                        </div>
                        <div class="form-group">
                            <label for="blood-type">Blood Type Needed</label>
                            <select id="blood-type" required>
                                <option value="">Select Blood Type</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="units-needed">Units Needed</label>
                            <input type="number" id="units-needed" min="1" value="1" required>
                        </div>
                        <div class="form-group">
                            <label for="urgency">Urgency</label>
                            <select id="urgency" required>
                                <option value="normal">Normal (Within 24 hours)</option>
                                <option value="urgent">Urgent (Within 6 hours)</option>
                                <option value="emergency">Emergency (Immediately)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="contact-number">Contact Number</label>
                            <input type="tel" id="contact-number" required>
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="btn-submit">Submit Request</button>
                            <button type="button" class="btn-cancel">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHtml);
        
        // Add event listeners for the form
        document.getElementById('blood-request-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Blood request submitted successfully!');
            document.querySelector('.request-form-overlay').remove();
        });
        
        document.querySelector('.btn-cancel').addEventListener('click', function() {
            document.querySelector('.request-form-overlay').remove();
        });
    }

    // Initial display of all blood banks
    filterBloodBanks();
});