// Imports
import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Title from '../../components/Title';
import PaymentForm from '../../components/PaymentForm';
import { FaPlusCircle } from "react-icons/fa";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { IoMdSave } from "react-icons/io";
import { MdSaveAs } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { db } from '../../services/firebaseConnection';
import DarkModeContext from '../../contexts/DarkModeContext';
import { collection, doc, getDoc, getDocs, updateDoc, setDoc, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

// Firebase collections
const productsRef = collection(db, "products");
const servicesRef = collection(db, "services");
const budgetsRef = collection(db, "budgets");
const counterRef = doc(db, "counters", "budgetNumber");

// Main Component
export default function NewBudget() {
    // States
    const [clientes, setClientes] = useState([]);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [filtroCliente, setFiltroCliente] = useState('');
    const [titulo, setTitulo] = useState('');
    const [situacao, setSituacao] = useState('Orçamento iniciado');
    const [descricao, setDescricao] = useState('');
    const [produtos, setProdutos] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [produtosCadastrados, setProdutosCadastrados] = useState([]);
    const [servicosCadastrados, setServicosCadastrados] = useState([]);
    const [novoProduto, setNovoProduto] = useState(null);
    const [novoServico, setNovoServico] = useState(null);
    const [quantidade, setQuantidade] = useState(1);
    const [quantidadeServico, setQuantidadeServico] = useState(1);
    const [total, setTotal] = useState(0);
    const [margens, setMargens] = useState([]);
    const [formaPagamento, setFormaPagamento] = useState("Pix");
    const [numeroParcelas, setNumeroParcelas] = useState(1);
    const [parcelas, setParcelas] = useState([]);


    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useContext(DarkModeContext);
    const isEditing = Boolean(id);

    // Effects
    useEffect(() => {
        async function loadInitialData() {
            try {
                const clientsSnapshot = await getDocs(collection(db, "customers"));
                const clients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setClientes(clients);

                const productsSnapshot = await getDocs(productsRef);
                const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), preco: parseFloat(doc.data().preco.replace("R$", "").replace(/\./g, "").replace(",", ".")), }));
                setProdutosCadastrados(products);

                const servicesSnapshot = await getDocs(servicesRef);
                const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), preco: parseFloat(doc.data().preco.replace("R$", "").replace(/\./g, "").replace(",", ".")), }));
                setServicosCadastrados(services);

                const priceMarginsSnapshot = await getDocs(collection(db, "priceMargins"));
                if (!priceMarginsSnapshot.empty) {
                    const marginsData = priceMarginsSnapshot.docs[0]?.data()?.prices || [];
                    setMargens(marginsData);
                } else {
                    toast.warning("Nenhuma margem de preço encontrada.");
                }

                if (isEditing) {
                    const budgetDoc = await getDoc(doc(db, "budgets", id));
                    if (budgetDoc.exists()) {
                        const budgetData = budgetDoc.data();
                        setClienteSelecionado({ id: budgetData.clienteId, nomeCustomer: budgetData.clienteNome });
                        setFiltroCliente(budgetData.clienteNome);
                        setTitulo(budgetData.titulo || '');
                        setSituacao(budgetData.situacao || '');
                        setDescricao(budgetData.descricao);
                        setProdutos(budgetData.produtos || []);
                        setServicos(budgetData.servicos || []);
                        setFormaPagamento(budgetData.formaPagamento || '');
                        setNumeroParcelas(budgetData.numeroParcelas || 1);
                        // Use parseToDate para assegurar que vencimento seja uma data válida
                        const parcelasCompatibilizadas = (budgetData.parcelas || []).map(parcela => ({
                            ...parcela,
                            vencimento: parseToDate(parcela.vencimento),
                        }));
                        setParcelas(parcelasCompatibilizadas);
                        setTotal(budgetData.total || 0);
                    } else {
                        toast.error("Orçamento não encontrado.");
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dados iniciais:", error);
                toast.error("Erro ao carregar dados iniciais.");
            }
        }

        loadInitialData();
    }, [id, isEditing]);

    // Handlers
    const handleAddProduto = () => {
        if (!novoProduto) {
            toast.error("Selecione um produto para adicionar.");
            return;
        }
        const produto = produtosCadastrados.find(p => p.id === novoProduto);
        if (!produto) {
            toast.error("Produto não encontrado.");
            return;
        }
        setProdutos(prev => [
            ...prev,
            {
                id: produto.id,
                nome: produto.nomeProduct,
                preco: produto.preco,
                margemSelecionada: margens[0],
                quantidade,
            },
        ]);
        setNovoProduto(null);
        setQuantidade(1);
    };

    const handleAddServico = () => {
      if (!novoServico) {
          toast.error("Selecione um serviço para adicionar.");
          return;
      }
      const servico = servicosCadastrados.find(s => s.id === novoServico);
      if (!servico) {
          toast.error("Serviço não encontrado.");
          return;
      }
      setServicos(prev => [
          ...prev,
          {
              id: servico.id,
              nome: servico.nomeService,
              preco: servico.preco,
              quantidade: quantidadeServico,
          },
      ]);
      setNovoServico(null);
      setQuantidadeServico(1);
  };
  

    const handleDeleteProduto = index => setProdutos(prev => prev.filter((_, i) => i !== index));
    const handleDeleteServico = index => setServicos(prev => prev.filter((_, i) => i !== index));
    const handleMargemChange = (index, novaMargemName) => {
        const novaMargem = margens.find(m => m.name === novaMargemName);
        setProdutos(prev =>
            prev.map((produto, i) =>
                i === index ? { ...produto, margemSelecionada: novaMargem } : produto
            )
        );
    };

    const calculateTotal = () => {
      const totalProdutos = produtos.reduce((acc, produto) => {
          const precoVenda = (produto.preco || 0) + ((produto.preco || 0) * ((produto.margemSelecionada?.value || 0) / 100));
          const subtotal = precoVenda * (produto.quantidade || 1);
          return acc + subtotal;
      }, 0);
  
      const totalServicos = servicos.reduce((acc, servico) => {
          const subtotal = (servico.preco || 0) * (servico.quantidade || 1);
          return acc + subtotal;
      }, 0);
  
      return { 
          totalProdutos: totalProdutos || 0, 
          totalServicos: totalServicos || 0, 
          totalGeral: (totalProdutos + totalServicos) || 0 
      };
  };

  const totalGeral = calculateTotal().totalGeral;

  const getNextBudgetNumber = async () => {
    try {
        const counterDoc = await getDoc(counterRef);
        if (counterDoc.exists()) {
            const counterData = counterDoc.data();
            const nextBudgetNumber = counterData.nextBudgetNumber || 1;
            await updateDoc(counterRef, {
                nextBudgetNumber: nextBudgetNumber + 1, 
            });
            return nextBudgetNumber;
        } else {
            await setDoc(counterRef, { nextBudgetNumber: 2 });
            return 1;
        }
    } catch (error) {
        console.error("Erro ao obter o próximo número de orçamento:", error);
        toast.error("Erro ao obter o próximo número de orçamento.");
    }
};

