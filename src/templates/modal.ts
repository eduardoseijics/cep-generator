export const modalTemplate = `
  <div id="toast" class="toast" role="status">CEP copiado!</div>
  <div id="modal" class="modal" hidden>
    <div class="modal-backdrop" data-close-modal></div>
    <form id="cepForm" class="modal-card">
      <div class="modal-header"><div><span class="eyebrow dark">CEP PERSONALIZADO</span><h2 id="modalTitle">Adicionar CEP</h2></div><button class="close-button" type="button" data-close-modal aria-label="Fechar">×</button></div>
      <input id="editId" type="hidden" />
      <label for="customCep">CEP</label><input id="customCep" inputmode="numeric" maxlength="9" placeholder="00000-000" required />
      <p id="cepError" class="form-error"></p>
      <label for="customLabel">Identificação <small>(opcional)</small></label><input id="customLabel" maxlength="35" placeholder="Ex.: Escritório, cliente..." />
      <div class="modal-actions"><button class="secondary-button" type="button" data-close-modal>Cancelar</button><button class="save-button" type="submit">Salvar CEP</button></div>
    </form>
  </div>
`;
