(function () {
    const on = addEventListener;
    const $ = function (q) {
        return document.querySelector(q)
    };
    const $$ = function (q) {
        return document.querySelectorAll(q)
    };
    const $body = document.body;
    const $inner = $('.inner');
    const client = (function () {
        let o = {browser: 'other', browserVersion: 0, os: 'other', osVersion: 0, mobile: false, canUse: null},
            ua = navigator.userAgent, a, i;
        a = [['firefox', /Firefox\/([0-9\.]+)/], ['edge', /Edge\/([0-9\.]+)/], ['safari', /Version\/([0-9\.]+).+Safari/], ['chrome', /Chrome\/([0-9\.]+)/], ['chrome', /CriOS\/([0-9\.]+)/], ['ie', /Trident\/.+rv:([0-9]+)/]];
        for (i = 0; i < a.length; i++) {
            if (ua.match(a[i][1])) {
                o.browser = a[i][0];
                o.browserVersion = parseFloat(RegExp.$1);
                break;
            }
        }
        a = [['ios', /([0-9_]+) like Mac OS X/, function (v) {
            return v.replace('_', '.').replace('_', '');
        }], ['ios', /CPU like Mac OS X/, function (v) {
            return 0
        }], ['ios', /iPad; CPU/, function (v) {
            return 0
        }], ['android', /Android ([0-9\.]+)/, null], ['mac', /Macintosh.+Mac OS X ([0-9_]+)/, function (v) {
            return v.replace('_', '.').replace('_', '');
        }], ['windows', /Windows NT ([0-9\.]+)/, null], ['undefined', /Undefined/, null],];
        for (i = 0; i < a.length; i++) {
            if (ua.match(a[i][1])) {
                o.os = a[i][0];
                o.osVersion = parseFloat(a[i][2] ? (a[i][2])(RegExp.$1) : RegExp.$1);
                break;
            }
        }
        if (o.os === 'mac' &&
            ('ontouchstart' in window) &&
            ((screen.width === 1024 && screen.height === 1366) ||
                (screen.width === 834 && screen.height === 1112) ||
                (screen.width === 810 && screen.height === 1080) ||
                (screen.width === 768 && screen.height === 1024))) {
            o.os = 'ios';
        }
        o.mobile = (o.os === 'android' || o.os === 'ios');

        const _canUse = document.createElement('div');
        o.canUse = function (p) {
            let e = _canUse.style, up = p.charAt(0).toUpperCase() + p.slice(1);
            return (p in e || ('Moz' + up) in e || ('Webkit' + up) in e || ('O' + up) in e || ('ms' + up) in e);
        };
        return o;
    }());

    const trigger = function (t) {
        if (client.browser === 'ie') {
            let e = document.createEvent('Event');
            e.initEvent(t, false, true);
            dispatchEvent(e);
        } else dispatchEvent(new Event(t));
    };

    const cssRules = function (selectorText) {
        let ss = document.styleSheets, a = [], f = function (s) {
            let r = s.cssRules, i;
            for (i = 0; i < r.length; i++) {
                let current = r[i];

                if (current instanceof CSSMediaRule && matchMedia(current.conditionText).matches) (f)(current);
                else if (current instanceof CSSStyleRule && current.selectorText === selectorText) a.push(current);
            }
        }, x, i;
        for (i = 0; i < ss.length; i++) f(ss[i]);
        return a;
    };
    const thisHash = function () {
        let h = location.hash ? location.hash.substring(1) : null, a;
        if (!h) return null;
        if (h.match(/\?/)) {
            a = h.split('?');
            h = a[0];
            history.replaceState(undefined, undefined, '#' + h);
            window.location.search = a[1];
        }
        if (h.length > 0 && !h.match(/^[a-zA-Z]/)) h = 'x' + h;
        if (typeof h == 'string') h = h.toLowerCase();
        return h;
    };
    const scrollToElement = function (e, style, duration) {
        let y, cy, dy, start, easing, offset, f;
        if (!e) y = 0; else {
            offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset) : 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
            switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {
                case 'default':
                default:
                    y = e.offsetTop + offset;
                    break;
                case 'center':
                    if (e.offsetHeight < window.innerHeight) y = e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2) + offset; else y = e.offsetTop - offset;
                    break;
                case 'previous':
                    if (e.previousElementSibling) y = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset; else y = e.offsetTop + offset;
                    break;
            }
        }
        if (!style) style = 'smooth';
        if (!duration) duration = 750;
        if (style === 'instant') {
            window.scrollTo(0, y);
            return;
        }
        start = Date.now();
        cy = window.scrollY;
        dy = y - cy;
        switch (style) {
            case 'linear':
                easing = function (t) {
                    return t
                };
                break;
            case 'smooth':
                easing = function (t) {
                    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
                };
                break;
        }
        f = function () {
            const t = Date.now() - start;
            if (t >= duration) window.scroll(0, y); else {
                window.scroll(0, cy + (dy * easing(t / duration)));
                requestAnimationFrame(f);
            }
        };
        f();
    };
    const scrollToTop = function () {
        scrollToElement(null);
    };
    const loadElements = function (parent) {
        let a, e, x, i;
        a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
        for (i = 0; i < a.length; i++) {
            a[i].src = a[i].dataset.src;
            a[i].dataset.src = "";
        }
        a = parent.querySelectorAll('video[autoplay]');
        for (i = 0; i < a.length; i++) {
            if (a[i].paused) a[i].play();
        }
        e = parent.querySelector('[data-autofocus="1"]');
        x = e ? e.tagName : null;
        switch (x) {
            case 'FORM':
                e = e.querySelector('.field input, .field select, .field textarea');
                if (e) e.focus();
                break;
            default:
                break;
        }
    };
    const unloadElements = function (parent) {
        let iframes, focussedElement, i;
        iframes = parent.querySelectorAll('iframe[data-src=""]');
        for (i = 0; i < iframes.length; i++) {
            if (iframes[i].dataset.srcUnload === '0') continue;
            iframes[i].dataset.src = iframes[i].src;
            iframes[i].src = '';
        }
        iframes = parent.querySelectorAll('video');
        for (i = 0; i < iframes.length; i++) {
            if (!iframes[i].paused) iframes[i].pause();
        }
        focussedElement = $(':focus');
        if (focussedElement) focussedElement.blur();
    };
    window._scrollToTop = scrollToTop;
    let thisURL = function () {
        return window.location.href.replace(window.location.search, '').replace(/#$/, '');
    };
    const getVar = function (name) {
        let a = window.location.search.substring(1).split('&'), b, k;
        for (k in a) {
            b = a[k].split('=');
            if (b[0] == name) return b[1];
        }
        return null;
    };
    const errors = {
        handle: function (handler) {
            window.onerror = function (message, url, line, column, error) {
                (handler)(error.message);
                return true;
            };
        }, unhandle: function () {
            window.onerror = null;
        }
    };
    const db = {
        open: function (objectStoreName, handler) {
            const request = indexedDB.open('carrd');
            request.onupgradeneeded = function (event) {
                event.target.result.createObjectStore(objectStoreName, {keyPath: 'id'});
            };
            request.onsuccess = function (event) {
                (handler)(event.target.result.transaction([objectStoreName], 'readwrite').objectStore(objectStoreName));
            };
        }, put: function (objectStore, values, handler) {
            let request = objectStore.put(values);
            request.onsuccess = function (event) {
                (handler)();
            };
            request.onerror = function (event) {
                throw new Error('db.put: error');
            };
        }, get: function (objectStore, id, handler) {
            let request = objectStore.get(id);
            request.onsuccess = function (event) {
                if (!event.target.result) throw new Error('db.get: could not retrieve object with id "' + id + '"');
                (handler)(event.target.result);
            };
            request.onerror = function (event) {
                throw new Error('db.get: error');
            };
        }, delete: function (objectStore, id, handler) {
            objectStore.delete(id).onsuccess = function (event) {
                (handler)(event.target.result);
            };
        },
    };
    on('load', function () {
        setTimeout(function () {
            $body.className = $body.className.replace(/\bis-loading\b/, 'is-playing');
            setTimeout(function () {
                $body.className = $body.className.replace(/\bis-playing\b/, 'is-ready');
            }, 750);
        }, 100);
    });
    (function () {
        let initialSection, initialScrollPoint, initialId, header, footer, name, hideHeader, hideFooter,
            disableAutoScroll, h, e, ee, k, locked = false, doNext = function () {
                let section;
                section = $('#main > .inner > section.active').nextElementSibling;
                if (!section || section.tagName !== 'SECTION') return;
                location.href = '#' + section.id.replace(/-section$/, '');
            }, doPrevious = function () {
                let section;
                section = $('#main > .inner > section.active').previousElementSibling;
                if (!section || section.tagName !== 'SECTION') return;
                location.href = '#' + (section.matches(':first-child') ? '' : section.id.replace(/-section$/, ''));
            }, doFirst = function () {
                let section;
                section = $('#main > .inner > section:first-of-type');
                if (!section || section.tagName !== 'SECTION') return;
                location.href = '#' + section.id.replace(/-section$/, '');
            }, doLast = function () {
                let section;
                section = $('#main > .inner > section:last-of-type');
                if (!section || section.tagName !== 'SECTION') return;
                location.href = '#' + section.id.replace(/-section$/, '');
            }, doEvent = function (id, type) {
                if ('CARRD_DISABLE_EVENTS' in window) return;
                let name = id.split(/-[a-z]+$/)[0], i;
                if (name in sections && 'events' in sections[name] && type in sections[name].events) for (i in sections[name].events[type]) (sections[name].events[type][i])();
            }, sections = {
                'done': {
                    events: {
                        onopen: [function () {
                            // TODO: add analytics
                            console.log("onopen")
                        },],
                    },
                }, 'home': {
                    events: {
                        onopen: [function () {
                            // TODO: add analytics
                            console.log("onopen")

                        },],
                    },
                },
            };
        window._next = doNext;
        window._previous = doPrevious;
        window._first = doFirst;
        window._last = doLast;
        window._scrollToTop = function () {
            let section, id;
            scrollToElement(null);
            if (!!(section = $('section.active'))) {
                id = section.id.replace(/-section$/, '');
                if (id === 'home') id = '';
                history.pushState(null, null, '#' + id);
            }
        };
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        header = $('#header');
        footer = $('#footer');
        h = thisHash();
        if (h && !h.match(/^[a-zA-Z0-9\-]+$/)) h = null;
        if (e = $('[data-scroll-id="' + h + '"]')) {
            initialScrollPoint = e;
            initialSection = initialScrollPoint.parentElement;
            initialId = initialSection.id;
        } else if (e = $('#' + (h ? h : 'home') + '-section')) {
            initialScrollPoint = null;
            initialSection = e;
            initialId = initialSection.id;
        }
        if (!initialSection) {
            initialScrollPoint = null;
            initialSection = $('#' + 'home' + '-section');
            initialId = initialSection.id;
            history.replaceState(undefined, undefined, '#');
        }
        name = (h ? h : 'home');
        hideHeader = name ? ((name in sections) && ('hideHeader' in sections[name]) && sections[name].hideHeader) : false;
        hideFooter = name ? ((name in sections) && ('hideFooter' in sections[name]) && sections[name].hideFooter) : false;
        disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
        if (header && hideHeader) {
            header.classList.add('hidden');
            header.style.display = 'none';
        }
        if (footer && hideFooter) {
            footer.classList.add('hidden');
            footer.style.display = 'none';
        }
        ee = $$('#main > .inner > section:not([id="' + initialId + '"])');
        for (k = 0; k < ee.length; k++) {
            ee[k].className = 'inactive';
            ee[k].style.display = 'none';
        }
        initialSection.classList.add('active');
        doEvent(initialId, 'onopen');
        loadElements(initialSection);
        if (header) loadElements(header);
        if (footer) loadElements(footer);
        if (!disableAutoScroll) scrollToElement(null, 'instant');
        on('load', function () {
            if (initialScrollPoint) scrollToElement(initialScrollPoint, 'instant');
        });
        on('hashchange', function (event) {
            let section, scrollPoint, id, sectionHeight, currentSection, currentSectionHeight, name, hideHeader,
                hideFooter, disableAutoScroll, h, e, ee, k;
            if (locked) return false;
            h = thisHash();
            if (h && !h.match(/^[a-zA-Z0-9\-]+$/)) return false;
            if (e = $('[data-scroll-id="' + h + '"]')) {
                scrollPoint = e;
                section = scrollPoint.parentElement;
                id = section.id;
            } else if (e = $('#' + (h ? h : 'home') + '-section')) {
                scrollPoint = null;
                section = e;
                id = section.id;
            } else {
                scrollPoint = null;
                section = $('#' + 'home' + '-section');
                id = section.id;
                history.replaceState(undefined, undefined, '#');
            }
            if (!section) return false;
            if (!section.classList.contains('inactive')) {
                name = (section ? section.id.replace(/-section$/, '') : null);
                disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
                if (scrollPoint) scrollToElement(scrollPoint); else if (!disableAutoScroll) scrollToElement(null);
                return false;
            } else {
                locked = true;
                if (location.hash == '#home') history.replaceState(null, null, '#');
                name = (section ? section.id.replace(/-section$/, '') : null);
                hideHeader = name ? ((name in sections) && ('hideHeader' in sections[name]) && sections[name].hideHeader) : false;
                hideFooter = name ? ((name in sections) && ('hideFooter' in sections[name]) && sections[name].hideFooter) : false;
                disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll) : false;
                if (header && hideHeader) {
                    header.classList.add('hidden');
                    setTimeout(function () {
                        header.style.display = 'none';
                    }, 250);
                }
                if (footer && hideFooter) {
                    footer.classList.add('hidden');
                    setTimeout(function () {
                        footer.style.display = 'none';
                    }, 250);
                }
                currentSection = $('#main > .inner > section:not(.inactive)');
                if (currentSection) {
                    currentSectionHeight = currentSection.offsetHeight;
                    currentSection.classList.add('inactive');
                    unloadElements(currentSection);
                    doEvent(currentSection.id, 'onclose');
                    setTimeout(function () {
                        currentSection.style.display = 'none';
                        currentSection.classList.remove('active');
                    }, 250);
                }
                setTimeout(function () {
                    if (header && !hideHeader) {
                        header.style.display = '';
                        setTimeout(function () {
                            header.classList.remove('hidden');
                        }, 0);
                    }
                    if (footer && !hideFooter) {
                        footer.style.display = '';
                        setTimeout(function () {
                            footer.classList.remove('hidden');
                        }, 0);
                    }
                    section.style.display = '';
                    trigger('resize');
                    if (!disableAutoScroll) scrollToElement(null, 'instant');
                    sectionHeight = section.offsetHeight;
                    if (sectionHeight > currentSectionHeight) {
                        section.style.maxHeight = currentSectionHeight + 'px';
                        section.style.minHeight = '0';
                    } else {
                        section.style.maxHeight = '';
                        section.style.minHeight = currentSectionHeight + 'px';
                    }
                    setTimeout(function () {
                        section.classList.remove('inactive');
                        section.classList.add('active');
                        doEvent(section.id, 'onopen');
                        section.style.minHeight = sectionHeight + 'px';
                        section.style.maxHeight = sectionHeight + 'px';
                        setTimeout(function () {
                            section.style.transition = 'none';
                            section.style.minHeight = '';
                            section.style.maxHeight = '';
                            loadElements(section);
                            if (scrollPoint) scrollToElement(scrollPoint, 'instant');
                            setTimeout(function () {
                                section.style.transition = '';
                                locked = false;
                            }, 75);
                        }, 500);
                    }, 75);
                }, 250);
            }
            return false;
        });
        // on('click', function (event) {
        //     debugger;
        //     let t = event.target, tagName = t.tagName.toUpperCase(), scrollPoint;
        //     switch (tagName) {
        //         case 'IMG':
        //         case 'SVG':
        //         case 'USE':
        //         case 'U':
        //         case 'STRONG':
        //         case 'EM':
        //         case 'CODE':
        //         case 'S':
        //         case 'MARK':
        //         case 'SPAN':
        //             while (!!(t = t.parentElement)) if (t.tagName == 'A') break;
        //             if (!t) return;
        //             break;
        //         default:
        //             break;
        //     }
        //     if (t.tagName == 'A' && t.getAttribute('href').substr(0, 1) == '#') {
        //         debugger;
        //         if (!!(scrollPoint = $('[data-scroll-id="' + t.hash.substr(1) + '"][data-scroll-invisible="1"]'))) {
        //             event.preventDefault();
        //             scrollToElement(scrollPoint);
        //         } else if (t.getAttribute('href').contains("wa.me")) {
        //             // Let it through
        //             debugger;
        //         } else if (t.hash == window.location.hash) {
        //             event.preventDefault();
        //             history.replaceState(undefined, undefined, '#');
        //             location.replace(t.hash);
        //         }
        //     }
        // });
    })();
    let style, sheet, rule;
    style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    sheet = style.sheet;
    if (client.mobile) {
        (function () {
            let f = function () {
                document.documentElement.style.setProperty('--viewport-height', window.innerHeight + 'px');
                document.documentElement.style.setProperty('--background-height', (window.innerHeight + 250) + 'px');
            };
            on('load', f);
            on('resize', f);
            on('orientationchange', function () {
                setTimeout(function () {
                    (f)();
                }, 100);
            });
        })();
    }
    if (client.os === 'android') {
        (function () {
            sheet.insertRule('body::after { }', 0);
            rule = sheet.cssRules[0];
            const f = function () {
                rule.style.cssText = 'height: ' + (Math.max(screen.width, screen.height)) + 'px';
            };
            on('load', f);
            on('orientationchange', f);
            on('touchmove', f);
        })();
        $body.classList.add('is-touch');
    } else if (client.os === 'ios') {
        if (client.osVersion <= 11) (function () {
            sheet.insertRule('body::after { }', 0);
            rule = sheet.cssRules[0];
            rule.style.cssText = '-webkit-transform: scale(1.0)';
        })();
        if (client.osVersion <= 11) (function () {
            sheet.insertRule('body.ios-focus-fix::before { }', 0);
            rule = sheet.cssRules[0];
            rule.style.cssText = 'height: calc(100% + 60px)';
            on('focus', function (event) {
                $body.classList.add('ios-focus-fix');
            }, true);
            on('blur', function (event) {
                $body.classList.remove('ios-focus-fix');
            }, true);
        })();
        $body.classList.add('is-touch');
    } else if (client.browser === 'ie') {
        if (!('matches' in Element.prototype)) Element.prototype.matches = (Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector);
        (function () {
            let a = cssRules('body::before'), r;
            if (a.length > 0) {
                r = a[0];
                if (r.style.width.match('calc')) {
                    r.style.opacity = 0.9999;
                    setTimeout(function () {
                        r.style.opacity = 1;
                    }, 100);
                } else {
                    document.styleSheets[0].addRule('body::before', 'content: none !important;');
                    $body.style.backgroundImage = r.style.backgroundImage.replace('url("images/', 'url("assets/images/');
                    $body.style.backgroundPosition = r.style.backgroundPosition;
                    $body.style.backgroundRepeat = r.style.backgroundRepeat;
                    $body.style.backgroundColor = r.style.backgroundColor;
                    $body.style.backgroundAttachment = 'fixed';
                    $body.style.backgroundSize = r.style.backgroundSize;
                }
            }
        })();
        (function () {
            let t, f;
            f = function () {
                let mh, h, s, xx, x, i;
                x = $('#wrapper');
                x.style.height = 'auto';
                if (x.scrollHeight <= innerHeight) x.style.height = '100vh';
                xx = $$('.container.full');
                for (i = 0; i < xx.length; i++) {
                    x = xx[i];
                    s = getComputedStyle(x);
                    x.style.minHeight = '';
                    x.style.height = '';
                    mh = s.minHeight;
                    x.style.minHeight = 0;
                    x.style.height = '';
                    h = s.height;
                    if (mh === 0) continue;
                    x.style.height = (h > mh ? 'auto' : mh);
                }
            };
            (f)();
            on('resize', function () {
                clearTimeout(t);
                t = setTimeout(f, 250);
            });
            on('load', f);
        })();
    } else if (client.browser === 'edge') {
        (function () {
            let xx = $$('.container > .inner > div:last-child'), x, y, i;
            for (i = 0; i < xx.length; i++) {
                x = xx[i];
                y = getComputedStyle(x.parentNode);
                if (y.display != 'flex' && y.display != 'inline-flex') continue;
                x.style.marginLeft = '-1px';
            }
        })();
    }
    if (!client.canUse('object-fit')) {
        (function () {
            let xx = $$('.image[data-position]'), x, w, c, i, src;
            for (i = 0; i < xx.length; i++) {
                x = xx[i];
                c = x.firstElementChild;
                if (c.tagName != 'IMG') {
                    w = c;
                    c = c.firstElementChild;
                }
                if (c.parentNode.classList.contains('deferred')) {
                    c.parentNode.classList.remove('deferred');
                    src = c.getAttribute('data-src');
                    c.removeAttribute('data-src');
                } else src = c.getAttribute('src');
                c.style['backgroundImage'] = 'url(\'' + src + '\')';
                c.style['backgroundSize'] = 'cover';
                c.style['backgroundPosition'] = x.dataset.position;
                c.style['backgroundRepeat'] = 'no-repeat';
                c.src = 'data:image/svg+xml;charset=utf8,' + escape('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"></svg>');
                if (x.classList.contains('full') && (x.parentNode && x.parentNode.classList.contains('full')) && (x.parentNode.parentNode && x.parentNode.parentNode.parentNode && x.parentNode.parentNode.parentNode.classList.contains('container')) && x.parentNode.children.length == 1) {
                    (function (x, w) {
                        let p = x.parentNode.parentNode, f = function () {
                            x.style['height'] = '0px';
                            clearTimeout(t);
                            t = setTimeout(function () {
                                if (getComputedStyle(p).flexDirection == 'row') {
                                    if (w) w.style['height'] = '100%';
                                    x.style['height'] = (p.scrollHeight + 1) + 'px';
                                } else {
                                    if (w) w.style['height'] = 'auto';
                                    x.style['height'] = 'auto';
                                }
                            }, 125);
                        }, t;
                        on('resize', f);
                        on('load', f);
                        (f)();
                    })(x, w);
                }
            }
        })();
        (function () {
            let xx = $$('.gallery > img'), x, p, i, src;
            for (i = 0; i < xx.length; i++) {
                x = xx[i];
                p = x.parentNode;
                if (p.classList.contains('deferred')) {
                    p.classList.remove('deferred');
                    src = x.getAttribute('data-src');
                } else src = x.getAttribute('src');
                p.style['backgroundImage'] = 'url(\'' + src + '\')';
                p.style['backgroundSize'] = 'cover';
                p.style['backgroundPosition'] = 'center';
                p.style['backgroundRepeat'] = 'no-repeat';
                x.style['opacity'] = '0';
            }
        })();
    }

    function LightboxGallery() {
        let _this = this;
        this.id = 'gallery';
        this.$wrapper = $('#' + this.id);
        this.$modal = null;
        this.$modalImage = null;
        this.$modalNext = null;
        this.$modalPrevious = null;
        this.$links = null;
        this.locked = false;
        this.current = null;
        this.delay = 375;
        this.navigation = null;
        this.mobile = null;
        this.initModal();
    };

    LightboxGallery.prototype.init = function (config) {
        let _this = this, $links = $$('#' + config.id + ' .thumbnail'),
            navigation = (config.navigation && $links.length > 1), mobile = config.mobile, i;
        for (i = 0; i < $links.length; i++) (function (index) {
            $links[index].addEventListener('click', function (event) {
                if (this.dataset.lightboxIgnore == '1') return;
                event.stopPropagation();
                event.preventDefault();
                _this.show(index, {$links: $links, navigation: navigation, mobile: mobile});
            });
        })(i);
    };
    LightboxGallery.prototype.initModal = function () {
        let _this = this, $modal, $modalImage, $modalNext, $modalPrevious;
        $modal = document.createElement('div');
        $modal.id = this.id + '-modal';
        $modal.tabIndex = -1;
        $modal.className = 'gallery-modal';
        $modal.innerHTML = '<div class="inner"><img src="" /></div><div class="nav previous"></div><div class="nav next"></div><div class="close"></div>';
        $body.appendChild($modal);
        $modalImage = $('#' + this.id + '-modal img');
        $modalImage.addEventListener('load', function () {
            setTimeout(function () {
                if (!$modal.classList.contains('visible')) return;
                $modal.classList.add('loaded');
                setTimeout(function () {
                    $modal.classList.remove('switching');
                }, _this.delay);
            }, ($modal.classList.contains('switching') ? 0 : _this.delay));
        });
        $modalNext = $('#' + this.id + '-modal .next');
        $modalPrevious = $('#' + this.id + '-modal .previous');
        $modal.show = function (index) {
            let item;
            if (_this.locked) return;
            if (index < 0) index = _this.$links.length - 1; else if (index >= _this.$links.length) index = 0;
            if (index == _this.current) return;
            item = _this.$links.item(index);
            if (!item) return;
            _this.locked = true;
            if (_this.current !== null) {
                $modal.classList.remove('loaded');
                $modal.classList.add('switching');
                setTimeout(function () {
                    _this.current = index;
                    $modalImage.src = item.href;
                    setTimeout(function () {
                        $modal.focus();
                        _this.locked = false;
                    }, _this.delay);
                }, _this.delay);
            } else {
                _this.current = index;
                $modalImage.src = item.href;
                $modal.classList.add('visible');
                setTimeout(function () {
                    $modal.focus();
                    _this.locked = false;
                }, _this.delay);
            }
        };
        $modal.hide = function () {
            if (_this.locked) return;
            if (!$modal.classList.contains('visible')) return;
            _this.locked = true;
            $modal.classList.remove('visible');
            $modal.classList.remove('loaded');
            $modal.classList.remove('switching');
            setTimeout(function () {
                $modalImage.src = '';
                _this.locked = false;
                $body.focus();
                _this.current = null;
            }, _this.delay);
        };
        $modal.next = function () {
            $modal.show(_this.current + 1);
        };
        $modal.previous = function () {
            $modal.show(_this.current - 1);
        };
        $modal.first = function () {
            $modal.show(0);
        };
        $modal.last = function () {
            $modal.show(_this.$links.length - 1);
        };
        $modal.addEventListener('touchmove', function (event) {
            event.preventDefault();
        });
        $modal.addEventListener('click', function (event) {
            $modal.hide();
        });
        $modal.addEventListener('keydown', function (event) {
            if (!$modal.classList.contains('visible')) return;
            switch (event.keyCode) {
                case 39:
                case 32:
                    if (!_this.navigation) break;
                    event.preventDefault();
                    event.stopPropagation();
                    $modal.next();
                    break;
                case 37:
                    if (!_this.navigation) break;
                    event.preventDefault();
                    event.stopPropagation();
                    $modal.previous();
                    break;
                case 36:
                    if (!_this.navigation) break;
                    event.preventDefault();
                    event.stopPropagation();
                    $modal.first();
                    break;
                case 35:
                    if (!_this.navigation) break;
                    event.preventDefault();
                    event.stopPropagation();
                    $modal.last();
                    break;
                case 27:
                    event.preventDefault();
                    event.stopPropagation();
                    $modal.hide();
                    break;
            }
        });
        $modalNext.addEventListener('click', function (event) {
            $modal.next();
        });
        $modalPrevious.addEventListener('click', function (event) {
            $modal.previous();
        });
        this.$modal = $modal;
        this.$modalImage = $modalImage;
        this.$modalNext = $modalNext;
        this.$modalPrevious = $modalPrevious;
    };
    LightboxGallery.prototype.show = function (href, config) {
        this.$links = config.$links;
        this.navigation = config.navigation;
        this.mobile = config.mobile;
        if (this.navigation) {
            this.$modalNext.style.display = '';
            this.$modalPrevious.style.display = '';
        } else {
            this.$modalNext.style.display = 'none';
            this.$modalPrevious.style.display = 'none';
        }
        if (client.mobile && !this.mobile) return;
        this.$modal.show(href);
    };
    let _lightboxGallery = new LightboxGallery;
    console.log("_lightboxGallery.init({id: 'gallery02', navigation: true, mobile: true});\n")
    _lightboxGallery.init({id: 'gallery02', navigation: true, mobile: true});


    window.handleFormSubmit = function () {
        event.preventDefault();
        const companyInputFieldSelector = "#form02-company";
        const firstNameInputFieldSelector = "#form02-firstname";
        const nameInputFieldSelector = "#form02-name";
        const amountInputFieldSelector = "#form02-amount";
        const testTypeInputFieldSelector = "#form02-test-type";
        const emailInputFieldSelector = "#form02-email";

        const $company = $(companyInputFieldSelector);
        const $firstName = $(firstNameInputFieldSelector);
        const $name = $(nameInputFieldSelector);
        const $amount = $(amountInputFieldSelector);
        const $testType = $(testTypeInputFieldSelector);
        const $email = $(emailInputFieldSelector);

        const company = $company.value;
        const firstName = $firstName.value;
        const name = $name.value;
        const amount = $amount.value;
        const testType = $testType.value;
        const email = $email.value;

        console.log("Extracted fields");
        console.table({
            company,
            firstName,
            name,
            amount,
            testType,
            email,
        });

        if (!company || !firstName || !name || !amount || !testType || !email) {
            //TODO: show error modal!
            return;
        }

        const text = `Hallo liebes schnelltest25 Team,
Ich würde gerne für meine Firma ${company} ein Angebot einholen für ${amount} Tests vom Typ ${testType}.
Bitte nehmt mit mir über ${email} Kontakt auf.

Mit freundlichen Grüßen,
${firstName} ${name}`

        window.location.href = "https://wa.me/+4922824069720?text=" + encodeURIComponent(text);
    };
    window.handleDownload = function () {
        console.log("Navigating to download page.")
        event.preventDefault();
        window.location.href = "https://drive.google.com/uc?export=download&id=1vEZn8RYLtJEw0OLc0KkdtGGu6eXOptir";
    }
})();