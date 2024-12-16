// src/pages/Budgets/index.js

import { useContext, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import DarkModeContext from '../../contexts/DarkModeContext';
import { format } from 'date-fns';
import NavBar from "../../components/NavBar";
import Title from '../../components/Title';
import { Link } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { LuSearch, LuSearchX } from "react-icons/lu";
import { RiFilterLine, RiFilterFill  } from "react-icons/ri";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchNumber, setSearchNumber] = useState("");
  const [searchClienteNome, setSearchClienteNome] = useState("");
  const [searchTitulo, setSearchTitulo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { isDarkMode } = useContext(DarkModeContext);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const budgetsPerPage = 8;

  useEffect(() => {
    const budgetsRef = collection(db, "budgets");

    async function loadBudgets() {
      setLoading(true);
      try {
        const q = query(budgetsRef, orderBy('created', 'desc'));
        const querySnapshot = await getDocs(q);

        const loadedBudgets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          budgetNumber: doc.data().budgetNumber ?? 'Indisponível',
          clienteNome: doc.data().clienteNome ?? 'Indisponível',
          titulo: doc.data().titulo?.trim() ? doc.data().titulo : 'Não informado',
          situacao: doc.data().situacao ?? 'Não informada',
          created: doc.data().created,
          createdFormat: doc.data().created 
            ? format(doc.data().created.toDate(), 'dd/MM/yyyy') 
            : 'Data não disponível',
        }));

        setBudgets(loadedBudgets);
        setFilteredBudgets(loadedBudgets);
      } catch (error) {
        console.error("Erro ao carregar produtos: ", error);
      } finally {
        setLoading(false);
      }
    }

    loadBudgets();
  }, []);

  // Função para aplicar o filtro de busca na tabela
  function handleFilter() {
    setIsFiltering(true);
  
    const filtered = budgets.filter((budget) => {
      const budgetDate = budget.created?.toDate();
  
      // Ajusta a data inicial para o começo do dia (00:00:00.000)
      const start = startDate
        ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) // 00:00:00.000
        : null;
  
      // Se uma data final for selecionada, somamos 1 dia
      const end = endDate
        ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) // 23:59:59.999
        : null;
  
      // Se a data final foi definida, somamos 1 dia para garantir que o filtro cubra até o final do dia seguinte
      const adjustedEnd = end ? new Date(end.getTime() + 86400000) : null; // 86400000 ms = 1 dia
  
      // Verifica se o produto está dentro do intervalo de datas
      const isInDateRange =
        (!start || budgetDate >= start) && (!adjustedEnd || budgetDate < adjustedEnd); // Ajustado para ser < ao invés de <=
  
      return (
        isInDateRange &&
        (searchNumber === "" || String(budget.budgetNumber).includes(searchNumber)) &&
        (searchClienteNome === "" || budget.clienteNome.toLowerCase().includes(searchClienteNome.toLowerCase())) &&
        (searchTitulo === "" || budget.titulo.toLowerCase().includes(searchTitulo.toLowerCase()))
      );
    });
  
    setFilteredBudgets(filtered);
    setCurrentPage(1); // Reseta a página para a primeira ao filtrar
  }
  
    
  // Função para limpar os filtros
  function clearFilters() {
    setSearchNumber("");
    setSearchClienteNome("");
    setSearchTitulo("");
    setStartDate("");
    setEndDate("");
    setIsFiltering(false); // Reseta o estado de busca
    setFilteredBudgets(budgets);
    setCurrentPage(1); // Reseta a página para a primeira ao limpar filtros
  }

  // Função para alternar a exibição dos filtros no mobile
  function toggleFilter() {
    setIsFilterOpen((prev) => !prev);
  }

  // Função para mudar a página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="content">
          <Title name="Orçamentos">
            <FaMoneyCheckDollar size={25} />
          </Title>
          <div className="container budgets">
            <span>Carregando orçamentos...</span>
          </div>
        </div>
      </div>
    );
  }

  const indexOfLastBudget = currentPage * budgetsPerPage;
  const indexOfFirstBudget = indexOfLastBudget - budgetsPerPage;
  const currentBudgets = filteredBudgets.slice(indexOfFirstBudget, indexOfLastBudget);

  return (
    <div className={`budgets-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name="Orçamentos">
          <FaMoneyCheckDollar  size={25} />
        </Title>
        <div className="container">
        <div className="filter-container">
        <button className="filter-button" onClick={toggleFilter}>
        {isFilterOpen ? <RiFilterFill  size={20} /> : <RiFilterLine size={20} /> }
        {isFilterOpen ? "Fechar Filtros" : "Abrir Filtros"}
        </button>
        <div className={`filter ${isFilterOpen ? 'open' : ''}`}>
            <input
              type="text"
              placeholder="Buscar por número"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="Buscar por cliente"
              value={searchClienteNome}
              onChange={(e) => setSearchClienteNome(e.target.value)}
            />
            <input
              type="text"
              placeholder="Buscar por título"
              value={searchTitulo}
              onChange={(e) => setSearchTitulo(e.target.value)}
            />
             <input
              type="date"
              placeholder="Data início"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              placeholder="Data fim"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={handleFilter}><LuSearch style={{ marginRight: '5px' }}/>Buscar</button>
            <button onClick={clearFilters}><LuSearchX style={{ marginRight: '5px' }}/>Limpar Filtros</button>
          </div>
          
          {/* Exibe o botão de cadastrar novo produto somente se não está em busca ou há resultados */}
          {(!isFiltering || filteredBudgets.length > 0) && (
            <Link to={"/newbudget"} className="newitem-button">
              <FaPlusCircle color="#fff" size={25} />
              Cadastrar novo orçamento
            </Link>
          )}
        </div>
        </div>
        {filteredBudgets.length === 0 ? (
          <div className="container">
            <span className="not-search">
              {isFiltering
                ? "Nenhum orçamento encontrado para a busca."
                : "Nenhum orçamento encontrado"}
            </span>
          </div>
        ) : (
          <>
            <table className={`table ${isDarkMode ? 'dark' : ''}`}>
              <thead>
                <tr>
                  <th scope="col">N°</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Título</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Cadastrado em</th>
                  <th scope="col">#</th>
                </tr>
              </thead>
              <tbody>
                {currentBudgets.map((budget) => (
                  <tr key={budget.id}>
                    <td data-label="N°">{budget.budgetNumber}</td>
                    <td data-label="Cliente">{budget.clienteNome}</td>
                    <td data-label="Título">{budget.titulo}</td>
                    <td data-label="Situação">{budget.situacao}</td>
                    <td data-label="Cadastrado em">{budget.createdFormat}</td>
                    <td data-label="#">
                      <Link to={`/newbudget/${budget.id}`} className="action">
                        Editar Orçamento
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              {Array.from({ length: Math.ceil(filteredBudgets.length / budgetsPerPage) }, (_, index) => (
                <button
                  key={index}
                  className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
