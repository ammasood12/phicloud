

// Copy page link function with toast notification
window.copyPageLink = function() {
	const url = window.location.href;
	navigator.clipboard.writeText(url).then(function() {
		// Create toast notification
		const toast = document.createElement('div');
		toast.className = 'toast toast-success';
		toast.innerHTML = '<i class="fas fa-check-circle"></i> Link copied to clipboard!';
		document.body.appendChild(toast);
		
		// Remove toast after 2 seconds
		setTimeout(() => {
			toast.classList.add('toast-hide');
			setTimeout(() => {
				document.body.removeChild(toast);
			}, 300);
		}, 2000);
		
		// Change share icon color temporarily
		const shareIcon = document.querySelector('.share-icon');
		if (shareIcon) {
			shareIcon.style.color = '#10b981';
			setTimeout(() => {
				shareIcon.style.color = '#818bff';
			}, 1000);
		}
	}).catch(function(err) {
		// Error toast
		const toast = document.createElement('div');
		toast.className = 'toast toast-error';
		toast.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to copy link';
		document.body.appendChild(toast);
		
		setTimeout(() => {
			toast.classList.add('toast-hide');
			setTimeout(() => {
				document.body.removeChild(toast);
			}, 300);
		}, 2000);
	});
};

// Toggle rounded header corners only at top of page.
(function() {
	function syncScrolledClass() {
		if (!document.body) return;

		if (window.scrollY > 0) {
			document.body.classList.add('scrolled');
		} else {
			document.body.classList.remove('scrolled');
		}
	}

	window.addEventListener('scroll', syncScrolledClass, { passive: true });
	window.addEventListener('load', syncScrolledClass);
	syncScrolledClass();
})();
