document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle-btn');
    const dropdown = document.getElementById('theme-dropdown');
    const options = document.querySelectorAll('.theme-option');
    const audio = document.getElementById('axomia-audio');

    let audioStarted = false;

    // Load saved theme and set it
    const saved = localStorage.getItem('selectedTheme') || 'normal';
    setTheme(saved);

    // Toggle dropdown on button click
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        
        // Play audio on first user interaction if normal theme is active
        if (!audioStarted && document.body.classList.contains('theme-normal')) {
            audioStarted = true;
            audio.play().catch(() => { /* ignore play promise rejection */ });
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.theme-selector-container')) {
            dropdown.classList.remove('active');
        }
    });

    // Theme selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            setTheme(theme);
            localStorage.setItem('selectedTheme', theme);
            dropdown.classList.remove('active');

            if (theme === 'normal' && !audioStarted) {
                audioStarted = true;
                audio.play().catch(() => { /* ignore */ });
            }
        });
    });

    // Theme setter function
    function setTheme(theme) {
        document.body.className = `theme-${theme}`;
        if (theme === 'normal') {
            if (audioStarted) {
                audio.currentTime = 0;
                audio.play().catch(() => { /* ignore */ });
            }
        } else {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }

    // Navigation function
    window.navigateTo = (page) => {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        setTimeout(() => {
            if (page === 'home') document.getElementById('homepage').classList.add('active');
            else if (page === 'notes') document.getElementById('notes-page').classList.add('active');
            else if (page === 'papers') document.getElementById('papers-page').classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    // Tab switching
    window.switchTab = (event, num, type) => {
        const card = event.target.closest('.module-card');
        if (!card) return;

        card.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');

        card.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const content = document.getElementById(`module-${num}-${type}`);
        if (content) content.classList.add('active');
    };

    // Keyboard escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const current = document.querySelector('.page.active');
            if (current && current.id !== 'homepage') navigateTo('home');
        }
    });
});
