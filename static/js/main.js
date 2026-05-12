/**
 * Swift — Espace entreprise : stats périodiques, toggle ouverture, commandes, catalogue.
 * Toutes les requêtes mutantes envoient le jeton CSRF (cookie ou champ de formulaire).
 */

(function () {
  'use strict';

  /**
   * Lit un cookie par nom (utilisé pour csrftoken).
   */
  function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  /**
   * CSRF : priorité au cookie, sinon champ caché du formulaire modal.
   */
  function getCsrfToken() {
    return getCookie('csrftoken') || '';
  }

  var STATUT_BADGE_CLASS = {
    livree: 'badge-blue',
    en_livraison: 'badge-blue-light',
    en_preparation: 'badge-blue-dark',
    annulee: 'badge-gray',
    en_attente: 'badge-orange',
  };

  var STATUT_LABEL = {
    en_attente: 'En attente',
    en_preparation: 'En préparation',
    en_livraison: 'En livraison',
    livree: 'Livré',
    annulee: 'Annulé',
  };

  /**
   * Met à jour le libellé et les classes du badge de statut pour une ligne commande.
   */
  function mettreAJourBadge(commandeId, nouveauStatut) {
    var badge = document.getElementById('badge-' + commandeId);
    if (!badge) return;
    badge.textContent = STATUT_LABEL[nouveauStatut] || nouveauStatut;
    badge.className = 'cmd-badge ' + (STATUT_BADGE_CLASS[nouveauStatut] || 'badge-orange');
  }

  /**
   * Envoie le nouveau statut au serveur (JSON POST).
   */
  function changerStatut(commandeId, url, nouveauStatut) {
    fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCsrfToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statut: nouveauStatut }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.success) {
          mettreAJourBadge(commandeId, nouveauStatut);
        }
      })
      .catch(function (e) {
        console.error('changerStatut', e);
      });
  }

  /**
   * Rafraîchissement automatique des cartes du tableau de bord (toutes les 30 s).
   */
  function initDashboardPolling() {
    var caEl = document.getElementById('ca-value');
    var cmdEl = document.getElementById('commandes-value');
    var encoursEl = document.getElementById('en-cours-value');
    if (!caEl || !cmdEl || !encoursEl) return;

    var statsUrl = document.body.getAttribute('data-api-stats-url');
    if (!statsUrl) return;

    setInterval(function () {
      fetch(statsUrl, { headers: { Accept: 'application/json' } })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          caEl.textContent = data.ca + ' MAD';
          cmdEl.textContent = data.commandes;
          encoursEl.textContent = 'En cours : ' + data.en_cours;
        })
        .catch(function () {});
    }, 30000);
  }

  /**
   * Toggle ouvert / fermé (bouton dashboard).
   */
  function initToggleOuverture() {
    var toggle = document.getElementById('toggle-ouverture');
    if (!toggle) return;

    var label = document.getElementById('toggle-label');
    var url = toggle.getAttribute('data-url');
    if (!url) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('off');
      var ouvert = !toggle.classList.contains('off');
      toggle.setAttribute('aria-checked', ouvert ? 'true' : 'false');
      if (label) {
        label.textContent = ouvert ? 'Ouvert' : 'Fermé';
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ouvert: ouvert }),
      }).catch(function (e) {
        console.error('toggleOuverture', e);
      });
    });
  }

  /**
   * Listeners sur les <select> de statut (page commandes).
   */
  function initCommandesSelects() {
    document.querySelectorAll('.statut-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var id = sel.getAttribute('data-commande-id');
        var url = sel.getAttribute('data-changer-url');
        if (id && url) {
          changerStatut(id, url, sel.value);
        }
      });
    });
  }

  /**
   * Modal catalogue : ajout / édition via fetch multipart.
   */
  function initCatalogueModal() {
    var modal = document.getElementById('modal-catalogue');
    var form = document.getElementById('form-catalogue-modal');
    var btnAdd = document.getElementById('btn-ajouter-produit');
    var btnClose = document.getElementById('modal-catalogue-close');
    var btnAnnul = document.getElementById('modal-btn-annuler');
    var errEl = document.getElementById('modal-catalogue-error');
    var idInput = document.getElementById('modal-produit-id');

    if (!modal || !form) return;

    var urlAjouter = form.getAttribute('data-url-ajouter');
    var urlModifierTmpl = form.getAttribute('data-url-modifier-template');
    var urlJsonTmpl = form.getAttribute('data-produit-json-template');

    function showErr(msg) {
      if (!errEl) return;
      errEl.style.display = msg ? 'block' : 'none';
      errEl.textContent = msg || '';
    }

    function openModal() {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      showErr('');
    }

    function resetFormForCreate() {
      form.reset();
      if (idInput) idInput.value = '';
      showErr('');
    }

    function fillFromJson(data) {
      document.getElementById('modal-nom').value = data.nom || '';
      document.getElementById('modal-description').value = data.description || '';
      document.getElementById('modal-prix').value = data.prix || '';
      document.getElementById('modal-categorie').value = data.categorie || '';
      document.getElementById('modal-disponible').checked = !!data.disponible;
      if (idInput) idInput.value = data.id || '';
    }

    if (btnAdd) {
      btnAdd.addEventListener('click', function () {
        resetFormForCreate();
        openModal();
      });
    }

    document.querySelectorAll('.btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pid = btn.getAttribute('data-edit-id');
        if (!pid || !urlJsonTmpl) return;
        var jsonUrl = urlJsonTmpl.replace(/\/0\/json\//, '/' + pid + '/json/');

        fetch(jsonUrl, { headers: { Accept: 'application/json' } })
          .then(function (r) {
            return r.json();
          })
          .then(function (data) {
            fillFromJson(data);
            openModal();
          })
          .catch(function (e) {
            console.error('produit json', e);
          });
      });
    });

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnAnnul) btnAnnul.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showErr('');
      var fd = new FormData(form);
      var pid = idInput && idInput.value;
      var actionUrl = pid
        ? urlModifierTmpl.replace(/modifier\/0\//, 'modifier/' + pid + '/')
        : urlAjouter;

      fetch(actionUrl, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() },
        body: fd,
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, json: j };
          });
        })
        .then(function (res) {
          if (res.ok && res.json.success) {
            closeModal();
            window.location.reload();
          } else {
            showErr('Erreur : vérifiez les champs.');
          }
        })
        .catch(function () {
          showErr('Erreur réseau.');
        });
    });

    /* Suppression produit en AJAX (optionnel) */
    document.querySelectorAll('.del-form-js').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = f.getAttribute('data-confirm');
        if (msg && !window.confirm(msg)) return;

        var fd = new FormData(f);
        fetch(f.getAttribute('action'), {
          method: 'POST',
          headers: {
            'X-CSRFToken': getCsrfToken(),
            'X-Requested-With': 'Fetch',
          },
          body: fd,
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (data) {
            if (data.success) {
              var card = f.closest('.product-card');
              if (card) card.remove();
            }
          })
          .catch(function () {});
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDashboardPolling();
    initToggleOuverture();
    initCommandesSelects();
    initCatalogueModal();
  });

  /* API publique pour onclick inline éventuels */
  window.getCookie = getCookie;
  window.toggleOuverture = function () {
    var t = document.getElementById('toggle-ouverture');
    if (t) t.click();
  };
  window.changerStatut = changerStatut;
  window.mettreAJourBadge = mettreAJourBadge;
  window.ouvrirModal = function () {
    document.getElementById('btn-ajouter-produit').click();
  };
  window.fermerModal = function () {
    var m = document.getElementById('modal-catalogue');
    if (m) m.style.display = 'none';
  };
})();
