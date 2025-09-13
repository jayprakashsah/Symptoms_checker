document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map centered on Coimbatore
    let map = L.map('hospital-map').setView([11.0168, 76.9558], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Sample hospital data
    const hospitals = [
        {
            id: 1,
            name: "PSG Hospitals",
            address: "Peelamedu, Avinashi Road, Coimbatore - 641004",
            rating: 4.8,
            waitTime: 20,
            waitTimeLevel: "low",
            specialties: ["emergency", "cardiology", "neurology", "orthopedics"],
            phone: "+91 422 2570170",
            lat: 11.0186,
            lng: 77.0199
        },
        {
            id: 2,
            name: "Kovai Medical Center and Hospital (KMCH)",
            address: "Avanashi Road, Coimbatore - 641014",
            rating: 4.7,
            waitTime: 35,
            waitTimeLevel: "medium",
            specialties: ["emergency", "pediatrics", "oncology", "cardiology"],
            phone: "+91 422 4323800",
            lat: 11.0274,
            lng: 77.0262
        },
        {
            id: 3,
            name: "G. Kuppuswamy Naidu Memorial Hospital",
            address: "Pappanaickenpalayam, Coimbatore - 641037",
            rating: 4.5,
            waitTime: 45,
            waitTimeLevel: "medium",
            specialties: ["emergency", "general surgery", "urology", "ophthalmology"],
            phone: "+91 422 2245000",
            lat: 11.0025,
            lng: 77.0089
        },
        {
            id: 4,
            name: "Sri Ramakrishna Hospital",
            address: "395, Sarojini Naidu Road, Coimbatore - 641044",
            rating: 4.6,
            waitTime: 30,
            waitTimeLevel: "medium",
            specialties: ["emergency", "pediatrics", "dermatology", "ENT"],
            phone: "+91 422 4500000",
            lat: 11.0039,
            lng: 76.9618
        },
        {
            id: 5,
            name: "Aravind Eye Hospital",
            address: "Avanishi Road, Coimbatore - 641014",
            rating: 4.9,
            waitTime: 15,
            waitTimeLevel: "low",
            specialties: ["ophthalmology", "eye emergency"],
            phone: "+91 422 4365000",
            lat: 11.0356,
            lng: 77.0372
        }
    ];
    
    let markers = [];
    let currentLocation = null;
    let currentLocationMarker = null;

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

    // Function to display hospitals on the map and list
    function displayHospitals(filteredHospitals) {
        // Clear previous markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Clear hospital list
        const hospitalList = document.getElementById('hospital-list');
        hospitalList.innerHTML = '';
        
        // Add markers to map and create list items
        filteredHospitals.forEach(hospital => {
            // Calculate distance if we have current location
            let distance = null;
            if (currentLocation) {
                distance = calculateDistance(
                    currentLocation.lat, 
                    currentLocation.lng, 
                    hospital.lat, 
                    hospital.lng
                );
                hospital.distance = distance; // Update the distance property
            }
            
            // Create marker
            const marker = L.marker([hospital.lat, hospital.lng]).addTo(map)
                .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}<br>Wait time: ${hospital.waitTime} mins`);
            markers.push(marker);
            
            // Create list item
            const hospitalCard = document.createElement('div');
            hospitalCard.className = 'hospital-card';
            hospitalCard.dataset.id = hospital.id;
            
            // Determine wait time class
            let waitTimeClass = '';
            if (hospital.waitTime <= 30) waitTimeClass = 'wait-time-low';
            else if (hospital.waitTime <= 60) waitTimeClass = 'wait-time-medium';
            else waitTimeClass = 'wait-time-high';
            
            // Format distance display
            let distanceDisplay = 'Distance not available';
            if (distance !== null) {
                distanceDisplay = `${distance.toFixed(1)} km away`;
            }
            
            hospitalCard.innerHTML = `
                <div class="hospital-header">
                    <div>
                        <h3 class="hospital-name">${hospital.name}</h3>
                        <div class="hospital-distance">
                            <i class="fas fa-location-arrow"></i> ${distanceDisplay}
                        </div>
                    </div>
                    <div class="hospital-rating">
                        <i class="fas fa-star"></i> ${hospital.rating}
                    </div>
                </div>
                <div class="hospital-details">
                    <div class="hospital-detail">
                        <i class="fas fa-map-marker-alt"></i> ${hospital.address}
                    </div>
                    <div class="hospital-detail">
                        <i class="fas fa-phone"></i> ${hospital.phone}
                    </div>
                    <div class="hospital-detail">
                        <i class="fas fa-clock"></i> 
                        <span class="hospital-wait-time ${waitTimeClass}">
                            Wait time: ${hospital.waitTime} mins
                        </span>
                    </div>
                </div>
                <div class="hospital-actions">
                    <button class="btn-directions" data-id="${hospital.id}">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                    <button class="btn-call" data-id="${hospital.id}">
                        <i class="fas fa-phone"></i> Call
                    </button>
                </div>
            `;
            
            hospitalList.appendChild(hospitalCard);
            
            // Add click event to center map on hospital
            hospitalCard.addEventListener('click', function() {
                map.setView([hospital.lat, hospital.lng], 15);
                marker.openPopup();
                
                // Highlight selected hospital
                document.querySelectorAll('.hospital-card').forEach(card => {
                    card.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
        
        // Fit map to show all markers plus current location if available
        if (filteredHospitals.length > 0) {
            const group = new L.featureGroup(markers);
            if (currentLocationMarker) {
                group.addLayer(currentLocationMarker);
            }
            map.fitBounds(group.getBounds().pad(0.2));
        }
    }

    // Function to filter hospitals based on user input
    function filterHospitals() {
        const specialty = document.getElementById('specialty-filter').value;
        const distanceFilter = parseInt(document.getElementById('distance-filter').value);
        const locationInput = document.getElementById('location-input').value.toLowerCase();
        
        let filtered = hospitals;
        
        // Filter by specialty
        if (specialty) {
            filtered = filtered.filter(hospital => 
                hospital.specialties.includes(specialty)
            );
        }
        
        // Filter by distance (only if we have current location)
        if (currentLocation) {
            filtered = filtered.filter(hospital => {
                const dist = calculateDistance(
                    currentLocation.lat, 
                    currentLocation.lng, 
                    hospital.lat, 
                    hospital.lng
                );
                return dist <= distanceFilter;
            });
        } else {
            // If no current location, we can't filter by distance
            // So we'll show all hospitals (or you could choose to show none)
        }
        
        // Filter by location search (if any)
        if (locationInput && locationInput !== "current location") {
            filtered = filtered.filter(hospital => 
                hospital.name.toLowerCase().includes(locationInput) || 
                hospital.address.toLowerCase().includes(locationInput)
            );
        }
        
        // Sort by active sort option
        const activeSort = document.querySelector('.sort-btn.active').dataset.sort;
        if (activeSort === 'distance' && currentLocation) {
            filtered.sort((a, b) => {
                const distA = calculateDistance(currentLocation.lat, currentLocation.lng, a.lat, a.lng);
                const distB = calculateDistance(currentLocation.lat, currentLocation.lng, b.lat, b.lng);
                return distA - distB;
            });
        } else if (activeSort === 'wait-time') {
            filtered.sort((a, b) => a.waitTime - b.waitTime);
        } else if (activeSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }
        
        displayHospitals(filtered);
    }

    // Event listeners
    document.getElementById('search-btn').addEventListener('click', filterHospitals);
    
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
                    
                    // Filter hospitals based on new location
                    filterHospitals();
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
            filterHospitals();
        });
    });
    
    // Call button delegation
    document.getElementById('hospital-list').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-call') || e.target.closest('.btn-call')) {
            const button = e.target.classList.contains('btn-call') ? e.target : e.target.closest('.btn-call');
            const hospitalId = parseInt(button.dataset.id);
            const hospital = hospitals.find(h => h.id === hospitalId);
            if (hospital) {
                // In a real app, this would initiate a phone call
                alert(`Calling ${hospital.name} at ${hospital.phone}`);
            }
        }
        
        if (e.target.classList.contains('btn-directions') || e.target.closest('.btn-directions')) {
            const button = e.target.classList.contains('btn-directions') ? e.target : e.target.closest('.btn-directions');
            const hospitalId = parseInt(button.dataset.id);
            const hospital = hospitals.find(h => h.id === hospitalId);
            if (hospital && currentLocation) {
                // Open Google Maps with directions
                const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${hospital.lat},${hospital.lng}&travelmode=driving`;
                window.open(url, '_blank');
            } else if (hospital) {
                // If no current location, just show the hospital location
                const url = `https://www.google.com/maps?q=${hospital.lat},${hospital.lng}`;
                window.open(url, '_blank');
            }
        }
    });
    
    // Initial display of all hospitals
    filterHospitals();
});