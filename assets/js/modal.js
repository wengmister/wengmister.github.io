class ProjectModal {
    constructor() {
        this.modal = document.getElementById('project-modal');
        if (!this.modal) return;

        this.modalTitle = this.modal.querySelector('.modal-title');
        this.modalExternalLinks = this.modal.querySelector('.modal-external-links');
        this.modalDescription = this.modal.querySelector('.modal-description');
        this.projectId = null;

        document.addEventListener('click', event => {
            const link = event.target.closest('a[href]');
            if (!link || event.defaultPrevented || event.button !== 0 ||
                event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
                link.target === '_blank') return;

            const url = new URL(link.href);
            if (url.origin !== location.origin || url.pathname !== location.pathname ||
                !window.projectsData[url.hash.substring(1)]) return;

            event.preventDefault();
            if (location.hash !== url.hash) {
                history.pushState({ projectModal: true }, '', url.hash);
            }
            this.syncWithLocation();
        });

        this.modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', event => {
            if (event.target === this.modal) this.closeModal();
        });
        this.modal.addEventListener('cancel', event => {
            event.preventDefault();
            this.closeModal();
        });

        // History traversal renders the URL without creating another history entry.
        window.addEventListener('popstate', () => this.syncWithLocation());
        window.addEventListener('hashchange', () => this.syncWithLocation());
        this.syncWithLocation();
    }

    syncWithLocation() {
        const projectId = location.hash.substring(1);
        if (window.projectsData[projectId]) {
            this.openModal(projectId);
        } else {
            this.hideModal();
        }
    }

    async openModal(projectId) {
        if (this.projectId === projectId && this.modal.open) return;
        this.projectId = projectId;
        const project = window.projectsData[projectId];
        this.modalTitle.textContent = project.title;
        this.modalExternalLinks.innerHTML = (project.external_links || [])
            .map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="contact-item">${link.text}</a>`)
            .join('');
        this.modalDescription.textContent = 'Loading project…';
        if (!this.modal.open) this.modal.showModal();
        this.modal.querySelector('.modal-close').focus();
        document.body.classList.add('modal-open');
        this.modal.scrollTop = 0;

        const request = fetch(`assets/projects/${projectId}.html`, { cache: 'no-cache' });
        this.request = request;
        try {
            const response = await request;
            if (!response.ok) throw new Error(`Project request failed: ${response.status}`);
            let content = await response.text();

            // A slow request must not replace a newer project or reopen a dismissed dialog.
            if (this.request !== request || !this.modal.open) return;
            if (project.technology && project.technology.length) {
                content += `
                    <div class="modal-section">
                        <h3 class="modal-section-title">Technology Stack</h3>
                        <div class="tech-list">
                            ${project.technology.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                        </div>
                    </div>`;
            }
            this.modalDescription.innerHTML = content;
        } catch (error) {
            if (this.request !== request || !this.modal.open) return;
            this.modalDescription.textContent = 'Sorry, there was an error loading this project. Please close it and try again.';
            console.error('Error loading project:', error);
        }
    }

    closeModal() {
        if (!this.modal.open) return;
        this.hideModal();
        if (history.state && history.state.projectModal) {
            history.back();
        } else {
            // A directly loaded project has no in-site entry to return to.
            history.replaceState(null, '', location.pathname + location.search);
        }
    }

    hideModal() {
        this.projectId = null;
        this.request = null;
        if (this.modal.open) this.modal.close();
        document.body.classList.remove('modal-open');
        this.modalDescription.replaceChildren();
    }
}

document.addEventListener('DOMContentLoaded', () => new ProjectModal());
