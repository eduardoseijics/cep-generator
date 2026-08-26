import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from './App.vue';

describe('App', () => {
  it('alterna para a aba de documentos e exibe CPF', async () => {
    const wrapper = mount(App);

    expect(wrapper.find('[aria-labelledby="documentsTitle"]').exists()).toBe(false);
    await wrapper.get('.main-tabs button:nth-child(2)').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Documentos para testes');
    expect(wrapper.text()).toContain('CPF GERADO');
  });

  it('alterna a máscara sem trocar ou truncar o documento', async () => {
    const wrapper = mount(App);
    await wrapper.get('.main-tabs button:nth-child(2)').trigger('click');
    await flushPromises();

    const output = wrapper.get('.document-value');
    const formatted = output.text();
    await wrapper.get('[aria-labelledby="documentsTitle"] .format-row input').setValue(false);
    const unformatted = output.text();
    await wrapper.get('[aria-labelledby="documentsTitle"] .format-row input').setValue(true);

    expect(unformatted).toMatch(/^\d{11}$/);
    expect(unformatted).toBe(formatted.replace(/\D/g, ''));
    expect(output.text()).toBe(formatted);
  });

  it('mantém os 14 dígitos do CNPJ ao alternar a máscara', async () => {
    const wrapper = mount(App);
    await wrapper.get('.main-tabs button:nth-child(2)').trigger('click');
    await flushPromises();
    await wrapper.get('.document-tabs button:nth-child(2)').trigger('click');

    const output = wrapper.get('.document-value');
    await wrapper.get('[aria-labelledby="documentsTitle"] .format-row input').setValue(false);

    expect(output.text()).toMatch(/^\d{14}$/);
  });
});
