(function () {
  'use strict';

  const BUTTON_ID = 'ext-btn-associar-unidade-todos';
  const MODAL_ID = 'ext-modal-associar-unidade';

  // Estilos injetados para o modal e botão
  const styles = `
    #${BUTTON_ID} {
      margin-left: 10px;
      font-weight: 600;
      color: #6a4b9d;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      text-decoration: underline;
      display: inline-block;
      vertical-align: middle;
    }
    #${BUTTON_ID}:hover {
      color: #553b7f;
    }
    #${MODAL_ID} {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
    }
    #${MODAL_ID} .ext-modal-content {
      background: #fff;
      padding: 24px;
      border-radius: 8px;
      width: 380px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    #${MODAL_ID} h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
      color: #333;
    }
    #${MODAL_ID} .ext-form-group {
      margin-bottom: 16px;
    }
    #${MODAL_ID} label {
      display: block;
      margin-bottom: 6px;
      font-weight: bold;
      font-size: 14px;
      color: #555;
    }
    #${MODAL_ID} select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      background: #fff;
    }
    #${MODAL_ID} .ext-modal-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    #${MODAL_ID} button {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      border: 1px solid transparent;
    }
    #${MODAL_ID} .ext-btn-cancel {
      background: #f8f9fa;
      border-color: #ccc;
      color: #333;
    }
    #${MODAL_ID} .ext-btn-cancel:hover {
      background: #e2e6ea;
    }
    #${MODAL_ID} .ext-btn-apply {
      background: #0275d8;
      color: #fff;
    }
    #${MODAL_ID} .ext-btn-apply:hover {
      background: #025aa5;
    }
  `;

  function injectStyles() {
    if (document.getElementById('ext-hiper-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'ext-hiper-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  function createModal() {
    if (document.getElementById(MODAL_ID)) return;

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="ext-modal-content">
        <h3>Associar unidade aos produtos</h3>
        <div class="ext-form-group">
          <label for="ext-select-unidade">Unidade:</label>
          <select id="ext-select-unidade">
            <option value="UN">UN</option>
            <option value="CX">CX</option>
          </select>
        </div>
        <div class="ext-modal-buttons">
          <button type="button" class="ext-btn-cancel" id="ext-modal-cancel">Cancelar</button>
          <button type="button" class="ext-btn-apply" id="ext-modal-apply">Aplicar aos produtos</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('ext-modal-cancel').addEventListener('click', closeModal);
    document.getElementById(MODAL_ID).addEventListener('click', (e) => {
      if (e.target.id === MODAL_ID) closeModal();
    });
    document.getElementById('ext-modal-apply').addEventListener('click', applyUnitToProducts);
  }

  function openModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function applyUnitToProducts() {
    const targetUnit = document.getElementById('ext-select-unidade').value;
    
    // Identificar todas as linhas de produtos na tabela
    const rows = document.querySelectorAll('table.table tbody tr');
    let countApplied = 0;

    rows.forEach((row) => {
      const xmlUnitSelect = row.querySelector('.unidade-medida-xml select, td.unidade-medida-xml select');
      const hiperCell = row.querySelector('.nome-produto-hiper');

      if (!xmlUnitSelect || !hiperCell) return;

      // Verificar se o produto ainda não está associado (ex: possui o botão "Cadastrar este produto automaticamente")
      const cadastrarBtn = hiperCell.querySelector('.btn-cadastrar-produto');
      if (!cadastrarBtn) {
        // Produto já associado, pula conforme regra de negócio
        return;
      }

      // Atualizar o valor do select de unidade do produto
      xmlUnitSelect.value = targetUnit;

      // Garantir que a option correspondente esteja marcada como selected (ou criar se não existir)
      const options = xmlUnitSelect.querySelectorAll('option');
      let foundOption = false;
      options.forEach(opt => {
        if (opt.value === targetUnit) {
          opt.selected = true;
          foundOption = true;
        } else {
          opt.selected = false;
        }
      });

      if (!foundOption) {
        const newOpt = document.createElement('option');
        newOpt.value = targetUnit;
        newOpt.textContent = targetUnit;
        newOpt.selected = true;
        xmlUnitSelect.appendChild(newOpt);
      }

      // Disparar eventos nativos para atualizar o Vue.js e a página
      xmlUnitSelect.dispatchEvent(new Event('change', { bubbles: true }));
      xmlUnitSelect.dispatchEvent(new Event('input', { bubbles: true }));

      // Compatibilidade com jQuery / Select2
      if (window.jQuery) {
        const $select = window.jQuery(xmlUnitSelect);
        $select.val(targetUnit).trigger('change');
        $select.trigger('select2:select', [{ data: { id: targetUnit, text: targetUnit } }]);
      }

      // Atualizar o elemento visual do Select2 renderizado na coluna de unidade
      const rendered = row.querySelector('.unidade-medida-xml .select2-selection__rendered');
      if (rendered) {
        rendered.innerHTML = `<span class="select2-selection__clear">×</span>${targetUnit}`;
        rendered.setAttribute('title', targetUnit);
      }

      countApplied++;
    });

    closeModal();
    console.log(`[Hiper Extensão] Unidade ${targetUnit} aplicada a ${countApplied} produtos.`);
  }

  function triggerChangeEvents(element) {
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Compatibilidade com jQuery / Select2 se presente na página
    if (window.jQuery && window.jQuery(element).length) {
      window.jQuery(element).trigger('change');
    }
  }

  function injectButton() {
    if (document.getElementById(BUTTON_ID)) return;

    // Localizar o botão original "Cadastrar todos produtos automaticamente"
    // Cuidado para pegar o botão global e não os individuais
    const buttons = document.querySelectorAll('.btn-cadastrar-produto');
    let targetButton = null;

    buttons.forEach((btn) => {
      if (btn.textContent && btn.textContent.trim().includes('Cadastrar todos produtos automaticamente')) {
        targetButton = btn;
      }
    });

    if (targetButton && targetButton.parentNode) {
      // Evitar duplicar se já existir irmão com o ID
      if (targetButton.parentNode.querySelector('#' + BUTTON_ID)) return;

      const customBtn = document.createElement('button');
      customBtn.id = BUTTON_ID;
      customBtn.type = 'button';
      customBtn.textContent = 'Associar unidade a todos';
      customBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });

      targetButton.parentNode.insertBefore(customBtn, targetButton.nextSibling);
    }
  }

  function init() {
    injectStyles();
    createModal();
    injectButton();

    // Observer para lidar com atualizações dinâmicas na página (AJAX / Vue)
    const observer = new MutationObserver(() => {
      injectButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
