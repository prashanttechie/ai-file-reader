class LogInterpreterUI {
    constructor() {
        this.currentFile = null;
        this.isProcessing = false;
        this.initializeElements();
        this.attachEventListeners();
        this.checkServerConnection();
    }

    initializeElements() {
        // File upload elements
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.uploadBtn = document.getElementById('upload-btn');
        
        // Debug: Log element initialization
        console.log('🔧 Elements initialized:', {
            uploadArea: !!this.uploadArea,
            fileInput: !!this.fileInput,
            uploadBtn: !!this.uploadBtn
        });
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.removeFileBtn = document.getElementById('remove-file');
        this.uploadProgress = document.getElementById('upload-progress');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');

        // Configuration elements
        this.embeddingProvider = document.getElementById('embedding-provider');
        this.groqModel = document.getElementById('groq-model');

        // Chat elements
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.clearChatBtn = document.getElementById('clear-chat');
        this.fileStatus = document.getElementById('file-status');

        // Status elements
        this.connectionStatus = document.getElementById('connection-status');
        this.connectionText = document.getElementById('connection-text');

        // Loading overlay
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingText = document.getElementById('loading-text');
    }

    attachEventListeners() {
        // File upload events - simplified approach
        this.uploadArea.addEventListener('click', (e) => {
            // Don't trigger if clicking on the button itself
            if (e.target !== this.uploadBtn && !this.uploadBtn.contains(e.target)) {
                console.log('📤 Upload area clicked, opening file picker');
                this.fileInput.click();
            }
        });
        this.uploadBtn.addEventListener('click', (e) => {
            console.log('🔘 Upload button clicked, opening file picker');
            e.stopPropagation();
            this.fileInput.click();
        });
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.removeFileBtn.addEventListener('click', () => this.removeFile());

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Chat events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.clearChatBtn.addEventListener('click', () => this.clearChat());

        // Configuration events
        this.embeddingProvider.addEventListener('change', () => this.updateConfiguration());
        this.groqModel.addEventListener('change', () => this.updateConfiguration());
    }

    async checkServerConnection() {
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                this.setConnectionStatus(true);
            } else {
                throw new Error('Server not responding');
            }
        } catch (error) {
            this.setConnectionStatus(false);
            setTimeout(() => this.checkServerConnection(), 5000);
        }
    }

    setConnectionStatus(isOnline) {
        if (isOnline) {
            this.connectionStatus.className = 'status-dot online';
            this.connectionText.textContent = 'Connected';
        } else {
            this.connectionStatus.className = 'status-dot offline';
            this.connectionText.textContent = 'Disconnected';
        }
    }



    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.fileInput.files = files;
            this.handleFileSelect({ target: { files } });
        }
    }

    handleFileSelect(e) {
        console.log('📂 File input change event triggered');
        const file = e.target.files[0];
        if (!file) {
            console.log('❌ No file selected from file input');
            return;
        }

        console.log('📁 File selected:', file.name, file.size, 'bytes', 'Type:', file.type);

        // Prevent multiple uploads of the same file
        if (this.isProcessing) {
            console.log('Upload already in progress, ignoring duplicate');
            return;
        }

        // Check if this is the same file already uploaded successfully
        if (this.currentFile && this.currentFile.name === file.name && 
            this.currentFile.size === file.size && 
            this.fileInfo.style.display === 'block' && 
            !this.chatInput.disabled) {
            console.log('Same file already uploaded successfully, ignoring duplicate');
            return;
        }

        // Validate file type
        const allowedTypes = ['.txt', '.log', '.csv', '.json', '.md', '.pdf', '.doc', '.docx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            this.showError('Unsupported file type. Please upload: ' + allowedTypes.join(', '));
            this.fileInput.value = ''; // Clear the invalid file
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB');
            this.fileInput.value = ''; // Clear the invalid file
            return;
        }

        console.log('✅ File validation passed, starting upload process');
        this.currentFile = file;
        this.displayFileInfo(file);
        this.uploadFile(file);
    }

    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.uploadArea.style.display = 'none';
        this.fileInfo.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async uploadFile(file) {
        console.log('🚀 Starting upload for:', file.name);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('embeddingProvider', this.embeddingProvider.value);
        formData.append('groqModel', this.groqModel.value);

        this.showProgress();
        this.setProcessing(true, 'Processing file upload...');

        try {
            console.log('📡 Sending upload request...');
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            console.log('📨 Response received:', response.status, response.statusText);

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Server error:', error);
                throw new Error(error.error || 'Upload failed');
            }

            const result = await response.json();
            console.log('✅ Upload successful:', result);
            
            this.hideProgress();
            this.setProcessing(false);
            
            // Ensure the file info shows the successful upload
            this.uploadArea.style.display = 'none';
            this.fileInfo.style.display = 'block';
            
            this.enableChat();
            
            const timeText = result.processingTime ? ` in ${result.processingTime.toFixed(1)}s` : '';
            this.showSuccess(`File uploaded successfully! Loaded ${result.chunks} chunks${timeText}.`);
            
        } catch (error) {
            console.error('❌ Upload failed:', error);
            this.hideProgress();
            this.setProcessing(false);
            this.showUploadError('Upload failed: ' + error.message);
            
            // Reset UI to allow retry
            this.uploadArea.style.display = 'block';
            this.fileInfo.style.display = 'none';
            this.uploadArea.style.cursor = 'pointer';
            this.uploadArea.title = 'Click to retry upload or drag a new file';
        }
    }

    showProgress() {
        this.uploadProgress.style.display = 'block';
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '0%';
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            this.progressFill.style.width = progress + '%';
            this.progressText.textContent = Math.round(progress) + '%';
            
            if (progress >= 90) {
                clearInterval(interval);
            }
        }, 200);
        
        this.progressInterval = interval;
    }

    hideProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        this.progressFill.style.width = '100%';
        this.progressText.textContent = '100%';
        
        setTimeout(() => {
            this.uploadProgress.style.display = 'none';
        }, 500);
    }

    async removeFile() {
        console.log('🗑️ Removing file:', this.currentFile?.name);
        
        // Call the API to remove the file from server and clear vector store
        try {
            const response = await fetch('/api/remove-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ File removed from server:', result.message);
                this.addMessage(result.message, 'assistant');
            } else {
                console.warn('⚠️ Failed to remove file from server');
                this.addMessage('Warning: Failed to remove file from server', 'error');
            }
        } catch (error) {
            console.error('❌ Error removing file from server:', error);
            this.addMessage('Error: Could not remove file from server', 'error');
        }

        // Clear UI state
        this.currentFile = null;
        this.uploadArea.style.display = 'block';
        this.fileInfo.style.display = 'none';
        this.fileInput.value = '';
        this.disableChat();
        this.setProcessing(false);
    }

    retryUpload() {
        if (this.currentFile && !this.isProcessing) {
            console.log('Retrying upload for:', this.currentFile.name);
            this.displayFileInfo(this.currentFile);
            this.uploadFile(this.currentFile);
        }
    }

    enableChat() {
        console.log('💬 Enabling chat for file:', this.currentFile?.name);
        this.chatInput.disabled = false;
        this.sendBtn.disabled = false;
        this.fileStatus.textContent = `File: ${this.currentFile.name}`;
        this.chatInput.placeholder = 'Ask a question about your file...';
        console.log('✅ Chat enabled successfully');
    }

    disableChat() {
        this.chatInput.disabled = true;
        this.sendBtn.disabled = true;
        this.fileStatus.textContent = 'No file uploaded';
        this.chatInput.placeholder = 'Upload a file to start asking questions...';
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isProcessing || !this.currentFile) return;

        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.setProcessing(true);

        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: message,
                    embeddingProvider: this.embeddingProvider.value,
                    groqModel: this.groqModel.value
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Query failed');
            }

            const result = await response.json();
            this.addMessage(result.answer, 'assistant', result.sources);

        } catch (error) {
            this.addMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    addMessage(content, type, sources = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        if (sources && sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.className = 'sources';
            
            const sourcesTitle = document.createElement('h4');
            sourcesTitle.textContent = 'Sources:';
            sourcesDiv.appendChild(sourcesTitle);

            sources.forEach((source, index) => {
                const sourceItem = document.createElement('div');
                sourceItem.className = 'source-item';
                sourceItem.textContent = `${index + 1}. ${source.source} (chunk ${source.chunkIndex})`;
                sourcesDiv.appendChild(sourceItem);
            });

            messageDiv.appendChild(sourcesDiv);
        }

        // Remove welcome message if it exists
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async clearChat() {
        console.log('🧹 Clearing chat and session');
        
        // Call the API to clear session (removes file + vector store)
        try {
            const response = await fetch('/api/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Session cleared:', result.message);
            } else {
                console.warn('⚠️ Failed to clear session on server');
            }
        } catch (error) {
            console.error('❌ Error clearing session:', error);
        }

        // Clear UI state
        this.currentFile = null;
        this.uploadArea.style.display = 'block';
        this.fileInfo.style.display = 'none';
        this.fileInput.value = '';
        this.disableChat();
        this.setProcessing(false);

        // Clear chat messages
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-info-circle"></i>
                <p>Upload a file above and start asking questions about its content!</p>
                <div class="example-questions">
                    <p><strong>Example questions:</strong></p>
                    <ul>
                        <li>"What are the main topics in this file?"</li>
                        <li>"Are there any errors mentioned?"</li>
                        <li>"Summarize the key events"</li>
                        <li>"What happened between 2PM and 3PM?"</li>
                    </ul>
                </div>
            </div>
        `;
    }

    setProcessing(isProcessing, message = 'Processing your question...') {
        console.log('🔄 setProcessing called:', { isProcessing, currentFile: this.currentFile?.name, message });
        
        this.isProcessing = isProcessing;
        
        // Only disable chat controls if actively processing OR no file is loaded
        const shouldDisable = isProcessing || !this.currentFile;
        this.sendBtn.disabled = shouldDisable;
        this.chatInput.disabled = shouldDisable;
        
        console.log('🎛️ Chat controls:', { 
            sendBtnDisabled: this.sendBtn.disabled, 
            chatInputDisabled: this.chatInput.disabled,
            shouldDisable 
        });
        
        if (isProcessing) {
            this.loadingOverlay.style.display = 'flex';
            this.loadingText.textContent = message;
        } else {
            this.loadingOverlay.style.display = 'none';
        }
    }

    updateConfiguration() {
        // Configuration changes will be applied on next upload or query
        console.log('Configuration updated:', {
            embeddingProvider: this.embeddingProvider.value,
            groqModel: this.groqModel.value
        });
    }

    showError(message) {
        this.addMessage(message, 'error');
    }

    showSuccess(message) {
        this.addMessage(message, 'assistant');
    }

    showUploadError(message) {
        // Show error with retry option for upload failures
        const errorWithRetry = `${message}\n\nClick the upload area to try again, or use the remove button to select a different file.`;
        this.addMessage(errorWithRetry, 'error');
    }
}

// Product Info Section Toggle
class ProductInfoToggle {
    constructor() {
        this.productInfoSection = document.getElementById('product-info-section');
        this.toggleBtn = document.getElementById('toggle-product-info');
        this.infoHeader = document.querySelector('.info-header');
        
        this.init();
    }
    
    init() {
        if (this.toggleBtn && this.infoHeader) {
            // Add click handlers
            this.toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
            
            this.infoHeader.addEventListener('click', () => {
                this.toggle();
            });
        }
    }
    
    toggle() {
        if (this.productInfoSection) {
            this.productInfoSection.classList.toggle('collapsed');
            
            // Update button icon
            const icon = this.toggleBtn.querySelector('i');
            if (this.productInfoSection.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-right';
            } else {
                icon.className = 'fas fa-chevron-down';
            }
        }
    }
    
    collapse() {
        if (this.productInfoSection && !this.productInfoSection.classList.contains('collapsed')) {
            this.toggle();
        }
    }
    
    expand() {
        if (this.productInfoSection && this.productInfoSection.classList.contains('collapsed')) {
            this.toggle();
        }
    }
}

// Initialize the UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LogInterpreterUI();
    new ProductInfoToggle();
});
