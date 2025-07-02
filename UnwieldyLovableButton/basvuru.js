
// Başvuru Formu JavaScript
class ApplicationForm {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 4;
        this.formData = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.loadSavedData();
    }
    
    setupEventListeners() {
        // Form submit
        document.getElementById('applicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
        
        // Input change events for auto-save
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('change', () => this.saveData());
            input.addEventListener('input', () => this.saveData());
        });
        
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    nextSection(sectionNumber) {
        if (this.validateCurrentSection()) {
            this.showSection(sectionNumber);
        }
    }
    
    prevSection(sectionNumber) {
        this.showSection(sectionNumber);
    }
    
    showSection(sectionNumber) {
        // Hide all sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show target section
        const targetSection = document.querySelector(`[data-section="${sectionNumber}"]`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.currentSection = sectionNumber;
            this.updateProgress();
            
            // Scroll to top of form
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    validateCurrentSection() {
        const currentSectionElement = document.querySelector(`[data-section="${this.currentSection}"]`);
        const requiredFields = currentSectionElement.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Bu alan zorunludur');
                isValid = false;
            } else {
                this.clearFieldError(field);
                
                // Additional validations
                if (field.type === 'email' && !this.isValidEmail(field.value)) {
                    this.showFieldError(field, 'Geçerli bir email adresi girin');
                    isValid = false;
                } else if (field.type === 'url' && !this.isValidUrl(field.value)) {
                    this.showFieldError(field, 'Geçerli bir URL girin');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const currentStepElement = document.getElementById('currentStep');
        
        const progressPercentage = (this.currentSection / this.totalSections) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        currentStepElement.textContent = this.currentSection;
    }
    
    saveData() {
        const formData = new FormData(document.getElementById('applicationForm'));
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        localStorage.setItem('moderator_application', JSON.stringify(data));
    }
    
    loadSavedData() {
        const savedData = localStorage.getItem('moderator_application');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const field = document.querySelector(`[name="${key}"]`);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = data[key] === 'on';
                        } else {
                            field.value = data[key];
                        }
                    }
                });
            } catch (e) {
                console.error('Kaydedilen veri yüklenemedi:', e);
            }
        }
    }
    
    async submitForm() {
        if (!this.validateCurrentSection()) {
            return;
        }
        
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(document.getElementById('applicationForm'));
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Add timestamp
            data.submittedAt = new Date().toISOString();
            data.submittedDate = new Date().toLocaleDateString('tr-TR');
            data.submittedTime = new Date().toLocaleTimeString('tr-TR');
            
            // Save to local storage (simulating database)
            await this.saveToLocalDatabase(data);
            
            // Clear saved form data
            localStorage.removeItem('moderator_application');
            
            // Show success modal
            this.showSuccessModal();
            
            // Log the application
            console.log('📝 Yeni Moderatör Başvurusu:', data);
            
            // Send log to logs dashboard
            this.sendLogToSystem(data, 'application');
            
        } catch (error) {
            console.error('Form gönderim hatası:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async saveToLocalDatabase(data) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get existing applications
        const existingApplications = JSON.parse(localStorage.getItem('moderator_applications') || '[]');
        
        // Add new application with ID
        data.id = Date.now().toString();
        existingApplications.push(data);
        
        // Save back to localStorage
        localStorage.setItem('moderator_applications', JSON.stringify(existingApplications));
        
        // Create individual file for each applicant in "Başvurular" folder
        const fileName = `basvuru_${data.name.replace(/[^a-zA-Z0-9]/g, '_')}_${data.id}.txt`;
        const fileContent = this.formatApplicationData(data);
        
        // Save individual application file
        localStorage.setItem(`basvurular_${fileName}`, fileContent);
        
        // Create log entry
        const logEntry = {
            id: data.id,
            applicantName: data.name,
            submittedAt: data.submittedAt,
            status: 'pending',
            fileName: fileName,
            type: 'application'
        };
        
        const logs = JSON.parse(localStorage.getItem('application_logs') || '[]');
        logs.unshift(logEntry); // Add to beginning
        localStorage.setItem('application_logs', JSON.stringify(logs));
        
        // Update folder structure for applications
        this.updateApplicationsFolderStructure(data);
        
        return data;
    }
    
    formatApplicationData(data) {
        return `=== MODERATÖR BAŞVURU FORMU ===
        
Başvuru ID: ${data.id}
Başvuru Tarihi: ${data.submittedDate} ${data.submittedTime}

=== KİŞİSEL BİLGİLER ===
İsim: ${data.name}
Roblox İsim: ${data.robloxName}
Discord İsim: ${data.discordName}
Roblox Profil: ${data.robloxProfile || 'Belirtilmemiş'}

=== AKTİVİTE BİLGİLERİ ===
Aktiflik Süresi: ${data.activeHours}
Aktif Olduğu Saatler: ${data.timezone || 'Belirtilmemiş'}

=== DENEYİM VE MOTİVASYON ===
Katkı: ${data.contribution}
Deneyim: ${data.experience || 'Belirtilmemiş'}

=== EK BİLGİLER ===
Ek Bilgiler: ${data.additionalInfo || 'Yok'}

=== ONAYLAR ===
Kuralları Kabul Etti: ${data.agreeRules ? 'Evet' : 'Hayır'}
Bilgilerin Doğruluğunu Onayladı: ${data.agreeTerms ? 'Evet' : 'Hayır'}

=== DURUM ===
Başvuru Durumu: Beklemede
`;
    }
    
    updateApplicationsFolderStructure(data) {
        // Get existing folder structure
        const folderStructure = JSON.parse(localStorage.getItem('main_folder_structure') || '{}');
        
        if (!folderStructure.basvurular) {
            folderStructure.basvurular = {
                type: 'folder',
                files: [],
                created: new Date().toISOString(),
                name: 'Başvurular'
            };
        }
        
        // Add new file to applications folder
        folderStructure.basvurular.files.push({
            name: `${data.name}_${data.id}.txt`,
            type: 'file',
            size: this.formatApplicationData(data).length,
            created: data.submittedAt,
            applicantId: data.id,
            applicantName: data.name
        });
        
        localStorage.setItem('main_folder_structure', JSON.stringify(folderStructure));
        
        // Also create individual application folder
        const individualFolder = {
            personalInfo: {
                name: data.name,
                robloxName: data.robloxName,
                discordName: data.discordName,
                robloxProfile: data.robloxProfile
            },
            activityInfo: {
                activeHours: data.activeHours,
                timezone: data.timezone
            },
            motivation: {
                contribution: data.contribution,
                experience: data.experience || 'Belirtilmedi'
            },
            additional: {
                additionalInfo: data.additionalInfo || 'Yok',
                agreeRules: data.agreeRules,
                agreeTerms: data.agreeTerms
            },
            metadata: {
                id: data.id,
                submittedAt: data.submittedAt,
                submittedDate: data.submittedDate,
                submittedTime: data.submittedTime,
                status: 'pending'
            }
        };
        
        localStorage.setItem(`basvuru_detay_${data.id}`, JSON.stringify(individualFolder));
    }
    
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    sendLogToSystem(data, type) {
        // Create log entry for logs dashboard
        const logEntry = {
            id: data.id,
            type: type,
            timestamp: new Date().toISOString(),
            data: data,
            status: 'new'
        };
        
        // Store in separate logs array for real-time monitoring
        const systemLogs = JSON.parse(localStorage.getItem('system_logs') || '[]');
        systemLogs.unshift(logEntry);
        localStorage.setItem('system_logs', JSON.stringify(systemLogs));
        
        // Also trigger a custom event for real-time updates
        window.dispatchEvent(new CustomEvent('newLogEntry', { detail: logEntry }));
        
        console.log('📡 Log sisteme gönderildi:', logEntry);
    }
    
    closeModal() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Redirect to main page after 1 second
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Global functions for HTML onclick events
function nextSection(sectionNumber) {
    app.nextSection(sectionNumber);
}

function prevSection(sectionNumber) {
    app.prevSection(sectionNumber);
}

function closeModal() {
    app.closeModal();
}

// Initialize application form
const app = new ApplicationForm();

// Admin panel functions (for viewing applications)
window.AdminPanel = {
    viewApplications: () => {
        const applications = JSON.parse(localStorage.getItem('moderator_applications') || '[]');
        console.log('📋 Moderatör Başvuruları:', applications);
        return applications;
    },
    
    viewLogs: () => {
        const logs = JSON.parse(localStorage.getItem('application_logs') || '[]');
        console.log('📊 Başvuru Logları:', logs);
        return logs;
    },
    
    clearAllData: () => {
        if (confirm('Tüm başvuru verilerini silmek istediğinizden emin misiniz?')) {
            localStorage.removeItem('moderator_applications');
            localStorage.removeItem('application_logs');
            console.log('🗑️ Tüm veriler temizlendi');
        }
    }
};

// Console info
console.log('📝 Moderatör Başvuru Sistemi Başlatıldı');
console.log('💡 Admin Paneli Komutları:');
console.log('- AdminPanel.viewApplications() - Başvuruları görüntüle');
console.log('- AdminPanel.viewLogs() - Logları görüntüle');
console.log('- AdminPanel.clearAllData() - Tüm verileri temizle');
