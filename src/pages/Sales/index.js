// src/pages/Sales/index.js

import { useContext, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import DarkModeContext from '../../contexts/DarkModeContext';
import { format } from 'date-fns';
import NavBar from "../../components/NavBar";
import Title from '../../components/Title';
import { Link } from "react-router-dom";
import { FaShoppingBasket, FaPlusCircle } from "react-icons/fa";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { LuSearch, LuSearchX } from "react-icons/lu";
import { RiFilterLine, RiFilterFill  } from "react-icons/ri";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
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
  const salesPerPage = 8;

  useEffect(() => {
    const salesRef = collection(db, "sales");

    async function loadSales() {
      setLoading(true);
      try {
        const q = query(salesRef, orderBy('created', 'desc'));
        const querySnapshot = await getDocs(q);

        const loadedSales = querySnapshot.docs.map(doc => ({
          id: doc.id,
          saleNumber: doc.data().saleNumber ?? 'Indisponível',
          clienteNome: doc.data().clienteNome ?? 'Indisponível',
          titulo: doc.data().titulo?.trim() ? doc.data().titulo : 'Não informado',
          situacao: doc.data().situacao ?? 'Não informada',
          created: doc.data().created,
          createdFormat: doc.data().created 
            ? format(doc.data().created.toDate(), 'dd/MM/yyyy') 
            : 'Data não disponível',
        }));

        setSales(loadedSales);
        setFilteredSales(loadedSales);
      } catch (error) {
        console.error("Erro ao carregar produtos: ", error);
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, []);

  // Função para aplicar o filtro de busca na tabela
  function handleFilter() {
    setIsFiltering(true);
  
    const filtered = sales.filter((sale) => {
      const saleDate = sale.created?.toDate();
  
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
        (!start || saleDate >= start) && (!adjustedEnd || saleDate < adjustedEnd); // Ajustado para ser < ao invés de <=
  
      return (
        isInDateRange &&
        (searchNumber === "" || String(sale.saleNumber).includes(searchNumber)) &&
        (searchClienteNome === "" || sale.clienteNome.toLowerCase().includes(searchClienteNome.toLowerCase())) &&
        (searchTitulo === "" || sale.titulo.toLowerCase().includes(searchTitulo.toLowerCase()))
      );
    });
  
    setFilteredSales(filtered);
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
    setFilteredSales(sales);
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
          <Title name="Vendas">
            <FaShoppingBasket size={25} />
          </Title>
          <div className="container sales">
            <span>Carregando vendas...</span>
          </div>
        </div>
      </div>
    );
  }

  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);

  return (
    <div className={`sales-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name="Vendas">
          <FaShoppingBasket  size={25} />
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
          {(!isFiltering || filteredSales.length > 0) && (
            <Link to={"/newsale"} className="newitem-button">
              <FaPlusCircle color="#fff" size={25} />
              Cadastrar nova venda
            </Link>
          )}
        </div>
        </div>
        {filteredSales.length === 0 ? (
          <div className="container">
            <span className="not-search">
              {isFiltering
                ? "Nenhuma venda encontrada para a busca."
                : "Nenhuma venda encontrada"}
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
                {currentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td data-label="N°">{sale.saleNumber}</td>
                    <td data-label="Cliente">{sale.clienteNome}</td>
                    <td data-label="Título">{sale.titulo}</td>
                    <td data-label="Situação">{sale.situacao}</td>
                    <td data-label="Cadastrado em">{sale.createdFormat}</td>
                    <td data-label="#">
                      <Link to={`/newsale/${sale.id}`} className="action">
                        Editar Venda
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={`pagination ${isDarkMode ? 'dark' : ''}`}>
              {/* Botão para ir à primeira página */}
              {currentPage > 1 && (
                <button
                  className="page-button"
                  onClick={() => handlePageChange(1)}
                >
                  <MdKeyboardDoubleArrowLeft />
                </button>
              )}

              {/* Páginas anteriores */}
              {Array.from({ length: 3 }, (_, i) => currentPage - (3 - i))
                .filter((page) => page > 0)
                .map((page) => (
                  <button
                    key={page}
                    className={`page-button ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

              {/* Página atual */}
              <button className={`page-button active`}>{currentPage}</button>

              {/* Páginas posteriores */}
              {Array.from({ length: 3 }, (_, i) => currentPage + (i + 1))
                .filter((page) => page <= Math.ceil(filteredSales.length / salesPerPage))
                .map((page) => (
                  <button
                    key={page}
                    className="page-button"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

              {/* Botão para ir à última página */}
              {currentPage < Math.ceil(filteredSales.length / salesPerPage) && (
                <button
                  className="page-button"
                  onClick={() => handlePageChange(Math.ceil(filteredSales.length / salesPerPage))}
                >
                  <MdKeyboardDoubleArrowRight />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
