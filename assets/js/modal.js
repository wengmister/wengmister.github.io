class ProjectModal {
    constructor() {
        this.projectDetails = null;
        this.modal = null;
        this.modalTitle = null;
        this.modalExternalLinks = null;
        this.modalDescription = null;
        this.closeButton = null;
        this.overlay = null;
        
        this.init();
    }

    async init() {
        // Load project metadata from Jekyll's site data
        // Since we can't directly access YAML from JS, we'll use a different approach
        // The YAML data will be embedded in the page or fetched via a JSON endpoint
        
        // Initialize DOM elements
        this.modal = document.getElementById('project-modal');
        if (!this.modal) {
            console.error('Modal element not found');
            return;
        }

        this.modalTitle = this.modal.querySelector('.modal-title');
        this.modalExternalLinks = this.modal.querySelector('.modal-external-links');
        this.modalDescription = this.modal.querySelector('.modal-description');
        this.closeButton = this.modal.querySelector('.modal-close');
        this.overlay = this.modal.querySelector('.modal-overlay');

        this.setupEventListeners();
        this.handleInitialHash();
    }

    setupEventListeners() {
        // Add click listeners to project items
        document.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', () => {
                const projectId = item.getAttribute('data-project-id');
                this.openModal(projectId);
            });
        });

        // Close modal when clicking the close button or overlay
        this.closeButton.addEventListener('click', () => this.closeModal());
        this.overlay.addEventListener('click', () => this.closeModal());

        // Close modal on escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Handle back button
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.projectId) {
                this.openModal(event.state.projectId);
            } else {
                this.closeModal();
            }
        });
    }

    async openModal(projectId) {
        try {
            // Load project metadata from the embedded data
            const projectData = window.projectsData ? window.projectsData[projectId] : null;
            
            if (!projectData) {
                console.error('Project not found:', projectId);
                return;
            }

            // Set modal title
            this.modalTitle.textContent = projectData.title;

            // Render external links
            if (projectData.external_links && projectData.external_links.length > 0) {
                this.modalExternalLinks.innerHTML = projectData.external_links
                    .map(link => `<a href="${link.url}" target="_blank" class="contact-item" style="margin-right: 20px;">${link.text}</a>`)
                    .join(' ');
            } else {
                this.modalExternalLinks.innerHTML = '';
            }

            // Load project content from template file
            const contentResponse = await fetch(`assets/projects/${projectId}.html`);
            if (!contentResponse.ok) {
                throw new Error(`Failed to load project content: ${contentResponse.status}`);
            }
            
            let modalContent = await contentResponse.text();

            // Add technology stack section
            if (projectData.technology && projectData.technology.length > 0) {
                modalContent += `
                    <div class="modal-section">
                        <h3 class="modal-section-title">Technology Stack</h3>
                        <div class="tech-list">
                            ${projectData.technology.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                        </div>
                    </div>
                `;
            }

            this.modalDescription.innerHTML = modalContent;

            this.modal.classList.add('active');
            document.body.classList.add('modal-open');

            // Reset scroll position to top after modal is visible
            setTimeout(() => {
                // Try multiple potential scrollable elements
                const scrollableElements = [
                    this.modal,
                    this.modal.querySelector('.modal-content'),
                    this.modal.querySelector('.modal-body'),
                    this.modalDescription
                ];
                
                scrollableElements.forEach(element => {
                    if (element) {
                        element.scrollTop = 0;
                    }
                });
            }, 10);

            // Update the URL hash
            history.pushState({ projectId: projectId }, '', `#${projectId}`);

        } catch (error) {
            console.error('Error loading project:', error);
            // Fallback: show basic error message
            this.modalDescription.innerHTML = '<p>Sorry, there was an error loading this project.</p>';
            this.modal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        // Revert the URL
        history.pushState(null, '', window.location.pathname);
    }

    handleInitialHash() {
        // Check URL hash on page load
        const initialProjectId = window.location.hash.substring(1);
        if (initialProjectId && window.projectsData && window.projectsData[initialProjectId]) {
            this.openModal(initialProjectId);
        }
    }
}

// Initialize the modal when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProjectModal();
}); 