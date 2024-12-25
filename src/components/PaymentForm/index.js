import { useEffect, useState, useContext } from 'react';
import DarkModeContext from '../../contexts/DarkModeContext';
import './payment-form.css';

function PaymentForm({ totalGeral, formaPagamento, setFormaPagamento, numeroParcelas, setNumeroParcelas, parcelas, setParcelas }) {
  const { isDarkMode } = useContext(DarkModeContext);

  const handleChangeVencimento = (index, novoVencimento) => {
    const novasParcelas = [...parcelas];
    novasParcelas[index] = {
        ...novasParcelas[index],
        vencimento: new Date(novoVencimento), // Atualiza com nova data
    };
    setParcelas(novasParcelas); // Atualiza o estado no componente pai
};

  const gerarParcelas = () => {
    const valorParcela = totalGeral / numeroParcelas;
    const novasParcelas = Array.from({ length: numeroParcelas }, (_, i) => ({
        numero: i + 1,
        valor: valorParcela,
        vencimento: new Date(), // Inicialize como uma data válida
    }));
    setParcelas(novasParcelas);
};

  useEffect(() => {
      gerarParcelas();
  }, [numeroParcelas, totalGeral]);

  function parseToDate(value) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date; // Retorna `new Date()` se o valor for inválido
}

  return (
      <div className={`payment-container ${isDarkMode ? 'dark' : ''}`}>
          <label>Forma de Pagamento:</label>
          <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
          >
              <option value="" disabled>Selecione uma forma de pagamento</option>
              <option value="Pix">Pix</option>
              <option value="Boleto Bancário">Boleto Bancário</option>
              <option value="Transferência Bancária">Transferência Bancária</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
          </select>

          <label>Número de Parcelas:</label>
          <input className='parcelas-input'
              type="number"
              min="1"
              max="60"
              value={numeroParcelas}
              onChange={(e) => setNumeroParcelas(parseInt(e.target.value))}
          />

          {parcelas.length > 0 && (
              <table className={`payment-table ${isDarkMode ? 'dark' : ''}`}>
                  <thead>
                      <tr>
                          <th>Número da Parcela</th>
                          <th>Valor</th>
                          <th>Data de Vencimento</th>
                      </tr>
                  </thead>
                  <tbody>
                  {parcelas.map((parcela, index) => {
                      // Use a função parseToDate para garantir que vencimento é uma data válida
                      const vencimentoDate = parseToDate(parcela.vencimento);

                      const vencimentoISO = vencimentoDate.toISOString().split('T')[0]; // Gera uma string válida para o input

                      return (
                          <tr key={index}>
                              <td>{parcela.numero}</td>
                              <td>{parcela.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                              <td>
                                  <input
                                      type="date"
                                      value={vencimentoISO}
                                      onChange={(e) => handleChangeVencimento(index, e.target.value)}
                                  />
                              </td>
                          </tr>
                      );
                  })}
                  </tbody>
              </table>
          )}
      </div>
  );
}

export default PaymentForm;
