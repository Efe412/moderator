
class LogsDashboard {
    constructor() {
        this.logs = [];
        this.filteredLogs = [];
        this.lastUpdate = null;
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        this.loadLogs();
        this.setupEventListeners();
        this.startAutoRefresh();
        this.updateStats();
        
        console.log('📊 Logs Dashboard Başlatıldı');
    }

    setupEventListeners() {
        // Filter events
        document.getElementById('typeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchFilter').addEventListener('input', () => this.applyFilters());
    }

    startAutoRefresh() {
        // Refresh every 5 seconds
        this.updateInterval = setInterval(() => {
            this.loadLogs();
            this.updateStats();
        }, 5000);
    }

    loadLogs() {
        const applications = JSON.parse(localStorage.getItem('moderator_applications') || '[]');
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        
        this.logs = [];
        
        // Add applications to logs
        applications.forEach(app => {
            this.logs.push({
                id: app.id,
                type: 'application',
                title: `Yeni Moderatör Başvurusu - ${app.name}`,
                details: `Roblox: ${app.robloxName} | Discord: ${app.discordName}`,
                description: app.contribution,
                timestamp: new Date(app.submittedAt),
                date: app.submittedDate,
                time: app.submittedTime,
                status: 'new',
                urgent: false,
                applicantName: app.name,
                platform: 'Başvuru Formu'
            });
        });

        // Add complaints to logs
        complaints.forEach(complaint => {
            this.logs.push({
                id: complaint.id,
                type: 'complaint',
                title: `Şikayet - ${complaint.reportType}`,
                details: `Şikayet Eden: ${complaint.reporterName || 'Anonim'} | Şikayet Edilen: ${complaint.reportedUser || 'Belirtilmedi'}`,
                description: complaint.description,
                timestamp: new Date(complaint.submittedAt),
                date: complaint.submittedDate,
                time: complaint.submittedTime,
                status: complaint.urgentCase ? 'urgent' : 'pending',
                urgent: complaint.urgentCase,
                platform: complaint.platform || 'Belirtilmedi'
            });
        });

        // Sort by timestamp (newest first)
        this.logs.sort((a, b) => b.timestamp - a.timestamp);
        
        this.applyFilters();
    }

    applyFilters() {
        const typeFilter = document.getElementById('typeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        this.filteredLogs = this.logs.filter(log => {
            // Type filter
            if (typeFilter && log.type !== typeFilter) return false;
            
            // Status filter
            if (statusFilter && log.status !== statusFilter) return false;
            
            // Date filter
            if (dateFilter) {
                const logDate = log.timestamp.toISOString().split('T')[0];
                if (logDate !== dateFilter) return false;
            }
            
            // Search filter
            if (searchFilter) {
                const searchText = `${log.title} ${log.details} ${log.description}`.toLowerCase();
                if (!searchText.includes(searchFilter)) return false;
            }
            
            return true;
        });

