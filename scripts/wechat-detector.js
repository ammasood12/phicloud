// wechat-detector.js

// ===== TESTING CONFIGURATION =====
const FORCE_WECHAT_MODE = false; // Turn off testing mode
// const FORCE_WECHAT_MODE = true; // Turn on testing mode

let isWeChat = false;

// ===== GENERAL NOTICE =====
const SHOW_HOLIDAY_NOTICE = true; // Set to false to hide the holiday notice
// const SHOW_HOLIDAY_NOTICE = false; // Set to false to hide the holiday notice

function createInfoBoxAlert() {
    if (!SHOW_HOLIDAY_NOTICE) return;
    if (document.getElementById('websiteGeneralNotice')) return;

    const alertBox = document.createElement('div');
    alertBox.id = 'websiteGeneralNotice';
    alertBox.className = 'general-notice-box';
    alertBox.innerHTML = `        


<div style="font-size: 15px; line-height: 1.5;">
    <i class="fa-solid fa-triangle-exclamation"></i>
    <strong>Holiday Notice (September 25, 2026)</strong>
</div>

<div style="font-size: 15px; line-height: 1.5;">
    Connection quality may vary during public holidays and special periods.
    <strong>Select IPv6 server or IPv6 Group </strong>to help resolve connection issues.<br>

    <div style="margin-top:10px;">
	
		<strong style="font-size:14px;">(Click below → Select Device → App → Help → Sep 2026 HOT FIX)</strong><br>
        <a href="guide.html"
           style="display:inline-block;
                  padding:8px 14px;
                  background:#b91c1c;
                  color:#fff;
                  text-decoration:none;
                  border-radius:5px;
                  font-weight:bold;">
            CHECK SEP-2026 HOT FIX →<br>
        </a>
    </div>
</div>


    `;

    // Find all header elements (works with or without id="header")
    const headers = document.querySelectorAll('.header');
    const guideCard = document.querySelector('.guide-card');

    if (headers.length > 0) {
        // Insert after the LAST header, so the notice sits below all headers
        const lastHeader = headers[headers.length - 1];
        lastHeader.parentNode.insertBefore(alertBox, lastHeader.nextSibling);
    } else if (guideCard) {
        // Fallback: at the top of the guide card
        guideCard.insertBefore(alertBox, guideCard.firstChild);
    } else {
        // Last fallback: top of body
        document.body.insertBefore(alertBox, document.body.firstChild);
    }
}


