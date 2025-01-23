document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const pagination = document.querySelector('.pagination');
    
    // Clone first and last slides for smooth infinite loop
    const firstSlideClone = slides[0].cloneNode(true);
    const lastSlideClone = slides[slides.length - 1].cloneNode(true);
    slider.appendChild(firstSlideClone);
    slider.insertBefore(lastSlideClone, slider.firstChild);
    
    let currentIndex = 1; // Start at 1 since we added a clone at the beginning
    let startY;
    let currentTranslateY = 0;
    let prevTranslateY = 0;
    let animationID;
    let isDragging = false;
    
    // Create pagination dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        pagination.appendChild(dot);
    });
    
    function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    }

    function setSliderPosition() {
        slider.style.transform = `translateY(${currentTranslateY}px)`;
    }

    function dragStart(event) {
        event.preventDefault();
        event.stopPropagation();
        startY = event.type === 'mousedown' ? event.pageY : event.touches[0].pageY;
        isDragging = true;
        slider.classList.add('grabbing');
        
        cancelAnimationFrame(animationID);
        animationID = requestAnimationFrame(animation);
    }

    function dragMove(event) {
        if (!isDragging) return;
        
        event.preventDefault();
        event.stopPropagation();
        const currentY = event.type === 'mousemove' ? event.pageY : event.touches[0].pageY;
        const diff = currentY - startY;
        currentTranslateY = prevTranslateY + diff;
        
        const slideHeight = slides[0].offsetHeight + 30;
        const maxTranslate = slideHeight;
        const minTranslate = -(slides.length + 2) * slideHeight;
        currentTranslateY = Math.max(Math.min(currentTranslateY, maxTranslate), minTranslate);
    }

    function dragEnd() {
        isDragging = false;
        slider.classList.remove('grabbing');
        
        const slideHeight = slides[0].offsetHeight + 30;
        const nearestSlide = Math.round(Math.abs(currentTranslateY) / slideHeight);
        currentIndex = nearestSlide;
        
        // Handle infinite loop
        if (currentIndex >= slides.length + 1) {
            currentIndex = 1;
            slider.style.transition = 'none';
            currentTranslateY = -currentIndex * slideHeight;
            prevTranslateY = currentTranslateY;
            setSliderPosition();
            
            requestAnimationFrame(() => {
                slider.style.transition = 'transform 0.5s ease-in-out';
            });
        } else if (currentIndex === 0) {
            currentIndex = slides.length;
            slider.style.transition = 'none';
            currentTranslateY = -currentIndex * slideHeight;
            prevTranslateY = currentTranslateY;
            setSliderPosition();
            
            requestAnimationFrame(() => {
                slider.style.transition = 'transform 0.5s ease-in-out';
            });
        }
        
        currentTranslateY = -currentIndex * slideHeight;
        prevTranslateY = currentTranslateY;
        
        slider.style.transition = 'transform 0.5s ease-in-out';
        updateSlider();
        
        // Update pagination dots (adjust for cloned slides)
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === (currentIndex - 1) % slides.length);
        });
    }

    slider.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);

    slider.addEventListener('touchstart', dragStart);
    slider.addEventListener('touchmove', dragMove);
    slider.addEventListener('touchend', dragEnd);

    slider.addEventListener('contextmenu', (e) => e.preventDefault());

    function updateSlider() {
        const slideHeight = slides[0].offsetHeight + 30;
        currentTranslateY = -currentIndex * slideHeight;
        prevTranslateY = currentTranslateY;
        setSliderPosition();
        
        // Update pagination dots (adjust for cloned slides)
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === (currentIndex - 1) % slides.length);
        });
    }

    function goToSlide(index) {
        const slideHeight = slides[0].offsetHeight + 30;
        currentIndex = index + 1; // Adjust for cloned slide at beginning
        
        currentTranslateY = -currentIndex * slideHeight;
        prevTranslateY = currentTranslateY;
        slider.style.transition = 'transform 0.5s ease-in-out';
        updateSlider();
    }
    
    updateSlider();
    window.addEventListener('resize', updateSlider);

    // Prevent default drag behavior on images
    const images = document.querySelectorAll('.slide img');
    images.forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
        img.addEventListener('mousedown', (e) => e.preventDefault());
    });
});