        this.renderLogs();
    }

    renderLogs() {
        const container = document.getElementById('logsList');
        
        if (this.filteredLogs.length === 0) {
            container.innerHTML = `
                <div class="no-logs">
                    <i class="fas fa-search"></i>
                    <p>Filtre kriterlerine uygun log bulunamadı.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredLogs.map(log => `
            <div class="log-item" data-id="${log.id}">
                <div class="log-icon ${log.type} ${log.urgent ? 'urgent' : ''}">
                    <i class="fas fa-${log.type === 'application' ? 'user-plus' : 'flag'}"></i>
                </div>
                <div class="log-content">
                    <div class="log-title">${log.title}</div>
                    <div class="log-details">${log.details}</div>
                    <div class="log-details">Platform: ${log.platform}</div>
                    <div class="log-time">
                        <i class="fas fa-clock"></i> ${log.date} ${log.time}
                        ${this.isNew(log.timestamp) ? '<span style="color: var(--success-color); font-weight: 600;"> (YENİ)</span>' : ''}
                    </div>
                    <div class="log-badges">
                        ${this.isNew(log.timestamp) ? '<span class="log-badge badge-new">Yeni</span>' : ''}
                        ${log.urgent ? '<span class="log-badge badge-urgent">Acil</span>' : ''}
                        <span class="log-badge badge-pending">Beklemede</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    isNew(timestamp) {
        const now = new Date();
        const logTime = new Date(timestamp);
        const diffMinutes = (now - logTime) / (1000 * 60);
        return diffMinutes <= 30; // 30 dakika içinde gelen loglar "yeni"
    }

    updateStats() {
        const applications = JSON.parse(localStorage.getItem('moderator_applications') || '[]');
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        
        const today = new Date().toLocaleDateString('tr-TR');
        const todayApplications = applications.filter(app => app.submittedDate === today).length;
        const todayComplaints = complaints.filter(comp => comp.submittedDate === today).length;
        const urgentComplaints = complaints.filter(comp => comp.urgentCase).length;

        // Animate counters
        this.animateCounter('totalApplications', applications.length);
        this.animateCounter('totalComplaints', complaints.length);
        this.animateCounter('urgentComplaints', urgentComplaints);
        this.animateCounter('todayLogs', todayApplications + todayComplaints);
    }

    animateCounter(elementId, target) {
        const element = document.getElementById(elementId);
        const current = parseInt(element.textContent) || 0;
        
        if (current === target) return;
        
        const increment = target > current ? 1 : -1;
        const duration = 500;
        const steps = Math.abs(target - current);
        const stepTime = duration / steps;
        
        let step = 0;
        const timer = setInterval(() => {
            step++;
            const value = current + (increment * step);
            element.textContent = value;
            
            if (step >= steps) {
                clearInterval(timer);
                element.textContent = target;
                
                // Add pulse effect for new items
                if (target > current) {
                    element.style.animation = 'pulse 0.5s ease';
                    setTimeout(() => {
                        element.style.animation = '';
                    }, 500);
                }
            }
        }, stepTime);
    }

    refreshLogs() {
        const refreshBtn = document.querySelector('.refresh-btn');
        const originalText = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Yenileniyor...';
        refreshBtn.disabled = true;
        
        setTimeout(() => {
            this.loadLogs();
            this.updateStats();
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            
            // Show success notification
            this.showNotification('Logs başarıyla yenilendi!', 'success');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        switch(type) {
            case 'success':
                notification.style.background = 'var(--success-color)';
                break;
            case 'error':
                notification.style.background = 'var(--error-color)';
                break;
            case 'warning':
                notification.style.background = 'var(--warning-color)';
                break;
            default:
                notification.style.background = 'var(--info-color)';
        }
        
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i> ${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    exportLogs() {
        const data = {
            logs: this.logs,
            exportDate: new Date().toISOString(),
            totalApplications: this.logs.filter(log => log.type === 'application').length,
            totalComplaints: this.logs.filter(log => log.type === 'complaint').length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Logs başarıyla dışa aktarıldı!', 'success');
    }

    clearAllLogs() {
        if (confirm('TÜM LOGLARI SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\nBu işlem geri alınamaz!')) {
            localStorage.removeItem('moderator_applications');
            localStorage.removeItem('complaints');
            
            // Clear related data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('basvuru') || key.includes('sikayet') || key.includes('main_folder_structure')) {
                    localStorage.removeItem(key);
                }
            });
            
            this.loadLogs();
            this.updateStats();
            this.showNotification('Tüm logs temizlendi!', 'success');
        }
    }
}

// Global functions
function refreshLogs() {
    dashboard.refreshLogs();
}

function clearFilters() {
    document.getElementById('typeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('searchFilter').value = '';
    dashboard.applyFilters();
    dashboard.showNotification('Filtreler temizlendi!', 'info');
}

// Initialize dashboard
const dashboard = new LogsDashboard();

// Console commands
console.log('📊 Logs Dashboard Komutları:');
console.log('- dashboard.exportLogs() - Logları dışa aktar');
console.log('- dashboard.clearAllLogs() - Tüm logları temizle');
console.log('- dashboard.refreshLogs() - Logları yenile');

// Add pulse animation to stats when new data arrives
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);
