import { useEffect, useState, useContext } from 'react';
import DarkModeContext from '../../contexts/DarkModeContext';
import './payment-form.css';

function PaymentForm({ totalGeral }) {
  const { isDarkMode } = useContext(DarkModeContext);

  const [formaPagamento, setFormaPagamento] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState(1);
  const [parcelas, setParcelas] = useState([]);

  // Atualiza a data de vencimento de uma parcela específica
  const handleChangeVencimento = (index, novoVencimento) => {
    const novasParcelas = [...parcelas];
    novasParcelas[index] = {
      ...novasParcelas[index],
      vencimento: new Date(novoVencimento),
    };
    setParcelas(novasParcelas);
  };

  // Atualiza as parcelas ao alterar o número de parcelas
  const gerarParcelas = () => {
    const valorParcela = totalGeral / numeroParcelas; // Divide o total geral pelo número de parcelas
    const novasParcelas = Array.from({ length: numeroParcelas }, (_, i) => ({
      numero: i + 1,
      valor: valorParcela, // A cada parcela tem o valor total dividido igualmente
      vencimento: new Date(), // Data inicial (pode ser ajustada)
    }));
    setParcelas(novasParcelas);
  };

  // Atualiza as parcelas automaticamente quando o número de parcelas muda
  useEffect(() => {
    gerarParcelas();
  }, [numeroParcelas, totalGeral]); // Recalcular quando o totalGeral ou numeroParcelas mudar

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
      <input
        type="number"
        min="1"
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
            {parcelas.map((parcela, index) => (
              <tr key={index}>
                <td>{parcela.numero}</td>
                <td>{parcela.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>
                  <input
                    type="date"
                    value={parcela.vencimento.toISOString().split('T')[0]}
                    onChange={(e) => handleChangeVencimento(index, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PaymentForm;
