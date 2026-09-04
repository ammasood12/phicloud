// wechat-detector.js

// ===== TESTING CONFIGURATION =====
const FORCE_WECHAT_MODE = false; // Turn off testing mode
// const FORCE_WECHAT_MODE = true; // Turn on testing mode
// =================================

let isWeChat = false;

function createWeChatBanner() {
    // Check if banner already exists
    if (document.getElementById('wechatBanner')) return;
    
    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'wechatBanner';
    banner.className = 'guide-card wechat-banner';
    banner.style.cursor = 'pointer';
    banner.onclick = showWeChatMessage;
    
    // Add content
	// <i class="fas fa-chevron-right"></i>
    banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-globe"></i>
            <span><b>How to Open in browser (Recommended)<b></span>
        </div>        
    `;
    
    // Insert at the top of the page
    const firstElement = document.body.firstChild;
    document.body.insertBefore(banner, firstElement);
}

// Function to show WeChat message modal
function showWeChatMessage() {
    // Close any existing modal
    closeWeChatModal();
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'wechatModal';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 30px;
        width: 90%;
        max-width: 380px;
        padding: 30px 25px;
        text-align: center;
        box-shadow: 0 30px 60px rgba(0,0,0,0.2);
    `;
    
    modal.innerHTML = `
        <div style="
            font-size: 4rem; 
            margin-bottom: 15px;
            background: linear-gradient(135deg, #818bff20, #764ba220);
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            border: 3px solid #818bff30;
        ">
            📱
            <span style="
                position: absolute;
                margin-left: 60px;
                margin-top: -30px;
                background: #ef4444;
                color: white;
                font-size: 1.2rem;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 5px 10px rgba(239,68,68,0.3);
            ">⚠️</span>
        </div>
        
        <h2 style="
            color: #1e293b;
            font-size: 1.8rem;
            margin-bottom: 8px;
            font-weight: 700;
        ">Open in Browser</h2>
        
        <div style="
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            border-radius: 16px;
            margin: 20px 0;
            text-align: left;
        ">
            <p style="
                color: #475569;
                line-height: 1.6;
                margin: 0;
                font-size: 0.95rem;
            ">
                <span style="display: block; margin-bottom: 12px; font-weight: 600; color: #b91c1c;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                    Downloads don't work in WeChat
                </span>
                <span style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
                    <span style="
                        background: #fee2e2;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: #b91c1c;
                        font-weight: bold;
                        flex-shrink: 0;
                        margin-top: 2px;
                    ">1</span>
                    <span>Tap the menu <span style="
                        background: #1e293b;
                        color: white;
                        padding: 4px 10px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        margin: 0 4px;
                        display: inline-block;
                    ">⋯</span> icon</span>
                </span>
                <span style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="
                        background: #fee2e2;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: #b91c1c;
                        font-weight: bold;
                        flex-shrink: 0;
                        margin-top: 2px;
                    ">2</span>
                    <span>Select <span style="
                        background: linear-gradient(135deg, #818bff, #764ba2);
                        color: white;
                        padding: 4px 14px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        margin: 0 4px;
                        display: inline-block;
                    ">"Open in Browser"</span></span>
                </span>
            </p>
        </div>
        
        <button onclick="closeWeChatModal()" style="
            width: 100%;
            padding: 16px 0;
            background: linear-gradient(135deg, #818bff, #764ba2);
            border: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1rem;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s;
            box-shadow: 0 10px 20px rgba(102,126,234,0.3);
            margin-top: 10px;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 30px rgba(102,126,234,0.4)'" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px rgba(102,126,234,0.3)'">
            <i class="fas fa-check"></i>
            Got it
        </button>
    `;
    
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    // Close when clicking outside
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeWeChatModal();
        }
    });
}

// Function to close modal
window.closeWeChatModal = function() {
    const modal = document.getElementById('wechatModal');
    if (modal) {
        modal.remove();
    }
};

// Function to handle downloads in WeChat
function handleWeChatDownload(downloadUrl) {
    if (checkWeChat() || FORCE_WECHAT_MODE) {
        showWeChatMessage();
        return false; // Prevent download
    } else {
        window.open(downloadUrl, '_blank');
        return true;
    }
}

// Function to check if in WeChat
function checkWeChat() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') !== -1;
}

// Detect WeChat on page load
function detectWeChat() {
    // Check test mode first
    if (FORCE_WECHAT_MODE) {
        console.log('🔧 WeChat test mode enabled - FORCE_WECHAT_MODE = true');
        isWeChat = true;
    } else {
        isWeChat = checkWeChat();
    }
    
    if (isWeChat) {
        // showWeChatMessage(); // Show popup on every page
		createWeChatBanner();
        const banner = document.getElementById('wechatBanner');
        if (banner) {
            banner.classList.add('show');
        }
    }
}

// Open on load
window.openInBrowser = function() {
    showWeChatMessage(); // Just show the same popup
	console.log('Show wechat message active');
};

// Run detection when page loads
document.addEventListener('DOMContentLoaded', function() {
    detectWeChat();
	console.log('Wechat Detection active');
});

// Make functions globally available
window.isInWeChat = function() { return isWeChat || FORCE_WECHAT_MODE; };
window.handleWeChatDownload = handleWeChatDownload;
window.showWeChatMessage = showWeChatMessage;