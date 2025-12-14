/**
 * ==========================================================================
 * CRYZEN'S FUTURISTIC PORTFOLIO - MAIN JAVASCRIPT
 * Handles animations, interactions, accordion, and the animated background
 * ==========================================================================
 */

// ==========================================================================
// ANIMATED BACKGROUND - Particle System
// ==========================================================================

class ParticleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.connectionDistance = 150;
        this.mouseRadius = 150;
        this.mouse = { x: null, y: null };
        
        this.colors = [
            'rgba(0, 245, 255, 0.8)',
            'rgba(123, 47, 247, 0.8)',
            'rgba(255, 0, 255, 0.6)',
            'rgba(0, 200, 255, 0.7)'
        ];
        
        this.init();
        this.animate();
        this.bindEvents();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        const screenArea = window.innerWidth * window.innerHeight;
        this.particleCount = Math.floor(screenArea / 15000);
        this.particleCount = Math.min(Math.max(this.particleCount, 30), 100);
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                pulse: Math.random() * Math.PI * 2
            });
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    updateParticles() {
        for (let particle of this.particles) {
            particle.pulse += 0.02;
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
            
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = particle.x - this.mouse.x;
                const dy = particle.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouseRadius) {
                    const force = (this.mouseRadius - distance) / this.mouseRadius;
                    particle.x += (dx / distance) * force * 2;
                    particle.y += (dy / distance) * force * 2;
                }
            }
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawConnections();
        
        for (let particle of this.particles) {
            const pulseSize = particle.size + Math.sin(particle.pulse) * 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = particle.color;
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const opacity = 1 - (distance / this.connectionDistance);
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(0, 245, 255, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        this.updateParticles();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ==========================================================================
// PROJECTS LOADER - Loads projects from JSON file
// ==========================================================================

class ProjectsLoader {
    constructor(containerId, jsonPath) {
        this.container = document.getElementById(containerId);
        this.jsonPath = jsonPath;
        this.projects = [];
        this.init();
    }
    
    async init() {
        await this.loadProjects();
        this.renderProjects();
        this.initEffects();
    }
    
    async loadProjects() {
        try {
            const response = await fetch(this.jsonPath);
            if (!response.ok) {
                throw new Error('Failed to load projects');
            }
            const data = await response.json();
            this.projects = data.projects || [];
        } catch (error) {
            console.error('Error loading projects:', error);
            this.container.innerHTML = '<p class="error-message">Unable to load projects. Please try again later.</p>';
        }
    }
    
    renderProjects() {
        if (this.projects.length === 0) return;
        
        this.container.innerHTML = '';
        
        this.projects.forEach((project, index) => {
            const article = document.createElement('article');
            article.className = `bento-item${project.featured ? ' bento-large' : ''}`;
            article.dataset.project = project.id;
            article.style.opacity = '0';
            article.style.transform = 'translateY(30px)';
            article.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            const tagsHTML = project.tags.map(tag => 
                `<span class="tag">${this.escapeHTML(tag)}</span>`
            ).join('');
            
            article.innerHTML = `
                <div class="project-image">
                    <div class="project-placeholder">
                        <span class="placeholder-icon">${project.icon || '📁'}</span>
                    </div>
                </div>
                <div class="project-content">
                    <h3>${this.escapeHTML(project.title)}</h3>
                    <p>${this.escapeHTML(project.description)}</p>
                    <div class="project-tags">
                        ${tagsHTML}
                    </div>
                    <div class="project-links">
                        ${project.liveUrl ? `<a href="${this.escapeHTML(project.liveUrl)}" class="project-link" target="_blank" rel="noopener">View Live</a>` : ''}
                        ${project.sourceUrl ? `<a href="${this.escapeHTML(project.sourceUrl)}" class="project-link" target="_blank" rel="noopener">Source Code</a>` : ''}
                    </div>
                </div>
            `;
            
            if (project.liveUrl && project.liveUrl !== '#') {
                article.style.cursor = 'pointer';
                article.addEventListener('click', (e) => {
                    if (!e.target.closest('.project-link')) {
                        window.open(project.liveUrl, '_blank', 'noopener');
                    }
                });
            }
            
            this.container.appendChild(article);
            
            setTimeout(() => {
                article.style.opacity = '1';
                article.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }
    
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    initEffects() {
        const items = this.container.querySelectorAll('.bento-item');
        
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                items.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.style.opacity = '0.7';
                    }
                });
            });
            
            item.addEventListener('mouseleave', () => {
                items.forEach(otherItem => {
                    otherItem.style.opacity = '1';
                });
            });
        });
    }
}

// ==========================================================================
// NAVIGATION
// ==========================================================================

class Navigation {
    constructor() {
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links');
        this.navbar = document.querySelector('.navbar');
        this.init();
    }
    
    init() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.mobileMenuBtn.classList.toggle('active');
                this.navLinks.classList.toggle('active');
            });
        }
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                this.mobileMenuBtn.classList.remove('active');
                this.navLinks.classList.remove('active');
            });
        });
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.style.background = 'rgba(10, 10, 15, 0.95)';
            } else {
                this.navbar.style.background = 'rgba(10, 10, 15, 0.8)';
            }
        });
    }
}

// ==========================================================================
// SKILLS ACCORDION
// ==========================================================================

class SkillsAccordion {
    constructor() {
        this.accordionItems = document.querySelectorAll('.accordion-item');
        this.init();
    }
    
    init() {
        this.accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                this.accordionItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
}

// ==========================================================================
// SCROLL ANIMATIONS
// ==========================================================================

class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.accordion-item');
        this.init();
    }
    
    init() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, observerOptions);
        
        this.animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(element);
        });
    }
}

// ==========================================================================
// SKILL CARDS HOVER EFFECT
// ==========================================================================

class SkillCardEffects {
    constructor() {
        this.cards = document.querySelectorAll('.skill-card');
        this.init();
    }
    
    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
}

// ==========================================================================
// SMOOTH SCROLL
// ==========================================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    new ParticleBackground('bg-canvas');
    new Navigation();
    new SkillsAccordion();
    new ScrollAnimations();
    new SkillCardEffects();
    new ProjectsLoader('projects-grid', 'data/projects.json');
    initSmoothScroll();
    
    console.log('Cryzen Portfolio initialized successfully!');
});
