// Navigation function
function navigateTo(page) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        p.classList.remove('active');
    });
    
    // Show selected page with animation
    setTimeout(() => {
        if (page === 'home') {
            document.getElementById('homepage').classList.add('active');
        } else if (page === 'notes') {
            document.getElementById('notes-page').classList.add('active');
        } else if (page === 'papers') {
            document.getElementById('papers-page').classList.add('active');
        }
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

// Tab switching function
function switchTab(event, moduleNumber, tabType) {
    // Get the parent module card
    const moduleCard = event.target.closest('.module-card');
    
    // Remove active class from all tabs in this module
    const tabs = moduleCard.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Hide all tab contents in this module
    const tabContents = moduleCard.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Show selected tab content
    const targetContent = document.getElementById(`module-${moduleNumber}-${tabType}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const currentPage = document.querySelector('.page.active').id;
        if (currentPage !== 'homepage') {
            navigateTo('home');
        }
    }
});

// Add intersection observer for scroll animations (optional enhancement)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all module cards when they're created
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.module-card, .question-paper-card');
    cards.forEach(card => {
        observer.observe(card);
    });
});

// Add smooth hover effect for main cards
const mainCards = document.querySelectorAll('.main-card');
mainCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
});

// Initialize
console.log('MCA Notes Hub - Application Loaded');
console.log('Navigate using the buttons or press ESC to return to home');