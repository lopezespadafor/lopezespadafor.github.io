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

		/* --- Central i18n loader: manages language selection, loads <lang>.json, applies translations and handles RTL --- */
		(function(){
			var LANG_KEY = 'site_lang';
			var defaultLang = 'es';
			var selector = document.getElementById('languageSelector');
			var btns = selector ? selector.querySelectorAll('.lang-btn') : [];
			var currentLang = localStorage.getItem(LANG_KEY) || defaultLang;

			function setLangAttr(translations, lang){
				// Ensure document element lang and dir are set immediately
				try{
					document.documentElement.lang = (translations && translations.locale) ? translations.locale : (lang || 'en');
					document.documentElement.dir = (translations && translations.dir) ? translations.dir : 'ltr';
				}catch(e){ console.warn('Failed to set lang/dir', e); }
			}

			function applyTranslations(t){
				if(!t || typeof t !== 'object') return;
				// Navigation: supports nested or flat structure
				var navItems = document.querySelectorAll('.fh5co-main-nav ul li a, .mobile-nav-panel a');
				if(navItems.length >= 4){
					var nav = t.nav || {};
					navItems[0].textContent = nav.home || t.nav_home || navItems[0].textContent;
					navItems[1].textContent = nav.services || t.nav_services || navItems[1].textContent;
					navItems[2].textContent = nav.about || t.nav_about || navItems[2].textContent;
					navItems[3].textContent = nav.contact || t.nav_contact || navItems[3].textContent;
				}

				// Determine current page to source hero titles
				var body = document.body;
				var pageKey = 'home';
				if(body.classList.contains('page-services')) pageKey = 'services';
				else if(body.classList.contains('page-about')) pageKey = 'about';
				else if(body.classList.contains('page-contact')) pageKey = 'contact';

				var pageTranslations = (t[pageKey]) || {};

				// Hero
				var el = document.querySelector('.fh5co-intro h1');
				if(el){
					el.textContent = pageTranslations.title || t.home && t.home.title || t.home_title || el.textContent;
				}
				el = document.querySelector('.fh5co-intro p');
				if(el){
					el.textContent = pageTranslations.subtitle || t.home && t.home.subtitle || t.home_subtitle || el.textContent;
				}

				// Services / about / contact specific elements by id (if present)
				var mapIdToKey = [
					{ id: 'fiscal_advice_title', key: ['services','fiscal_advice','title'] },
					{ id: 'fiscal_advice_body1', key: ['services','fiscal_advice','body1'] },
					{ id: 'fiscal_advice_body2', key: ['services','fiscal_advice','body2'] },
					{ id: 'lopezespadafor_title', key: ['about','lopezespadafor','title'] },
					{ id: 'lopezespadafor_body', key: ['about','lopezespadafor','body'] },
					{ id: 'vision_title', key: ['about','vision','title'] },
					{ id: 'vision_body', key: ['about','vision','body'] },
					{ id: 'born_idea_body', key: ['about','born_idea','body'] },
					{ id: 'lopezespadafor_title_footer', key: ['about','lopezespadafor','title'] },
					{ id: 'lopezespadafor_body_footer', key: ['about','lopezespadafor','body'] }
				];

				mapIdToKey.forEach(function(mapping){
					var node = document.getElementById(mapping.id);
					if(!node) return;
					var value = mapping.key.reduce(function(acc, k){ return acc && acc[k] ? acc[k] : null; }, t);
					if(!value){
						// try flat keys fallback
						var flatKey = mapping.id;
						value = t[flatKey] || null;
					}
					if(value) node.textContent = value;
				});

				// Footer
				var fAbout = t.footer && t.footer.about || t.footer_about;
				el = document.querySelector('#fh5co-footer .col-md-4 p');
				if(el && fAbout) el.textContent = fAbout;
				el = document.querySelector('.fh5co-copyright p');
				var fRights = t.footer && t.footer.rights || t.footer_rights;
				if(el && fRights) el.innerHTML = fRights;

				// Quick links and follow us (if present)
				var q = t.quick_links || {};
				var qTitle = q.title || t.quick_links_title;
				var follow = t.follow_us || {};
				// optional: set other text nodes if present

				// Form placeholders (contact page typical)
				var nameInput = document.querySelector('input[name="Nombre"], input[name="name"], input[placeholder]');
				if(nameInput){
					var phName = (t.form && t.form.placeholder && t.form.placeholder.name) || t.form_placeholder_name || (t.form && t.form.name) || null;
					if(phName) nameInput.placeholder = phName;
				}

				// Generic replacements for elements with data-i18n attribute (if any)
				var attrNodes = document.querySelectorAll('[data-i18n]');
				attrNodes.forEach(function(n){
					var key = n.getAttribute('data-i18n');
					var parts = key.split('.');
					var v = parts.reduce(function(acc, k){ return acc && acc[k] ? acc[k] : null; }, t);
					if(v) n.textContent = v;
				});
			};

			function loadLang(lang){
				fetch(lang + '.json')
					.then(function(r){ return r.json(); })
					.then(function(translations){
						// update lang attrs immediately
						setLangAttr(translations, lang);
						applyTranslations(translations);
					})
					.catch(function(err){
						console.error('Failed to load language file:', lang + '.json', err);
					});
			}

			function setLang(lang){
				// Persist selection immediately
				localStorage.setItem(LANG_KEY, lang);
				// Update selected state for buttons
				btns.forEach(function(btn){ btn.classList.toggle('selected', btn.dataset.lang === lang); });
				// Apply dir/lang immediately for instant RTL support
				try{
					document.documentElement.lang = lang || 'en';
					document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
				}catch(e){ console.warn('Failed to set lang/dir synchronously', e); }
				// Then load full translations (which will refine locale/dir from JSON)
				loadLang(lang);
			}

			// Attach click handlers
			btns.forEach(function(btn){
				btn.addEventListener('click', function(){ setLang(btn.dataset.lang); });
			});

			// Initialize
			setLang(currentLang);
		})();

	});


}());