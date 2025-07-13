class AdvancedLotteryApp {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('lotteryHistory')) || [];
        this.adShownCount = parseInt(localStorage.getItem('adShownCount')) || 0;
        this.numberRange = JSON.parse(localStorage.getItem('numberRange')) || { min: 1, max: 100 };
        this.pricePerNumber = parseFloat(localStorage.getItem('pricePerNumber')) || 1.00;
        this.numberStatus = JSON.parse(localStorage.getItem('numberStatus')) || {};
        this.payments = JSON.parse(localStorage.getItem('payments')) || [];
        this.currentFilter = 'all';
        this.gridFilter = 'all';
        
        this.initializeElements();
        this.bindEvents();
        this.updateHistoryDisplay();
        this.updateNumberGrid();
        this.updateStats();
        this.updatePriceDisplay();
        this.initializeAds();
    }

    initializeElements() {
        // Basic elements
        this.minInput = document.getElementById('minNumber');
        this.maxInput = document.getElementById('maxNumber');
        this.pickButton = document.getElementById('pickButton');
        this.pickAgainBtn = document.getElementById('pickAgainBtn');
        this.countdownSection = document.getElementById('countdownSection');
        this.countdownNumber = document.getElementById('countdownNumber');
        this.resultSection = document.getElementById('resultSection');
        this.resultNumber = document.getElementById('resultNumber');
        this.rangeInfo = document.getElementById('rangeInfo');
        this.timestamp = document.getElementById('timestamp');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.adModal = document.getElementById('adModal');
        this.adClose = document.querySelector('.ad-close');

        // New elements
        this.toggleAdminBtn = document.getElementById('toggleAdminBtn');
        this.toggleViewBtn = document.getElementById('toggleViewBtn');
        this.adminPanel = document.getElementById('adminPanel');
        this.numberGridSection = document.getElementById('numberGridSection');
        this.numberGrid = document.getElementById('numberGrid');
        this.currentPrice = document.getElementById('currentPrice');
        this.numberStatus = document.getElementById('numberStatus');
        this.reserveNumberBtn = document.getElementById('reserveNumberBtn');
        this.paymentModal = document.getElementById('paymentModal');
        this.paymentClose = document.querySelector('.payment-close');
        this.modalNumber = document.getElementById('modalNumber');
        this.modalPrice = document.getElementById('modalPrice');
        this.modalStatus = document.getElementById('modalStatus');
        this.customerName = document.getElementById('customerName');
        this.customerPhone = document.getElementById('customerPhone');
        this.paymentStatus = document.getElementById('paymentStatus');
        this.confirmReservationBtn = document.getElementById('confirmReservationBtn');
        this.cancelReservationBtn = document.getElementById('cancelReservationBtn');

        // Winner info elements
        this.winnerInfo = document.getElementById('winnerInfo');
        this.winnerName = document.getElementById('winnerName');
        this.winnerPhone = document.getElementById('winnerPhone');
        this.winnerDate = document.getElementById('winnerDate');

        // Admin elements
        this.showPendingBtn = document.getElementById('showPendingBtn');
        this.showPaidBtn = document.getElementById('showPaidBtn');
        this.showAllBtn = document.getElementById('showAllBtn');
        this.paymentList = document.getElementById('paymentList');
        this.adminMinRange = document.getElementById('adminMinRange');
        this.adminMaxRange = document.getElementById('adminMaxRange');
        this.updateRangeBtn = document.getElementById('updateRangeBtn');
        this.pricePerNumberInput = document.getElementById('pricePerNumber');
        this.updatePriceBtn = document.getElementById('updatePriceBtn');

        // Grid elements
        this.showAvailableBtn = document.getElementById('showAvailableBtn');
        this.showReservedBtn = document.getElementById('showReservedBtn');
        this.showSoldBtn = document.getElementById('showSoldBtn');
        this.showAllNumbersBtn = document.getElementById('showAllNumbersBtn');
        this.availableCount = document.getElementById('availableCount');
        this.reservedCount = document.getElementById('reservedCount');
        this.soldCount = document.getElementById('soldCount');
        this.totalRevenue = document.getElementById('totalRevenue');

        // Set initial values
        this.minInput.value = this.numberRange.min;
        this.maxInput.value = this.numberRange.max;
        this.adminMinRange.value = this.numberRange.min;
        this.adminMaxRange.value = this.numberRange.max;
        this.pricePerNumberInput.value = this.pricePerNumber;
    }

    bindEvents() {
        // Basic events
        this.pickButton.addEventListener('click', () => this.pickNumber());
        this.pickAgainBtn.addEventListener('click', () => this.pickNumber());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Range validation
        this.minInput.addEventListener('input', () => this.validateRange());
        this.maxInput.addEventListener('input', () => this.validateRange());
        
        // Enter key support
        this.minInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.pickNumber();
        });
        this.maxInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.pickNumber();
        });

        // Toggle panels
        this.toggleAdminBtn.addEventListener('click', () => this.toggleAdminPanel());
        this.toggleViewBtn.addEventListener('click', () => this.toggleNumberGrid());

        // Payment modal
        this.reserveNumberBtn.addEventListener('click', () => this.showPaymentModal());
        this.paymentClose.addEventListener('click', () => this.closePaymentModal());
        this.confirmReservationBtn.addEventListener('click', () => this.confirmReservation());
        this.cancelReservationBtn.addEventListener('click', () => this.closePaymentModal());

        // Admin panel events
        this.showPendingBtn.addEventListener('click', () => this.filterPayments('pending'));
        this.showPaidBtn.addEventListener('click', () => this.filterPayments('paid'));
        this.showAllBtn.addEventListener('click', () => this.filterPayments('all'));
        this.updateRangeBtn.addEventListener('click', () => this.updateRange());
        this.updatePriceBtn.addEventListener('click', () => this.updatePrice());

        // Grid filter events
        this.showAvailableBtn.addEventListener('click', () => this.filterGrid('available'));
        this.showReservedBtn.addEventListener('click', () => this.filterGrid('reserved'));
        this.showSoldBtn.addEventListener('click', () => this.filterGrid('sold'));
        this.showAllNumbersBtn.addEventListener('click', () => this.filterGrid('all'));

        // Modal close events
        if (this.adClose) {
            this.adClose.addEventListener('click', () => this.closeAdModal());
        }
        if (this.adModal) {
            this.adModal.addEventListener('click', (e) => {
                if (e.target === this.adModal) {
                    this.closeAdModal();
                }
            });
        }
        if (this.paymentModal) {
            this.paymentModal.addEventListener('click', (e) => {
                if (e.target === this.paymentModal) {
                    this.closePaymentModal();
                }
            });
        }
    }

    toggleAdminPanel() {
        const isVisible = this.adminPanel.style.display !== 'none';
        this.adminPanel.style.display = isVisible ? 'none' : 'block';
        this.toggleAdminBtn.textContent = isVisible ? '🔧 Admin Panel' : '❌ Close Admin';
        this.updatePaymentList();
    }

    toggleNumberGrid() {
        const isVisible = this.numberGridSection.style.display !== 'none';
        this.numberGridSection.style.display = isVisible ? 'none' : 'block';
        this.toggleViewBtn.textContent = isVisible ? '📊 Number Grid' : '❌ Close Grid';
        if (!isVisible) {
            this.updateNumberGrid();
        }
    }

    validateRange() {
        const min = parseInt(this.minInput.value) || 0;
        const max = parseInt(this.maxInput.value) || 100;
        
        if (min > max) {
            this.maxInput.value = min + 1;
        }
        
        if (max < min) {
            this.minInput.value = Math.max(0, max - 1);
        }
    }

    pickNumber() {
        const min = parseInt(this.minInput.value) || 0;
        const max = parseInt(this.maxInput.value) || 100;
        
        if (min >= max) {
            this.showError('Maximum number must be greater than minimum number!');
            return;
        }

        // Disable button and show countdown
        this.pickButton.disabled = true;
        this.pickButton.textContent = '🎲 Rolling...';
        
        // Start countdown
        this.startCountdown(min, max);
    }

    startCountdown(min, max) {
        let countdown = 10;
        
        // Show countdown section
        this.countdownSection.style.display = 'block';
        this.countdownSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide result section if it was showing
        this.resultSection.style.display = 'none';
        
        const countdownInterval = setInterval(() => {
            this.countdownNumber.textContent = countdown;
            
            // Add bounce animation for each number change
            this.countdownNumber.style.animation = 'none';
            setTimeout(() => {
                this.countdownNumber.style.animation = 'countdownBounce 0.5s ease-out';
            }, 10);
            
            countdown--;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
                this.hideCountdown();
                this.showResult(min, max);
            }
        }, 1000);
    }

    hideCountdown() {
        this.countdownSection.style.display = 'none';
    }

    showResult(min, max) {
        const randomNumber = this.generateRandomNumber(min, max);
        this.displayResult(randomNumber, min, max);
        this.addToHistory(randomNumber, min, max);
        this.pickButton.disabled = false;
        this.pickButton.textContent = '🎲 Pick a Number!';
        
        // Check if we should show an ad
        this.checkAdDisplay();
    }

    generateRandomNumber(min, max) {
        // Pick randomly from all numbers in the range, regardless of status
        const allNumbers = [];
        for (let i = min; i <= max; i++) {
            allNumbers.push(i);
        }
        if (allNumbers.length > 0) {
            return allNumbers[Math.floor(Math.random() * allNumbers.length)];
        }
        this.showError('No numbers in this range!');
        return null;
    }

    displayResult(number, min, max) {
        if (number === null) return;
        
        this.resultNumber.textContent = number;
        this.rangeInfo.textContent = `${min} - ${max}`;
        this.timestamp.textContent = new Date().toLocaleString();
        
        // Update number status display
        const status = this.numberStatus[number] || 'available';
        this.numberStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        
        // Check if this number has a winner (purchased)
        this.displayWinnerInfo(number);
        
        // Show result with animation
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add celebration effect
        this.celebrate();
    }

    celebrate() {
        // Create confetti effect
        this.createConfetti();
        
        // Play a subtle sound effect (if supported)
        this.playSound();
    }

    createConfetti() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '1000';
                confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
                
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 100);
        }
    }

    playSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Sound effect not supported');
        }
    }

    addToHistory(number, min, max) {
        const entry = {
            number: number,
            range: `${min} - ${max}`,
            timestamp: new Date().toLocaleString(),
            status: this.numberStatus[number] || 'available'
        };
        
        this.history.unshift(entry);
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        localStorage.setItem('lotteryHistory', JSON.stringify(this.history));
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">No picks yet. Try your luck!</p>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map(entry => {
            // Check if this number has a winner
            const payment = this.payments.find(p => p.number === entry.number);
            const winnerInfo = payment ? `<div style="color: #ffd700; font-weight: 600;">🏆 Winner: ${payment.customerName}</div>` : '';
            
            return `
                <div class="history-item">
                    <div class="history-number">${entry.number}</div>
                    <div class="history-details">
                        <div>Range: ${entry.range}</div>
                        <div>${entry.timestamp}</div>
                        <div>Status: ${entry.status}</div>
                        ${winnerInfo}
                    </div>
                </div>
            `;
        }).join('');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear the history?')) {
            this.history = [];
            localStorage.setItem('lotteryHistory', JSON.stringify(this.history));
            this.updateHistoryDisplay();
        }
    }

    showPaymentModal(number = null) {
        const numberToShow = number || parseInt(this.resultNumber.textContent);
        if (!numberToShow) return;
        
        this.modalNumber.textContent = numberToShow;
        this.modalPrice.textContent = `$${this.pricePerNumber.toFixed(2)}`;
        this.modalStatus.textContent = 'Pending Payment';
        this.paymentStatus.value = 'pending';
        
        this.paymentModal.style.display = 'flex';
    }

    closePaymentModal() {
        this.paymentModal.style.display = 'none';
        this.customerName.value = '';
        this.customerPhone.value = '';
        this.paymentStatus.value = 'pending';
    }

    confirmReservation() {
        const number = parseInt(this.modalNumber.textContent);
        const name = this.customerName.value.trim();
        const phone = this.customerPhone.value.trim();
        const paymentStatus = this.paymentStatus.value;
        
        if (!name) {
            this.showError('Please fill in the buyer name');
            return;
        }
        
        // Create payment entry
        const payment = {
            id: Date.now(),
            number: number,
            customerName: name,
            customerPhone: phone || 'Not provided',
            amount: this.pricePerNumber,
            status: paymentStatus,
            timestamp: new Date().toISOString()
        };
        
        this.payments.push(payment);
        
        // Set number status based on payment status
        if (paymentStatus === 'paid') {
            this.numberStatus[number] = 'sold';
        } else {
            this.numberStatus[number] = 'reserved';
        }
        
        // Save to localStorage
        localStorage.setItem('payments', JSON.stringify(this.payments));
        localStorage.setItem('numberStatus', JSON.stringify(this.numberStatus));
        
        // Update displays
        this.updatePaymentList();
        this.updateNumberGrid();
        this.updateStats();
        
        this.closePaymentModal();
        const statusMessage = paymentStatus === 'paid' ? 'purchased and paid!' : 'reserved! Payment pending.';
        this.showSuccess(`Number ${number} has been ${statusMessage}`);
    }

    filterPayments(filter) {
        this.currentFilter = filter;
        
        // Update button states
        [this.showPendingBtn, this.showPaidBtn, this.showAllBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (filter === 'pending') this.showPendingBtn.classList.add('active');
        else if (filter === 'paid') this.showPaidBtn.classList.add('active');
        else this.showAllBtn.classList.add('active');
        
        this.updatePaymentList();
    }

    updatePaymentList() {
        let filteredPayments = this.payments;
        
        if (this.currentFilter === 'pending') {
            filteredPayments = this.payments.filter(p => p.status === 'pending');
        } else if (this.currentFilter === 'paid') {
            filteredPayments = this.payments.filter(p => p.status === 'paid');
        }
        
        if (filteredPayments.length === 0) {
            this.paymentList.innerHTML = '<p style="text-align: center; color: #718096; padding: 20px;">No payments found</p>';
            return;
        }
        
        this.paymentList.innerHTML = filteredPayments.map(payment => `
            <div class="payment-entry ${payment.status}">
                <div class="payment-info">
                    <div class="payment-number">Number ${payment.number}</div>
                    <div class="payment-customer">${payment.customerName} - ${payment.customerPhone}</div>
                </div>
                <div class="payment-amount">$${payment.amount.toFixed(2)}</div>
                <div class="payment-actions">
                    ${payment.status === 'pending' ? 
                        `<button class="mark-paid-btn" onclick="app.markAsPaid(${payment.id})">Mark Paid</button>` : 
                        '<span style="color: #68d391; font-weight: 600;">✓ Paid</span>'
                    }
                    <button class="delete-btn" onclick="app.deletePayment(${payment.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    markAsPaid(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment) {
            payment.status = 'paid';
            this.numberStatus[payment.number] = 'sold';
            
            localStorage.setItem('payments', JSON.stringify(this.payments));
            localStorage.setItem('numberStatus', JSON.stringify(this.numberStatus));
            
            this.updatePaymentList();
            this.updateNumberGrid();
            this.updateStats();
        }
    }

    deletePayment(paymentId) {
        if (confirm('Are you sure you want to delete this payment?')) {
            const payment = this.payments.find(p => p.id === paymentId);
            if (payment) {
                // Reset number status if payment is deleted
                if (payment.status === 'pending') {
                    this.numberStatus[payment.number] = 'available';
                } else if (payment.status === 'paid') {
                    this.numberStatus[payment.number] = 'available';
                }
                
                this.payments = this.payments.filter(p => p.id !== paymentId);
                
                localStorage.setItem('payments', JSON.stringify(this.payments));
                localStorage.setItem('numberStatus', JSON.stringify(this.numberStatus));
                
                this.updatePaymentList();
                this.updateNumberGrid();
                this.updateStats();
            }
        }
    }

    updateRange() {
        const min = parseInt(this.adminMinRange.value);
        const max = parseInt(this.adminMaxRange.value);
        
        if (min >= max) {
            this.showError('Maximum must be greater than minimum');
            return;
        }
        
        this.numberRange = { min, max };
        this.minInput.value = min;
        this.maxInput.value = max;
        
        localStorage.setItem('numberRange', JSON.stringify(this.numberRange));
        
        // Reset number status for new range
        this.numberStatus = {};
        localStorage.setItem('numberStatus', JSON.stringify(this.numberStatus));
        
        this.updateNumberGrid();
        this.showSuccess('Number range updated successfully');
    }

    updatePrice() {
        const price = parseFloat(this.pricePerNumberInput.value);
        
        if (price < 0) {
            this.showError('Price must be positive');
            return;
        }
        
        this.pricePerNumber = price;
        this.updatePriceDisplay();
        localStorage.setItem('pricePerNumber', price.toString());
        this.showSuccess('Price updated successfully');
    }

    updatePriceDisplay() {
        this.currentPrice.textContent = `$${this.pricePerNumber.toFixed(2)}`;
    }

    filterGrid(filter) {
        this.gridFilter = filter;
        
        // Update button states
        [this.showAvailableBtn, this.showReservedBtn, this.showSoldBtn, this.showAllNumbersBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (filter === 'available') this.showAvailableBtn.classList.add('active');
        else if (filter === 'reserved') this.showReservedBtn.classList.add('active');
        else if (filter === 'sold') this.showSoldBtn.classList.add('active');
        else this.showAllNumbersBtn.classList.add('active');
        
        this.updateNumberGrid();
    }

    updateNumberGrid() {
        const { min, max } = this.numberRange;
        let numbers = [];
        
        for (let i = min; i <= max; i++) {
            const status = this.numberStatus[i] || 'available';
            
            if (this.gridFilter === 'all' || status === this.gridFilter) {
                numbers.push({ number: i, status });
            }
        }
        // Render grid items with data-number attribute, no inline onclick
        this.numberGrid.innerHTML = numbers.map(item => `
            <div class="number-item ${item.status}" data-number="${item.number}">
                ${item.number}
            </div>
        `).join('');
        // Attach click event listeners to all number items
        this.numberGrid.querySelectorAll('.number-item').forEach(item => {
            item.addEventListener('click', () => {
                const number = parseInt(item.getAttribute('data-number'));
                this.selectNumber(number);
            });
        });
        this.updateStats();
    }

    selectNumber(number) {
        const status = this.numberStatus[number] || 'available';
        
        if (status === 'sold') {
            this.showError('This number is already sold');
            return;
        }
        
        if (status === 'reserved') {
            const payment = this.payments.find(p => p.number === number);
            if (payment) {
                alert(`Number ${number} is reserved by ${payment.customerName} (${payment.customerPhone})`);
            }
            return;
        }
        
        // If number is available, open purchase form
        this.showPaymentModal(number);
    }

    updateStats() {
        const { min, max } = this.numberRange;
        let available = 0, reserved = 0, sold = 0;
        let totalRevenue = 0;
        
        for (let i = min; i <= max; i++) {
            const status = this.numberStatus[i] || 'available';
            if (status === 'available') available++;
            else if (status === 'reserved') reserved++;
            else if (status === 'sold') sold++;
        }
        // Calculate revenue from paid payments
        this.payments.forEach(payment => {
            if (payment.status === 'paid') {
                totalRevenue += payment.amount;
            }
        });
        this.availableCount.textContent = available;
        this.reservedCount.textContent = reserved;
        this.soldCount.textContent = sold;
        // Only update totalRevenue if the element exists (admin panel)
        if (this.totalRevenue) {
            this.totalRevenue.textContent = `$${totalRevenue.toFixed(2)}`;
        }
    }

    initializeAds() {
        this.checkAdDisplay();
        this.trackUserInteractions();
    }

    trackUserInteractions() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('button')) {
                this.logUserAction('button_click', e.target.textContent);
            }
        });

        const originalPickNumber = this.pickNumber.bind(this);
        this.pickNumber = function() {
            this.logUserAction('number_generated', 'lottery_pick');
            return originalPickNumber.apply(this, arguments);
        };
    }

    logUserAction(action, details) {
        console.log(`User Action: ${action} - ${details}`);
        
        const userActions = JSON.parse(localStorage.getItem('userActions') || '[]');
        userActions.push({
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        });
        
        if (userActions.length > 50) {
            userActions.splice(0, userActions.length - 50);
        }
        
        localStorage.setItem('userActions', JSON.stringify(userActions));
    }

    checkAdDisplay() {
        if (this.adShownCount > 0 && this.adShownCount % 3 === 0) {
            setTimeout(() => {
                this.showAdModal();
            }, 2000);
        }
    }

    showAdModal() {
        if (this.adModal) {
            this.adModal.style.display = 'flex';
            this.adShownCount++;
            localStorage.setItem('adShownCount', this.adShownCount.toString());
            
            setTimeout(() => {
                this.closeAdModal();
            }, 30000);
        }
    }

    closeAdModal() {
        if (this.adModal) {
            this.adModal.style.display = 'none';
        }
    }

    showError(message) {
        alert(message);
    }

    showSuccess(message) {
        alert(message);
    }

    displayWinnerInfo(number) {
        // Find payment record for this number
        const payment = this.payments.find(p => p.number === number);
        
        if (payment) {
            // Show winner information
            this.winnerName.textContent = payment.customerName;
            this.winnerPhone.textContent = payment.customerPhone;
            this.winnerDate.textContent = new Date(payment.timestamp).toLocaleDateString();
            this.winnerInfo.style.display = 'block';
            
            // Update result section styling for winner
            this.resultSection.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
            this.resultSection.style.color = '#333';
            
            // Update text colors for better contrast
            this.resultSection.querySelectorAll('p').forEach(p => {
                p.style.color = '#333';
                p.style.opacity = '0.8';
            });
            
            this.winnerInfo.style.background = 'rgba(255, 255, 255, 0.3)';
            this.winnerInfo.style.border = '2px solid rgba(255, 255, 255, 0.5)';
            this.winnerInfo.querySelector('h3').style.color = '#333';
            this.winnerInfo.querySelectorAll('p').forEach(p => {
                p.style.color = '#333';
            });
            this.winnerInfo.querySelectorAll('strong').forEach(strong => {
                strong.style.color = '#d4af37';
            });
            this.winnerInfo.querySelectorAll('span').forEach(span => {
                span.style.color = '#333';
            });
        } else {
            // Hide winner information if no payment found
            this.winnerInfo.style.display = 'none';
            
            // Reset result section styling
            this.resultSection.style.background = 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)';
            this.resultSection.style.color = 'white';
            
            // Reset text colors
            this.resultSection.querySelectorAll('p').forEach(p => {
                p.style.color = 'white';
                p.style.opacity = '0.9';
            });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AdvancedLotteryApp();
});

// Add CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 