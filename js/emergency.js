document.addEventListener('DOMContentLoaded', function() {
    // SOS Button Functionality
    const sosButton = document.getElementById('sosButton');
    const sosStatus = document.getElementById('sosStatus');
    
    if (sosButton && sosStatus) {
        sosButton.addEventListener('click', async function() {
            try {
                // Change status to alerting
                sosStatus.className = 'sos-status alerting';
                sosStatus.innerHTML = `
                    <div class="status-content">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Alerting emergency services...</p>
                    </div>
                `;
                
                // Get user's location
                const position = await getLocation();
                const { latitude, longitude } = position.coords;
                
                // In a real app, this would send to your backend
                console.log('Emergency at:', latitude, longitude);
                
                // Simulate API call
                setTimeout(() => {
                    sosStatus.className = 'sos-status success';
                    sosStatus.innerHTML = `
                        <div class="status-content">
                            <i class="fas fa-check-circle"></i>
                            <p>Help is on the way! ETA: 7 minutes</p>
                        </div>
                    `;
                    
                    // Create emergency alert on the button
                    const alertElement = document.createElement('div');
                    alertElement.className = 'sos-alert';
                    alertElement.innerHTML = `
                        <i class="fas fa-ambulance"></i>
                        <span>Emergency Reported</span>
                    `;
                    sosButton.appendChild(alertElement);
                    
                    // Disable button temporarily
                    sosButton.disabled = true;
                    setTimeout(() => {
                        sosButton.disabled = false;
                        alertElement.remove();
                    }, 30000); // 30 seconds
                }, 2000);
                
            } catch (error) {
                sosStatus.className = 'sos-status';
                sosStatus.innerHTML = `
                    <div class="status-content">
                        <i class="fas fa-times-circle"></i>
                        <p>Error: ${error.message}</p>
                    </div>
                `;
                console.error('Emergency error:', error);
            }
        });
    }
    
    // Helper function to get location
    function getLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            } else {
                reject(new Error("Geolocation is not supported by this browser."));
            }
        });
    }
    
    // Accordion functionality for emergency guides
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            // Close all other items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.display = 'none';
                    otherItem.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            const content = item.querySelector('.accordion-content');
            const chevron = item.querySelector('.fa-chevron-down');
            
            if (item.classList.contains('active')) {
                content.style.display = 'flex';
                chevron.style.transform = 'rotate(180deg)';
            } else {
                content.style.display = 'none';
                chevron.style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Open specific guide if URL has hash
    if (window.location.hash) {
        const guideId = window.location.hash.substring(1);
        const guideItem = document.getElementById(guideId);
        
        if (guideItem) {
            // Close all first
            accordionItems.forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-content').style.display = 'none';
                item.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
            });
            
            // Open requested guide
            guideItem.classList.add('active');
            guideItem.querySelector('.accordion-content').style.display = 'flex';
            guideItem.querySelector('.fa-chevron-down').style.transform = 'rotate(180deg)';
            
            // Scroll to guide
            setTimeout(() => {
                guideItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
});