// ===== Inject Styles =====
function injectWeChatStyles() {
    if (document.getElementById('wechatDetectorStyles')) return;

    const style = document.createElement('style');
    style.id = 'wechatDetectorStyles';
    style.textContent = `
        /* ===== Banner ===== */
        .wechat-banner {
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #818bff, #764ba2);
            color: #fff;
            font-size: 0.9rem;
            font-weight: 500;
            border-radius: 12px;
            margin: 10px auto;
            max-width: 600px;
            box-shadow: 0 6px 18px rgba(102,126,234,0.35);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            -webkit-tap-highlight-color: transparent;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
        }
        .wechat-banner::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }
        .wechat-banner:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 24px rgba(102,126,234,0.45);
        }
        .wechat-banner:hover::before { transform: translateX(100%); }
        .wechat-banner:active { transform: scale(0.98); }
        .wechat-banner i { font-size: 1rem; opacity: 0.95; }
        .wechat-banner span { letter-spacing: 0.2px; }
        .wechat-banner-arrow {
            margin-left: 4px;
            font-size: 0.8rem;
            opacity: 0.85;
            transition: transform 0.25s ease;
        }
        .wechat-banner:hover .wechat-banner-arrow { transform: translateX(3px); }

		/* ===== General Notice Box (always shown) ===== */
		.general-notice-box {
			background: #fee2e2;
			padding: 10px;
			border-radius: 10px;
			display: block;
			gap: 12px;
			align-items: center;
			border-left: 4px solid #cb0000;
			margin: 15px 10px 0px;
			color: #b91c1c;
		}

		.general-notice-box i {
			color: #cb0000;
			font-size: 1.2rem;
			flex-shrink: 0;
		}

		.general-notice-box img {
			height: 40px;
		}

		.general-notice-box strong {
			color: #991b1b;
		}
		
		/* ===== Modal Overlay ===== */
        .wechat-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
            box-sizing: border-box;
        }

        /* ===== Modal ===== */
        .wechat-modal {
            background: white;
            border-radius: 24px;
            width: 100%;
            max-width: 380px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 0;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.25);
            animation: wechatSlideUp 0.3s ease-out;
        }

        @keyframes wechatSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ===== Header ===== */
        .wechat-header {
            background: linear-gradient(135deg, #818bff, #764ba2);
            padding: 20px 22px;
            border-radius: 24px 24px 0 0;
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: left;
        }

        .wechat-header-icon {
            background: rgba(255,255,255,0.2);
            width: 40px; height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            color: white;
            flex-shrink: 0;
        }

        .wechat-header h2 {
            color: white;
            font-size: 1.1rem;
            margin: 0;
            font-weight: 700;
            line-height: 1.2;
        }

        .wechat-header p {
            color: rgba(255,255,255,0.85);
            font-size: 0.75rem;
            margin: 3px 0 0;
            line-height: 1.35;
        }
		
		/* ===== Warning Banner ===== */
        .wechat-warning {
            background: #fef2f2;
            border-left: 3px solid #ef4444;
            color: #b91c1c;
            font-size: 0.78rem;
            font-weight: 500;
            line-height: 1.4;
            padding: 10px 14px;
            margin: 14px 22px 0;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            text-align: left;
        }
        .wechat-warning i {
            color: #ef4444;
            font-size: 0.9rem;
            flex-shrink: 0;
        }

        /* ===== Steps ===== */
        .wechat-step { padding: 14px 22px; }
        .wechat-step + .wechat-step { padding-top: 0; }
        .wechat-step:last-of-type { padding-bottom: 18px; }

        .wechat-step-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
        }

        .wechat-step-header {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }

        .wechat-step-number {
            background: linear-gradient(135deg, #818bff, #764ba2);
            color: white;
            width: 24px; height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
            flex-shrink: 0;
        }

        .wechat-step-title {
            color: #1e293b;
            font-weight: 600;
            font-size: 0.9rem;
            white-space: nowrap;
        }

        /* ===== Compact Copy Button ===== */
        .wechat-copy-btn-compact {
            padding: 7px 14px;
            background: linear-gradient(135deg, #818bff, #764ba2);
            border: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.78rem;
            color: white;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.25s ease;
            box-shadow: 0 4px 12px rgba(102,126,234,0.35);
            -webkit-tap-highlight-color: transparent;
            flex-shrink: 0;
            white-space: nowrap;
        }
        .wechat-copy-btn-compact:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(102,126,234,0.45);
        }
        .wechat-copy-btn-compact:active { transform: scale(0.96); }
        .wechat-copy-btn-compact.success { background: linear-gradient(135deg, #10b981, #059669); }
        .wechat-copy-btn-compact.error { background: linear-gradient(135deg, #ef4444, #dc2626); }

        /* ===== Minimal Browser List ===== */
        .wechat-browser-list {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
            padding: 2px 0;
        }

        .wechat-browser-item {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 500;
        }

        .wechat-browser-item i { font-size: 1rem; opacity: 0.9; }

        .wechat-browser-item .fa-chrome { color: #4285F4; }
        .wechat-browser-item .fa-safari { color: #006CFF; }
        .wechat-browser-item .fa-edge { color: #0078D7; }
        .wechat-browser-item .fa-firefox-browser { color: #FF7139; }

        /* ===== Paste Visual ===== */
        .wechat-paste-visual {
            background: #f8fafc;
            border-radius: 12px;
            padding: 12px 14px;
            text-align: left;
        }

        .wechat-paste-steps {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .wechat-paste-line {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 0.75rem;
            color: #64748b;
            line-height: 1.4;
        }

        .wechat-paste-line i {
            color: #94a3b8;
            font-size: 0.55rem;
            margin-top: 5px;
            flex-shrink: 0;
        }

        .wechat-paste-line b { color: #475569; font-weight: 600; }

        /* ===== Close Button ===== */
        .wechat-close-wrap { padding: 0 22px 20px; }

        .wechat-close-btn {
            width: 100%;
            padding: 12px 0;
            background: transparent;
            border: 1.5px solid #e2e8f0;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.88rem;
            color: #64748b;
            cursor: pointer;
            transition: all 0.3s;
            -webkit-tap-highlight-color: transparent;
        }
        .wechat-close-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
        }
        .wechat-close-btn:active { background: #f1f5f9; }
    `;

    document.head.appendChild(style);
}

function createWeChatBanner() {
    if (document.getElementById('wechatBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'wechatBanner';
    banner.className = 'wechat-banner';
    banner.onclick = showWeChatMessage;

    banner.innerHTML = `
        <i class="fa-solid fa-globe"></i>
        <span>Recommended to open in browser</span>
        <i class="fa-solid fa-arrow-right wechat-banner-arrow"></i>
    `;

    const firstElement = document.body.firstChild;
    document.body.insertBefore(banner, firstElement);
}

// Function to copy current URL to clipboard
function copyCurrentLink() {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showCopySuccess();
        }).catch(() => {
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }
}

// Fallback copy method for older browsers
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        showCopyError();
    }

    document.body.removeChild(textArea);
}

