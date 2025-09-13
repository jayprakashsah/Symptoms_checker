// home.js - Home page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Testimonial slider
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    let currentTestimonial = 0;
    
    if (testimonials.length > 0) {
        // Show first testimonial
        testimonials[currentTestimonial].classList.add('active');
        
        // Next testimonial
        function showNextTestimonial() {
            testimonials[currentTestimonial].classList.remove('active');
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].classList.add('active');
        }
        
        // Previous testimonial
        function showPrevTestimonial() {
            testimonials[currentTestimonial].classList.remove('active');
            currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
            testimonials[currentTestimonial].classList.add('active');
        }
        
        // Button event listeners
        if (nextBtn) nextBtn.addEventListener('click', showNextTestimonial);
        if (prevBtn) prevBtn.addEventListener('click', showPrevTestimonial);
        
        // Auto-rotate testimonials every 5 seconds
        setInterval(showNextTestimonial, 5000);
    }
    
    // Animate elements when scrolling
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .quick-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial state for animated elements
    const features = document.querySelectorAll('.feature-card');
    const quickCards = document.querySelectorAll('.quick-card');
    
    features.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    quickCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s';
    });
    
    // Run animation on scroll
    window.addEventListener('scroll', animateOnScroll);
    // Run once on page load
    animateOnScroll();
});