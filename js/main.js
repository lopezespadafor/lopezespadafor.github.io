;(function () {
	
	'use strict';



	// iPad and iPod detection	
	var isiPad = function(){
		return (navigator.platform.indexOf("iPad") != -1);
	};

	var isiPhone = function(){
	    return (
			(navigator.platform.indexOf("iPhone") != -1) || 
			(navigator.platform.indexOf("iPod") != -1)
	    );
	};

	var parallax = function() {
		$(window).stellar({
			horizontalScrolling: false,
			hideDistantElements: false, 
			responsive: true

		});
	};

	// Document on load.
	$(function(){
		parallax();

		// Expose toggleMenu globally so HTML onclick works across pages
		window.toggleMenu = function() {
			var nav = document.getElementById('navbarNav');
			var btn = document.getElementById('navbarToggler');
			if (!nav || !btn) return;
			var expanded = btn.getAttribute('aria-expanded') === 'true';
			btn.setAttribute('aria-expanded', String(!expanded));
			btn.classList.toggle('open');
			nav.classList.toggle('show');
			nav.setAttribute('aria-hidden', String(expanded));
		};

		 // Also bind the toggler with an event listener as a fallback (more robust than relying on inline onclick)
		var _togglerBtn = document.getElementById('navbarToggler');
		if (_togglerBtn) {
			_togglerBtn.addEventListener('click', function(e){
				e.stopPropagation();
				window.toggleMenu();
			});
		}

		// Close menu when clicking outside
		document.addEventListener('click', function(e){
			var nav = document.getElementById('navbarNav');
			var btn = document.getElementById('navbarToggler');
			if (!nav || !btn) return;
			if (nav.classList.contains('show') && !nav.contains(e.target) && !btn.contains(e.target)) {
				window.toggleMenu();
			}
		});

		// Close menu when selecting a link (mobile)
		var navLinks = document.querySelectorAll('#navbarNav ul li a');
		navLinks.forEach(function(a){
			a.addEventListener('click', function(){
				var nav = document.getElementById('navbarNav');
				if (nav && nav.classList.contains('show')) window.toggleMenu();
			});
		});

		// Mobile-cycle button: cycle sections or pages on small screens
		(function(){
			var cyclePages = ['index.html','services.html','about.html','contact.html'];
			var cycleSections = ['home','services','about','contact'];

			function getCurrentPageFilename(){
				var path = window.location.pathname;
				var name = path.substring(path.lastIndexOf('/')+1);
				if (!name) return 'index.html';
				return name;
			}

			function goToNextSectionOrPage(){
				var presentSections = cycleSections.map(function(id){ return document.getElementById(id); }).filter(Boolean);
				if (presentSections.length > 0){
					// If page contains sections, scroll to next one based on current viewport
					var top = window.scrollY || window.pageYOffset;
					var next = null;
					for (var i=0;i<presentSections.length;i++){
						var elTop = presentSections[i].getBoundingClientRect().top + window.pageYOffset;
						if (elTop > top + 10){ next = presentSections[i]; break; }
					}
					if (!next) next = presentSections[0];
					next.scrollIntoView({ behavior: 'smooth', block: 'start' });
					return;
				}

				// Otherwise navigate among pages in order
				var current = getCurrentPageFilename();
				var idx = cyclePages.indexOf(current);
				if (idx === -1) idx = 0;
				var nextPage = cyclePages[(idx + 1) % cyclePages.length];
				window.location.href = nextPage;
			}

			var btn = document.getElementById('mobileCycleBtn');
			if (!btn) return;
			btn.addEventListener('click', function(e){ e.preventDefault(); goToNextSectionOrPage(); });
			btn.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToNextSectionOrPage(); } });
		})();

	});


}());