// Show success feedback
function showCopySuccess() {
    const btn = document.getElementById('copyLinkBtn');
    if (!btn) return;
    const originalText = btn.innerHTML;

    btn.classList.add('success');
    btn.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        Copied!
    `;

    setTimeout(() => {
        btn.classList.remove('success');
        btn.innerHTML = originalText;
    }, 2000);
}

// Show error feedback
function showCopyError() {
    const btn = document.getElementById('copyLinkBtn');
    if (!btn) return;
    const originalText = btn.innerHTML;

    btn.classList.add('error');
    btn.innerHTML = `
        <i class="fa-solid fa-circle-xmark"></i>
        Failed
    `;

    setTimeout(() => {
        btn.classList.remove('error');
        btn.innerHTML = originalText;
    }, 2500);
}

// Function to show WeChat message modal
function showWeChatMessage() {
    closeWeChatModal();

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'wechatModal';
    modalOverlay.className = 'wechat-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'wechat-modal';

    modal.innerHTML = `
        <!-- Compact Header -->
        <div class="wechat-header">
            <div class="wechat-header-icon">
                <i class="fa-solid fa-globe"></i>
            </div>
			<div>
                <h2>Open in Browser</h2>
                <p>For the best experience, use a browser app</p>
            </div>
        </div>
		
		<!-- Warning Banner -->
        <div class="wechat-warning">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>Downloads don't work in WeChat</span>
        </div>

        <!-- Step 1: Copy the link -->

        <!-- Step 1: Copy the link -->
        <div class="wechat-step">
            <div class="wechat-step-row">
                <div class="wechat-step-header">
                    <div class="wechat-step-number">1</div>
                    <span class="wechat-step-title">Copy the link</span>
                </div>
                <button id="copyLinkBtn" class="wechat-copy-btn-compact" onclick="copyCurrentLink()">
                    <i class="fa-solid fa-copy"></i>
                    Copy
                </button>
            </div>
        </div>

        <!-- Step 2: Open a browser -->
        <div class="wechat-step">
            <div class="wechat-step-row">
                <div class="wechat-step-header">
                    <div class="wechat-step-number">2</div>
                    <span class="wechat-step-title">Open a browser</span>
                </div>
            </div>
			<div class="wechat-browser-list">
				<span class="wechat-browser-item"><i class="fa-brands fa-chrome"></i> Chrome</span>
				<span class="wechat-browser-item"><i class="fa-brands fa-safari"></i> Safari</span>
				<span class="wechat-browser-item"><i class="fa-brands fa-edge"></i> Edge</span>
				<span class="wechat-browser-item"><i class="fa-brands fa-firefox-browser"></i> Firefox</span>
				<span class="wechat-browser-item"><i class="fa-solid fa-globe"></i> or any other browser</span>
			</div>
        </div>

        <!-- Step 3: Paste and go -->
        <div class="wechat-step">
            <div class="wechat-step-row">
                <div class="wechat-step-header">
                    <div class="wechat-step-number">3</div>
                    <span class="wechat-step-title">Paste in browser &amp; tap Go</span>
                </div>
            </div>

            <div class="wechat-paste-visual">
                <div class="wechat-paste-steps">
                    <div class="wechat-paste-line">
                        <i class="fa-solid fa-circle"></i>
                        <span>Tap the <b>address bar</b> at the top of the browser</span>
                    </div>
                    <div class="wechat-paste-line">
                        <i class="fa-solid fa-circle"></i>
                        <span><b>Long-press</b> the bar, then select <b>Paste</b></span>
                    </div>
                    <div class="wechat-paste-line">
                        <i class="fa-solid fa-circle"></i>
                        <span>Tap <b>Go</b> — the page opens in your browser</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Close Button -->
        <div class="wechat-close-wrap">
            <button class="wechat-close-btn" onclick="closeWeChatModal()">
                Close
            </button>
        </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

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

window.copyCurrentLink = copyCurrentLink;

// Function to handle downloads in WeChat
function handleWeChatDownload(downloadUrl) {
    if (checkWeChat() || FORCE_WECHAT_MODE) {
        showWeChatMessage();
        return false;
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
    if (FORCE_WECHAT_MODE) {
        console.log('🔧 WeChat test mode enabled - FORCE_WECHAT_MODE = true');
        isWeChat = true;
    } else {
        isWeChat = checkWeChat();
    }

    if (isWeChat) {
        createWeChatBanner();
    }
}

window.openInBrowser = function() {
    showWeChatMessage();
    console.log('Show wechat message active');
};

// Run detection when page loads
document.addEventListener('DOMContentLoaded', function() {
    injectWeChatStyles();
	createInfoBoxAlert();
    detectWeChat();
    console.log('Wechat Detection active');
});

window.isInWeChat = function() { return isWeChat || FORCE_WECHAT_MODE; };
window.handleWeChatDownload = handleWeChatDownload;
window.showWeChatMessage = showWeChatMessage;