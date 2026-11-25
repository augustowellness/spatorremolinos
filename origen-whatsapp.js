/* Añade al final de cada mensaje de WhatsApp desde qué web y página
   escribe el cliente (p. ej. "Vengo de spatorremolinos.com (Inicio)").
   Cubre también los mensajes que se construyen al momento (recomendador,
   bono regalo, chatbot), que no se pueden marcar en el HTML. */
(function () {
  'use strict';
  var me = document.currentScript;
  var ORIGEN = (me && me.getAttribute('data-origen')) || '';
  var DOMINIO = (me && me.getAttribute('data-dominio')) || location.hostname;
  if (!ORIGEN) return;

  function marcar(url) {
    try {
      if (typeof url !== 'string' || url.indexOf('wa.me/') === -1) return url;
      var m = url.match(/^([^?#]*)(?:\?([^#]*))?(#.*)?$/);
      var base = m[1], query = m[2] || '', hash = m[3] || '';
      var t = '', otros = [];
      query.split('&').forEach(function (par) {
        if (!par) return;
        if (par.indexOf('text=') === 0) {
          t = decodeURIComponent(par.slice(5).replace(/\+/g, ' '));
        } else { otros.push(par); }
      });
      if (t.indexOf(DOMINIO) !== -1) return url;
      t = t.replace(/\s+$/, '');
      var sep = t === '' ? '' : (/[.!?]$/.test(t) ? ' ' : '. ');
      otros.push('text=' + encodeURIComponent(t + sep + ORIGEN));
      return base + '?' + otros.join('&') + hash;
    } catch (e) { return url; }
  }

  var abrir = window.open;
  window.open = function (url) {
    var args = Array.prototype.slice.call(arguments);
    args[0] = marcar(url);
    return abrir.apply(window, args);
  };

  function marcarTodos(raiz) {
    var els = (raiz && raiz.querySelectorAll) ? raiz.querySelectorAll('a[href*="wa.me/"]') : [];
    for (var i = 0; i < els.length; i++) {
      var h = els[i].getAttribute('href'), n = marcar(h);
      if (n !== h) els[i].setAttribute('href', n);
    }
  }
  function iniciar() {
    marcarTodos(document);
    if (window.MutationObserver) {
      new MutationObserver(function (cambios) {
        cambios.forEach(function (c) {
          if (c.type === 'attributes' && c.target.matches && c.target.matches('a[href*="wa.me/"]')) {
            var h = c.target.getAttribute('href'), n = marcar(h);
            if (n !== h) c.target.setAttribute('href', n);
          } else if (c.addedNodes) {
            for (var i = 0; i < c.addedNodes.length; i++) marcarTodos(c.addedNodes[i]);
          }
        });
      }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
    if (a) a.setAttribute('href', marcar(a.getAttribute('href')));
  }, true);
})();