function parseToDate(value) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date; // Retorna `new Date()` se o valor for inválido
}

const handleClienteChange = (e) => {
    const clienteNome = e.target.value;
    setFiltroCliente(clienteNome);

    // Filtra os clientes baseados no nome digitado
    const cliente = clientes.find(c => c.nomeCustomer.toLowerCase() === clienteNome.toLowerCase());
    setClienteSelecionado(cliente);

    // Exibe as sugestões enquanto o campo estiver preenchido
    if (!clienteNome) {
        setFiltroCliente(''); // Limpa o filtro quando o campo está vazio
    }
};

const handleSave = async (e) => {
    e.preventDefault();

    if (!clienteSelecionado) {
        toast.error("Por favor, selecione um cliente.");
        return;
    }

    try {
        const nextBudgetNumber = isEditing ? undefined : await getNextBudgetNumber();

        const budgetData = {
            clienteId: clienteSelecionado.id,
            clienteNome: clienteSelecionado.nomeCustomer,
            titulo,
            situacao,
            descricao,
            produtos: produtos.map(produto => ({
                ...produto,
                precoVenda: produto.preco + (produto.preco * (produto.margemSelecionada?.value / 100 || 0)),
            })),
            servicos: servicos,
            total: calculateTotal().totalGeral,
            formaPagamento,
            numeroParcelas,
            parcelas: parcelas.map(parcela => ({
                ...parcela,
                vencimento: parcela.vencimento instanceof Date
                    ? parcela.vencimento.toISOString()
                    : new Date(parcela.vencimento).toISOString(),
            })),
            ...(isEditing ? {} : { created: Timestamp.now(), budgetNumber: nextBudgetNumber }), // Adiciona apenas se for novo
        };

        if (isEditing) {
            await updateDoc(doc(db, "budgets", id), budgetData);
            toast.success("Orçamento atualizado com sucesso!");
        } else {
            await addDoc(budgetsRef, budgetData);
            toast.success("Orçamento salvo com sucesso!");
        }

        navigate('/budgets');
    } catch (error) {
        console.error("Erro ao salvar orçamento:", error);
        toast.error("Erro ao salvar orçamento.");
    }
};

    const handleDelete = async () => {
        if (window.confirm("Tem certeza que deseja excluir este orçamento?")) {
            try {
                await deleteDoc(doc(db, "budgets", id));
                toast.success("Orçamento excluído com sucesso!");
                navigate('/budgets');
            } catch (error) {
                console.error("Erro ao excluir orçamento:", error);
                toast.error("Erro ao excluir orçamento.");
            }
        }
    };

  return (
    <div className={`new-budget-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name={isEditing ? "Atualizar Orçamento" : "Cadastrar Novo Orçamento"}>
          <FaMoneyCheckDollar size={25} />
        </Title>

        <div className="container">
        <form className="data-form" onSubmit={handleSave}>
        <label children="label1" >Selecione um Cliente:</label>
                    <input
                        type="text"
                        value={filtroCliente}
                        onChange={handleClienteChange}
                        placeholder="Digite o nome do cliente"
                    />
                    {/* Exibir sugestões de clientes baseadas no filtro */}
                    {filtroCliente && !clienteSelecionado && (
                        <ul className="suggestions">
                            {clientes
                                .filter(cliente => cliente.nomeCustomer.toLowerCase().includes(filtroCliente.toLowerCase()))
                                .map(cliente => (
                                    <li
                                        key={cliente.id}
                                        onClick={() => {
                                            setClienteSelecionado(cliente);
                                            setFiltroCliente(cliente.nomeCustomer); // Quando um cliente é selecionado, o filtro é atualizado com o nome
                                        }}
                                    >
                                        {cliente.nomeCustomer}
                                    </li>
                                ))}
                        </ul>
                    )}
            <label>Título do Orçamento:</label>
              <input
                type="text"
                placeholder="Digite o título do orçamento"
                value={titulo}
                maxLength={100}
                onChange={(e) => setTitulo(e.target.value)}
              />
            <label>Situação do Orçamento:</label>
            <select
            value={situacao || ''}
            onChange={(e) => setSituacao(e.target.value)}
            >
            <option value="" disabled>Selecione a situação</option>
            <option value="Orçamento iniciado">Orçamento iniciado</option>
            <option value="Orçamento enviado">Orçamento enviado</option>
            <option value="Orçamento aprovado">Orçamento aprovado</option>
            <option value="Orçamento recusado">Orçamento recusado</option>
            </select>
            <label>Descrição do Orçamento:</label>
            <textarea
              placeholder="Descrição do orçamento"
              value={descricao}
              maxLength={1000}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <label>Serviços:</label>
            <div className="service-selection">
                            <select
                                value={novoServico || ''}
                                onChange={(e) => setNovoServico(e.target.value)}
                            >
                                <option value="" disabled>Selecione um serviço</option>
                                {servicosCadastrados.map(servico => (
                                    <option key={servico.id} value={servico.id}>
                                        {servico.nomeService} - {servico.preco}
                                    </option>
                                ))}
                            </select>
                            <input className="input-quantity"
                                type="number"
                                min="1"
                                value={quantidadeServico}
                                onChange={(e) => setQuantidadeServico(parseInt(e.target.value))}
                                placeholder="Quantidade"
                            />
                            <button className="save-button-item" type="button" onClick={handleAddServico}>
                            <FaPlusCircle size={17} style={{ marginRight: '5px' }} />Adicionar Serviço</button>
                        </div>

                        {servicos.length > 0 && (
                            <table className="item-table">
                                <thead>
                                    <tr>
                                        <th>Serviço</th>
                                        <th>Quantidade</th>
                                        <th>Preço Unitário</th>
                                        <th>Subtotal</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {servicos.map((servico, index) => {
                                    const subtotal = (servico.preco || 0) * (servico.quantidade || 1);
                                    return (
                                        <tr key={index}>
                                            <td>{servico.nome}</td>
                                            <td>{servico.quantidade}</td>
                                            <td>{(servico.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            <td>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            <td>
                                                <button className="delete-button-item" onClick={() => handleDeleteServico(index)}>
                                                <TiDelete size={17} style={{ marginRight: '5px' }} />Remover</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}

            <label>Produtos:</label>
            <div className="product-selection">
              <select
                value={novoProduto || ''}
                onChange={(e) => setNovoProduto(e.target.value)}
              >
                <option value="" disabled>Selecione um produto</option>
                {produtosCadastrados.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nomeProduct} - {produto.precoVenda}
                  </option>
                ))}
              </select>
              <input className="input-quantity"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value))}
                placeholder="Quantidade"
              />
              <button className="save-button-item" type="button" onClick={handleAddProduto}>
              <FaPlusCircle size={17} style={{ marginRight: '5px' }} />Adicionar Produto</button>
            </div>

            {produtos.length > 0 && (
                <table className="item-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Margem</th>
                    <th>Preço Unitário</th>
                    <th>Subtotal</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                {produtos.map((produto, index) => {
                  const precoVenda = (produto.preco || 0) + ((produto.preco || 0) * ((produto.margemSelecionada?.value || 0) / 100));
                  const subtotal = precoVenda * (produto.quantidade || 1);

                  return (
                      <tr key={index}>
                          <td>{produto.nome}</td>
                          <td>{produto.quantidade}</td>
                          <td>
                              <select
                                  value={produto.margemSelecionada?.name || ''}
                                  onChange={(e) => handleMargemChange(index, e.target.value)}
                              >
                                  {margens.map(margem => (
                                      <option key={margem.name} value={margem.name}>
                                          {margem.name} ({margem.value}%)
                                      </option>
                                  ))}
                              </select>
                          </td>
                          <td>{precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td>
                              <button className="delete-button-item" onClick={() => handleDeleteProduto(index)}>
                                <TiDelete size={17} style={{ marginRight: '5px' }} />Remover</button>
                          </td>
                      </tr>
                  );
              })}
                </tbody>
              </table>
            )}
            <div className="budget-total" >
            <h4>Total de Produtos: {(calculateTotal().totalProdutos || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h4>
            <h4>Total de Serviços: {(calculateTotal().totalServicos || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h4>
            <h3>Valor Total: {(calculateTotal().totalGeral || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
            </div>
            <div className="container">
                  <div className="paymentform-budget">
                    <PaymentForm
                        totalGeral={totalGeral}
                        formaPagamento={formaPagamento}
                        setFormaPagamento={setFormaPagamento}
                        numeroParcelas={numeroParcelas}
                        setNumeroParcelas={setNumeroParcelas}
                        parcelas={parcelas}
                        setParcelas={setParcelas}
                    />
                </div>
            </div>
            <div className="form-button">
              <button type="submit" className="save-button">
                {isEditing ? <MdSaveAs size={17} style={{ marginRight: '5px' }} /> : <IoMdSave size={17} style={{ marginRight: '5px' }} />}
                {isEditing ? "Atualizar orçamento" : "Cadastrar orçamento"}
              </button>

              {isEditing && (
                <button type="button" onClick={handleDelete} className="delete-button">
                <TiDelete size={17} style={{ marginRight: '5px' }} /> Excluir Orçamento
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}