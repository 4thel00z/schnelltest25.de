(function () {
    var on = addEventListener, $ = function (q) {
        return document.querySelector(q)
    }, $$ = function (q) {
        return document.querySelectorAll(q)
    }, $body = document.body, $inner = $('.inner'), client = (function () {
        var o = {browser: 'other', browserVersion: 0, os: 'other', osVersion: 0, mobile: false, canUse: null},
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
        if (o.os == 'mac' && ('ontouchstart' in window) && ((screen.width == 1024 && screen.height == 1366) || (screen.width == 834 && screen.height == 1112) || (screen.width == 810 && screen.height == 1080) || (screen.width == 768 && screen.height == 1024))) o.os = 'ios';
        o.mobile = (o.os == 'android' || o.os == 'ios');
        var _canUse = document.createElement('div');
        o.canUse = function (p) {
            var e = _canUse.style, up = p.charAt(0).toUpperCase() + p.slice(1);
            return (p in e || ('Moz' + up) in e || ('Webkit' + up) in e || ('O' + up) in e || ('ms' + up) in e);
        };
        return o;
    }()), trigger = function (t) {
        if (client.browser == 'ie') {
            var e = document.createEvent('Event');
            e.initEvent(t, false, true);
            dispatchEvent(e);
        } else dispatchEvent(new Event(t));
    }, cssRules = function (selectorText) {
        var ss = document.styleSheets, a = [], f = function (s) {
            var r = s.cssRules, i;
            for (i = 0; i < r.length; i++) {
                if (r[i] instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches) (f)(r[i]); else if (r[i] instanceof CSSStyleRule && r[i].selectorText == selectorText) a.push(r[i]);
            }
        }, x, i;
        for (i = 0; i < ss.length; i++) f(ss[i]);
        return a;
    }, thisHash = function () {
        var h = location.hash ? location.hash.substring(1) : null, a;
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
    }, scrollToElement = function (e, style, duration) {
        var y, cy, dy, start, easing, offset, f;
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
        if (style == 'instant') {
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
            var t = Date.now() - start;
            if (t >= duration) window.scroll(0, y); else {
                window.scroll(0, cy + (dy * easing(t / duration)));
                requestAnimationFrame(f);
            }
        };
        f();
    }, scrollToTop = function () {
        scrollToElement(null);
    }, loadElements = function (parent) {
        var a, e, x, i;
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
    }, unloadElements = function (parent) {
        var a, e, x, i;
        a = parent.querySelectorAll('iframe[data-src=""]');
        for (i = 0; i < a.length; i++) {
            if (a[i].dataset.srcUnload === '0') continue;
            a[i].dataset.src = a[i].src;
            a[i].src = '';
        }
        a = parent.querySelectorAll('video');
        for (i = 0; i < a.length; i++) {
            if (!a[i].paused) a[i].pause();
        }
        e = $(':focus');
        if (e) e.blur();
    };
    window._scrollToTop = scrollToTop;
    var thisURL = function () {
        return window.location.href.replace(window.location.search, '').replace(/#$/, '');
    };
    var getVar = function (name) {
        var a = window.location.search.substring(1).split('&'), b, k;
        for (k in a) {
            b = a[k].split('=');
            if (b[0] == name) return b[1];
        }
        return null;
    };
    var errors = {
        handle: function (handler) {
            window.onerror = function (message, url, line, column, error) {
                (handler)(error.message);
                return true;
            };
        }, unhandle: function () {
            window.onerror = null;
        }
    };
    var db = {
        open: function (objectStoreName, handler) {
            var request = indexedDB.open('carrd');
            request.onupgradeneeded = function (event) {
                event.target.result.createObjectStore(objectStoreName, {keyPath: 'id'});
            };
            request.onsuccess = function (event) {
                (handler)(event.target.result.transaction([objectStoreName], 'readwrite').objectStore(objectStoreName));
            };
        }, put: function (objectStore, values, handler) {
            var request = objectStore.put(values);
            request.onsuccess = function (event) {
                (handler)();
            };
            request.onerror = function (event) {
                throw new Error('db.put: error');
            };
        }, get: function (objectStore, id, handler) {
            var request = objectStore.get(id);
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
        var initialSection, initialScrollPoint, initialId, header, footer, name, hideHeader, hideFooter,
            disableAutoScroll, h, e, ee, k, locked = false, doNext = function () {
                var section;
                section = $('#main > .inner > section.active').nextElementSibling;
                if (!section || section.tagName !== 'SECTION') return;
                location.href = '#' + section.id.replace(/-section$/, '');
            }, doPrevious = function () {
                var section;
                section = $('#main > .inner > section.active').previousElementSibling;
                if (!section || section.tagName !== 'SECTION') return;
                location.href = '#' + (section.matches(':first-child') ? '' : section.id.replace(/-section$/, ''));
            }, doFirst = function () {
                var section;
                section = $('#main > .inner > section:first-of-type');
                if (!section || section.tagName !== 'SECTION') return;
                location.href = '#' + section.id.replace(/-section$/, '');
            }, doLast = function () {
                var section;
                section = $('#main > .inner > section:last-of-type');
                if (!section || section.tagName !== 'SECTION') return;
                location.href = '#' + section.id.replace(/-section$/, '');
            }, doEvent = function (id, type) {
                if ('CARRD_DISABLE_EVENTS' in window) return;
                var name = id.split(/-[a-z]+$/)[0], i;
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
            var section, id;
            scrollToElement(null);
            if (!!(section = $('section.active'))) {
                id = section.id.replace(/-section$/, '');
                if (id == 'home') id = '';
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
            var section, scrollPoint, id, sectionHeight, currentSection, currentSectionHeight, name, hideHeader,
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
        on('click', function (event) {
            var t = event.target, tagName = t.tagName.toUpperCase(), scrollPoint;
            switch (tagName) {
                case 'IMG':
                case 'SVG':
                case 'USE':
                case 'U':
                case 'STRONG':
                case 'EM':
                case 'CODE':
                case 'S':
                case 'MARK':
                case 'SPAN':
                    while (!!(t = t.parentElement)) if (t.tagName == 'A') break;
                    if (!t) return;
                    break;
                default:
                    break;
            }
            if (t.tagName == 'A' && t.getAttribute('href').substr(0, 1) == '#') {
                if (!!(scrollPoint = $('[data-scroll-id="' + t.hash.substr(1) + '"][data-scroll-invisible="1"]'))) {
                    event.preventDefault();
                    scrollToElement(scrollPoint);
                } else if (t.hash == window.location.hash) {
                    event.preventDefault();
                    history.replaceState(undefined, undefined, '#');
                    location.replace(t.hash);
                }
            }
        });
    })();
    var style, sheet, rule;
    style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    sheet = style.sheet;
    if (client.mobile) {
        (function () {
            var f = function () {
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
    if (client.os == 'android') {
        (function () {
            sheet.insertRule('body::after { }', 0);
            rule = sheet.cssRules[0];
            var f = function () {
                rule.style.cssText = 'height: ' + (Math.max(screen.width, screen.height)) + 'px';
            };
            on('load', f);
            on('orientationchange', f);
            on('touchmove', f);
        })();
        $body.classList.add('is-touch');
    } else if (client.os == 'ios') {
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
    } else if (client.browser == 'ie') {
        if (!('matches' in Element.prototype)) Element.prototype.matches = (Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector);
        (function () {
            var a = cssRules('body::before'), r;
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
            var t, f;
            f = function () {
                var mh, h, s, xx, x, i;
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
                    if (mh == 0) continue;
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
    } else if (client.browser == 'edge') {
        (function () {
            var xx = $$('.container > .inner > div:last-child'), x, y, i;
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
            var xx = $$('.image[data-position]'), x, w, c, i, src;
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
                        var p = x.parentNode.parentNode, f = function () {
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
            var xx = $$('.gallery > img'), x, p, i, src;
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

    function lightboxGallery() {
        var _this = this;
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
    };lightboxGallery.prototype.init = function (config) {
        var _this = this, $links = $$('#' + config.id + ' .thumbnail'),
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
    lightboxGallery.prototype.initModal = function () {
        var _this = this, $modal, $modalImage, $modalNext, $modalPrevious;
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
            var item;
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
    lightboxGallery.prototype.show = function (href, config) {
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
    var _lightboxGallery = new lightboxGallery;
    console.log("_lightboxGallery.init({id: 'gallery02', navigation: true, mobile: true});\n")
    _lightboxGallery.init({id: 'gallery02', navigation: true, mobile: true});

    function form(id, settings) {
        var _this = this;
        this.id = id;
        this.mode = settings.mode;
        this.method = settings.method;
        this.code = ('code' in settings ? settings.code : null);
        this.success = settings.success;
        this.initHandler = ('initHandler' in settings ? settings.initHandler : null);
        this.presubmitHandler = ('presubmitHandler' in settings ? settings.presubmitHandler : null);
        this.failure = ('failure' in settings ? settings.failure : null);
        this.optional = ('optional' in settings ? settings.optional : []);
        this.events = ('events' in settings ? settings.events : {});
        this.recaptcha = ('recaptcha' in settings ? settings.recaptcha : "6Ld0qRweAAAAAHyj1kVQ3gl33-wGT9cUv4HJa8H0");
        this.$form = $('#' + this.id);
        this.$form.addEventListener('change', function (event) {
            if (event.target.tagName != 'INPUT') return;
            _this.refreshInput(event.target);
        });
        this.$form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();
            _this.triggerSubmit();
        });
        this.$form.addEventListener('keydown', function (event) {
            if (event.keyCode == 13 && event.ctrlKey) {
                event.preventDefault();
                event.stopPropagation();
                _this.triggerSubmit();
            }
        });
        var x = $('#' + this.id + ' input[name="' + settings.hid + '"]');
        if (x) {
            x.disabled = true;
            x.parentNode.style.display = 'none';
        }
        this.$submit = $('#' + this.id + ' .actions button[type="submit"]');
        this.$submit.disabled = false;
        this.initInputs();
        if (this.initHandler) {
            errors.handle(function (message) {
                return _this.failureHandler(message);
            });
            if (!this.initHandler()) errors.unhandle();
        }
        if (this.recaptcha) {
            grecaptcha.ready(function () {
                var id;
                id = grecaptcha.render(_this.$submit, {
                    sitekey: _this.recaptcha.key,
                    isolated: true,
                    theme: (_this.recaptcha.darkMode ? 'dark' : 'light'),
                    callback: function (token) {
                        _this.submit({recaptchaToken: token}, ['g-recaptcha-response']);
                        grecaptcha.reset(id);
                    }
                });
            });
        }
    }

    ;form.prototype.refreshInput = function (input) {
        var a = [], p;
        switch (input.type) {
            case 'file':
                p = input.parentNode;
                if (input.files.length > 0) p.setAttribute('data-filename', input.files[0].name); else p.setAttribute('data-filename', '');
                break;
            default:
                break;
        }
    };
    form.prototype.refreshInputs = function () {
        var i;
        for (i = 0; i < this.$form.elements.length; i++) this.refreshInput(this.$form.elements[i]);
    };
    form.prototype.normalizeNumberInput = function (input) {
        var min = parseFloat(input.min), max = parseFloat(input.max), step = parseFloat(input.step),
            v = parseFloat(input.value);
        if (isNaN(v)) {
            if (!input.required) {
                input.value = null;
                return;
            }
            v = isNaN(min) ? 0 : min;
        }
        if (!isNaN(min) && v < min) v = min;
        if (!isNaN(max) && v > max) v = max;
        if (!isNaN(step) && (v % step) !== 0) v = Math.round(v / step) * step;
        switch (input.dataset.category) {
            case 'currency':
                v = parseFloat(v).toFixed(2);
                break;
            default:
            case 'decimal':
                v = parseFloat(v);
                break;
            case 'integer':
                v = parseInt(v);
                break;
        }
        input.value = v;
    };
    form.prototype.initInputs = function () {
        var _this = this, i, input;
        for (i = 0; i < this.$form.elements.length; i++) {
            input = this.$form.elements[i];
            switch (input.type) {
                case 'number':
                    (function (input) {
                        var p = input.parentNode, decrement = p.querySelector('button.decrement'),
                            increment = p.querySelector('button.increment');
                        input.addEventListener('blur', function (event) {
                            _this.normalizeNumberInput(input);
                        });
                        if (decrement && increment) {
                            decrement.addEventListener('click', function (event) {
                                event.preventDefault();
                                _this.normalizeNumberInput(input);
                                input.stepDown(1);
                                _this.normalizeNumberInput(input);
                            });
                            increment.addEventListener('click', function (event) {
                                event.preventDefault();
                                _this.normalizeNumberInput(input);
                                input.stepUp(1);
                                _this.normalizeNumberInput(input);
                            });
                        }
                    })(input);
                    break;
                case 'file':
                    (function (input) {
                        var p = input.parentNode, select = p.querySelector('button.select');
                        select.addEventListener('click', function (event) {
                            event.preventDefault();
                            input.click();
                        });
                        input.addEventListener('focus', function (event) {
                            event.target.parentNode.classList.add('focus');
                        });
                        input.addEventListener('blur', function (event) {
                            event.target.parentNode.classList.remove('focus');
                        });
                    })(input);
                    break;
                case 'text':
                case 'textarea':
                case 'email':
                    input.addEventListener('blur', function (event) {
                        this.value = this.value.replace(/^\s+/, '').replace(/\s+$/, '');
                    });
                    break;
            }
            this.refreshInput(input);
        }
    };
    form.prototype.notify = function (type, message) {
        if (message.match(/^(#[a-zA-Z0-9\_\-]+|[a-z0-9\-\.]+:[a-zA-Z0-9\~\!\@\#$\%\&\-\_\+\=\;\,\.\?\/\:]+)$/)) location.href = message; else alert((type == 'failure' ? 'ERROR: ' : '') + message);
    };
    form.prototype.getRequiredInputValue = function (name, type) {
        var k, $f, $ff, types;
        $ff = this.$form.elements;
        for (k in $ff) {
            $f = $ff[k];
            if (((Array.isArray(type) && type.includes($f.type)) || $f.type == type) && $f.name == name && $f.value !== '' && $f.value !== null) return $f.value;
        }
        return null;
    };
    form.prototype.getEmail = function () {
        return this.getRequiredInputValue('email', 'email');
    };
    form.prototype.getAmount = function () {
        var x;
        x = this.getRequiredInputValue('amount', ['select-one', 'number']);
        if (!x) return null;
        x = parseFloat(x);
        if (isNaN(x) || x < 1.00 || x > 100000.00) return null;
        return x;
    };
    form.prototype.values = function () {
        var a = {};
        for (i in this.$form.elements) {
            e = this.$form.elements[i];
            if (!e.name || !e.value) continue;
            switch (e.type) {
                case 'checkbox':
                    a[e.name] = (e.checked ? 'checked' : null);
                    break;
                case 'file':
                    a[e.name] = {name: e.files[0].name, blob: new Blob([e.files[0]], {type: e.files[0].type})};
                    break;
                default:
                    a[e.name] = e.value;
                    break;
            }
        }
        a['id'] = this.id;
        return a;
    };
    form.prototype.scrollIntoView = function () {
        window.scrollTo(0, this.$form.offsetTop);
    };
    form.prototype.triggerSubmit = function () {
        if (this.recaptcha) this.$submit.click(); else if (!this.$submit.disabled) this.submit();
    };
    form.prototype.submit = function (values, ignore) {
        grecaptcha.ready(function () {
            grecaptcha.execute('6Ld0qRweAAAAAHyj1kVQ3gl33-wGT9cUv4HJa8H0', {action: 'submit'}).then(function (token) {
                var _this = this, result, _success, _failure, a, i, e, fd, k, x, $f, $ff;
                result = true;
                $ff = this.$form.elements;
                for (k in $ff) {
                    $f = $ff[k];
                    if (!$f || typeof $f != 'object') continue;
                    if (ignore && ('name' in $f) && ignore.indexOf($f.name) != -1) continue;
                    if ($f.type != 'text' && $f.type != 'email' && $f.type != 'textarea' && $f.type != 'select-one' && $f.type != 'checkbox' && $f.type != 'number' && $f.type != 'tel' && $f.type != 'file' && $f.type != 'hidden') continue;
                    if ($f.disabled) continue;
                    if ($f.type == 'text' || $f.type == 'email' || $f.type == 'textarea' || $f.type == 'hidden') $f.value = $f.value.replace(/^\s+/, '').replace(/\s+$/, '');
                    if ($f.value === '' || $f.value === null || ($f.type == 'checkbox' && !$f.checked)) {
                        if (this.optional.indexOf($f.name) !== -1) continue;
                        result = false;
                    } else {
                        switch ($f.type) {
                            case 'email':
                                result = result && $f.value.match(new RegExp("^([a-zA-Z0-9\\_\\-\\.\\+]+)@([a-zA-Z0-9\\-\\.]+)\\.([a-zA-Z]+)$"));
                                break;
                            case 'select-one':
                                result = result && $f.value.match(new RegExp("^[^\\<\\>]+$"));
                                break;
                            case 'checkbox':
                                result = result && $f.checked && ($f.value == 'checked');
                                break;
                            case 'number':
                                result = result && $f.value.match(new RegExp("^[0-9\\-\\.]+$"));
                                break;
                            case 'tel':
                                result = result && $f.value.match(new RegExp("^[0-9\\-\\+\\(\\)\\ \\#\\*]+$"));
                                break;
                            case 'file':
                                break;
                            default:
                            case 'text':
                            case 'textarea':
                            case 'hidden':
                                result = result && $f.value.match(new RegExp("^[^\\<\\>]+$"));
                                break;
                        }
                    }
                    if (!result) break;
                }
                if (!result) {
                    this.notify('failure', 'Missing or invalid fields. Please try again.');
                    return;
                }
                if ('onsubmit' in this.events) {
                    if (this.events.onsubmit.apply(this.$form) === false) return;
                }
                switch (this.method) {
                    default:
                    case 'ajax':
                        break;
                    case 'get':
                    case 'post':
                        this.$form.submit();
                        return;
                    case 'code':
                        if (typeof this.code == 'function') {
                            this.waiting(true);
                            _success = function () {
                                if ('onsuccess' in _this.events) _this.events.onsuccess.apply(_this.$form);
                                _this.notify('success', _this.success);
                                _this.waiting(false);
                            };
                            _failure = function () {
                                if ('onfailure' in _this.events) _this.events.onfailure.apply(_this.$form);
                                _this.notify('failure', _this.failure ? _this.failure : 'Missing or invalid fields. Please try again.');
                                _this.waiting(false);
                            };
                            result = this.code.apply(this.$form, [_success, _failure]);
                            if (result === true) _success(); else if (result === false) _failure();
                        }
                        return;
                }
                if (x = $(':focus')) x.blur();
                errors.handle(function (message) {
                    return _this.failureHandler(message);
                });
                a = this.values();
                if (values) {
                    for (k in values) a[k] = values[k];
                }
                if (this.presubmitHandler) this.presubmitHandler.call(this, a); else this.submitHandler(a);
            });
        });
    };
    form.prototype.submitHandler = function (values) {
        var _this = this, x, k, data;
        this.waiting(true);
        data = new FormData;
        for (k in values) {
            if (values[k] && typeof values[k] == 'object' && ('blob' in values[k])) data.append(k, values[k].blob, values[k].name); else data.append(k, values[k]);
        }
        x = new XMLHttpRequest();
        x.open('POST', ['', 'post', this.mode].join('/'));
        x.send(data);
        x.onreadystatechange = function () {
            var o;
            if (x.readyState != 4) return;
            if (x.status != 200) throw new Error('Failed server response (' + x.status + ')');
            try {
                o = JSON.parse(x.responseText);
            } catch (e) {
                throw new Error('Invalid server response');
            }
            if (!('result' in o) || !('message' in o)) throw new Error('Incomplete server response');
            if (o.result !== true) throw new Error(o.message);
            if ('onsuccess' in _this.events) _this.events.onsuccess.apply(this.$form);
            _this.$form.reset();
            _this.refreshInputs();
            _this.notify('success', (_this.success ? _this.success : o.message));
            _this.waiting(false);
            errors.unhandle();
        };
    };
    form.prototype.failureHandler = function (message) {
        console.log('failed (' + message + ')');
        if ('onfailure' in this.events) this.events.onfailure.apply(this.$form);
        if (message.match(/ALERT:/)) window.alert(message.substring(message.indexOf('ALERT:') + 7)); else this.notify('failure', (this.failure ? this.failure : message));
        this.waiting(false);
        errors.unhandle();
        return true;
    };
    form.prototype.waiting = function (x) {
        var _this = this;
        if (x) {
            $body.classList.add('is-instant');
            this.$submit.disabled = true;
            this.$submit.classList.add('waiting');
            if (this.recaptcha) setTimeout(function () {
                _this.$submit.disabled = true;
            }, 0);
        } else {
            $body.classList.remove('is-instant');
            this.$submit.classList.remove('waiting');
            this.$submit.disabled = false;
        }
    };
    form.prototype.pause = function (values, handler) {
        var _this = this;
        this.waiting(true);
        db.open('formData', function (objectStore) {
            db.delete(objectStore, _this.id, function () {
                db.put(objectStore, values, function () {
                    handler.call(_this);
                });
            });
        });
    };
    form.prototype.resume = function (handler) {
        var _this = this;
        this.waiting(true);
        this.scrollIntoView();
        db.open('formData', function (objectStore) {
            db.get(objectStore, _this.id, function (values) {
                db.delete(objectStore, _this.id, function () {
                    var e, i, v;
                    for (i in _this.$form.elements) {
                        e = _this.$form.elements[i];
                        if (!e.name) continue;
                        v = (e.name in values ? values[e.name] : null);
                        switch (e.type) {
                            case 'checkbox':
                                e.checked = (v == 'checked' ? true : false);
                                break;
                            case 'file':
                                if (v) e.parentNode.setAttribute('data-filename', v.name);
                                break;
                            default:
                                e.value = v;
                                break;
                        }
                    }
                    handler.call(_this, values);
                });
            });
        });
    };
    new form('form02', {
        mode: 'signup',
        method: 'ajax',
        hid: 'website-url',
        success: '#done',
        recaptcha: "6Ld0qRweAAAAAHyj1kVQ3gl33-wGT9cUv4HJa8H0"
    });
})();