
class AdminDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.loadApplications();
        this.loadComplaints();
        this.loadStats();
        this.setupSearch();
        this.setupAutoRefresh();
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        
        // Add active class to clicked button
        event.target.classList.add('active');
    }

    loadApplications() {
        const applications = JSON.parse(localStorage.getItem('moderator_applications') || '[]');
        const container = document.getElementById('applicationsContainer');
        
        if (applications.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Henüz başvuru bulunmuyor.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = applications.map(app => `
            <div class="data-card" data-searchable="${app.name} ${app.robloxName} ${app.discordName}">
                <div class="data-header">
                    <h3>${app.name}</h3>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="status-badge status-pending">Beklemede</span>
                        <button class="delete-btn" onclick="dashboard.deleteApplication('${app.id}')">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                </div>
                <div class="data-grid">
                    <div class="data-item">
                        <div class="data-label">İsim</div>
                        <div class="data-value">${app.name}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Roblox İsim</div>
                        <div class="data-value">${app.robloxName}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Discord İsim</div>
                        <div class="data-value">${app.discordName}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Aktiflik</div>
                        <div class="data-value">${app.activeHours}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Başvuru Tarihi</div>
                        <div class="data-value">${app.submittedDate} ${app.submittedTime}</div>
                    </div>
                    <div class="data-item" style="grid-column: 1 / -1;">
                        <div class="data-label">Katkı</div>
                        <div class="data-value">${app.contribution}</div>
                    </div>
                    ${app.experience ? `
                    <div class="data-item" style="grid-column: 1 / -1;">
                        <div class="data-label">Deneyim</div>
                        <div class="data-value">${app.experience}</div>
                    </div>
                    ` : ''}
                    ${app.additionalInfo ? `
                    <div class="data-item" style="grid-column: 1 / -1;">
                        <div class="data-label">Ek Bilgiler</div>
                        <div class="data-value">${app.additionalInfo}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    loadComplaints() {
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        const container = document.getElementById('complaintsContainer');
        
        if (complaints.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Henüz şikayet bulunmuyor.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = complaints.map(complaint => `
            <div class="data-card" data-searchable="${complaint.reporterName || 'Anonim'} ${complaint.reportedUser || ''} ${complaint.reportType}">
                <div class="data-header">
                    <h3>${complaint.reportType} ${complaint.urgentCase ? '🚨' : ''}</h3>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="status-badge status-pending">Beklemede</span>
                        <button class="delete-btn" onclick="dashboard.deleteComplaint('${complaint.id}')">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                </div>
                <div class="data-grid">
                    <div class="data-item">
                        <div class="data-label">Rapor Eden</div>
                        <div class="data-value">${complaint.reporterName || 'Anonim'}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Şikayet Edilen</div>
                        <div class="data-value">${complaint.reportedUser || 'Belirtilmedi'}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Platform</div>
                        <div class="data-value">${complaint.platform || 'Belirtilmedi'}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Tarih</div>
                        <div class="data-value">${complaint.submittedDate} ${complaint.submittedTime}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">Acil Durum</div>
                        <div class="data-value">${complaint.urgentCase ? 'Evet' : 'Hayır'}</div>
                    </div>
                    <div class="data-item" style="grid-column: 1 / -1;">
                        <div class="data-label">Açıklama</div>
                        <div class="data-value">${complaint.description}</div>
                    </div>
                    ${complaint.evidenceFiles && complaint.evidenceFiles.length > 0 ? `
                    <div class="data-item" style="grid-column: 1 / -1;">
                        <div class="data-label">Kanıt Dosyaları</div>
                        <div class="evidence-files">
                            ${complaint.evidenceFiles.map(file => `
                                <div class="file-item">
                                    <i class="fas fa-file"></i> ${file.name} (${(file.size / 1024).toFixed(1)} KB)
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    loadStats() {
        const applications = JSON.parse(localStorage.getItem('moderator_applications') || '[]');
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        const urgentComplaints = complaints.filter(c => c.urgentCase).length;
        
        const today = new Date().toLocaleDateString('tr-TR');
        const todayApplications = applications.filter(a => a.submittedDate === today).length;
        const todayComplaints = complaints.filter(c => c.submittedDate === today).length;

        const container = document.getElementById('statsContainer');
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${applications.length}</div>
                <div class="stat-label">Toplam Başvuru</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${complaints.length}</div>
                <div class="stat-label">Toplam Şikayet</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${urgentComplaints}</div>
                <div class="stat-label">Acil Şikayetler</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${todayApplications}</div>
                <div class="stat-label">Bugünkü Başvurular</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${todayComplaints}</div>
                <div class="stat-label">Bugünkü Şikayetler</div>
            </div>
        `;
    }

    setupSearch() {
        document.getElementById('applicationsSearch').addEventListener('input', (e) => {
            this.filterItems('applications', e.target.value);
        });

        document.getElementById('complaintsSearch').addEventListener('input', (e) => {
            this.filterItems('complaints', e.target.value);
        });
    }

    filterItems(section, searchTerm) {
        const container = document.getElementById(`${section}Container`);
        const cards = container.querySelectorAll('.data-card');
        
        cards.forEach(card => {
            const searchableText = card.getAttribute('data-searchable').toLowerCase();
            if (searchableText.includes(searchTerm.toLowerCase())) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    deleteApplication(id) {
        if (confirm('Bu başvuruyu silmek istediğinizden emin misiniz?')) {
            let applications = JSON.parse(localStorage.getItem('moderator_applications') || '[]');
            applications = applications.filter(app => app.id !== id);
            localStorage.setItem('moderator_applications', JSON.stringify(applications));
            
            // Also clean up related data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(`basvuru_detay_${id}`) || key.includes(`_${id}.txt`)) {
                    localStorage.removeItem(key);
                }
            });
            
            this.loadApplications();
            this.loadStats();
        }
    }

    deleteComplaint(id) {
        if (confirm('Bu şikayeti silmek istediğinizden emin misiniz?')) {
            let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
            complaints = complaints.filter(complaint => complaint.id !== id);
            localStorage.setItem('complaints', JSON.stringify(complaints));
            
            // Also clean up related data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(`sikayet_detay_${id}`) || key.includes(`_${id}.txt`)) {
                    localStorage.removeItem(key);
                }
            });
            
            this.loadComplaints();
            this.loadStats();
        }
    }

    setupAutoRefresh() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadApplications();
            this.loadComplaints();
            this.loadStats();
        }, 30000);
    }

    exportData() {
        const applications = JSON.parse(localStorage.getItem('moderator_applications') || '[]');
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        
        const data = {
            applications,
            complaints,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moderator-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearAllData() {
        if (confirm('TÜM VERİLERİ SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\nBu işlem geri alınamaz!')) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('moderator_') || key.includes('complaints') || 
                    key.includes('basvuru') || key.includes('sikayet') ||
                    key.includes('main_folder_structure')) {
                    localStorage.removeItem(key);
                }
            });
            
            this.loadApplications();
            this.loadComplaints();
            this.loadStats();
            alert('Tüm veriler temizlendi.');
        }
    }
}

// Global functions for HTML onclick events
function showSection(sectionName) {
    dashboard.showSection(sectionName);
}

// Initialize dashboard
const dashboard = new AdminDashboard();

console.log('🛡️ Admin Paneli Başlatıldı');
console.log('📊 Dashboard Komutları:');
console.log('- dashboard.exportData() - Verileri dışa aktar');
console.log('- dashboard.clearAllData() - Tüm verileri temizle');
