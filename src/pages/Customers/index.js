// src/pages/Customers/index.js

import { useContext, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import DarkModeContext from '../../contexts/DarkModeContext';
import { format } from 'date-fns';
import NavBar from "../../components/NavBar";
import Title from '../../components/Title';
import { Link } from "react-router-dom";
import { BsFillPersonLinesFill, BsFillPersonPlusFill } from "react-icons/bs";
import { LuSearch, LuSearchX } from "react-icons/lu";
import { RiFilterLine, RiFilterFill  } from "react-icons/ri";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchNumber, setSearchNumber] = useState("");
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { isDarkMode } = useContext(DarkModeContext);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 8;

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy('created', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const loadedCustomers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          customerNumber: doc.data().customerNumber ?? 'Indisponível',
          nomeCustomer: doc.data().nomeCustomer ?? 'Indisponível',
          telefone: doc.data().telefone?.trim() ? doc.data().telefone : 'Sem telefone',
          created: doc.data().created,
          createdFormat: doc.data().created 
            ? format(doc.data().created.toDate(), 'dd/MM/yyyy') 
            : 'Data não disponível',
        }));

        setCustomers(loadedCustomers);
        setFilteredCustomers(loadedCustomers);
      } catch (error) {
        console.error("Erro ao carregar clientes: ", error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  // Função para aplicar o filtro de busca na tabela
  function handleFilter() {
    setIsFiltering(true);
  
    const filtered = customers.filter((customer) => {
      const customerDate = customer.created?.toDate();

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
        (!start || customerDate >= start) && (!adjustedEnd || customerDate < adjustedEnd); // Ajustado para ser < ao invés de <=
  
      return (
        isInDateRange &&
        (searchNumber === "" || String(customer.customerNumber).includes(searchNumber)) &&
        (searchName === "" || customer.nomeCustomer.toLowerCase().includes(searchName.toLowerCase()))
      );
    });
  
    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reseta a página para a primeira ao filtrar
  }

  // Função para limpar os filtros
  function clearFilters() {
    setSearchNumber("");
    setSearchName("");
    setStartDate("");
    setEndDate("");
    setIsFiltering(false); // Reseta o estado de busca
    setFilteredCustomers(customers);
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
      <div className={`customers-page ${isDarkMode ? 'dark' : ''}`}>
        <NavBar />
        <div className="content">
          <Title name="Clientes">
            <BsFillPersonLinesFill size={25} />
          </Title>
          <div className="container">
            <span>Carregando clientes...</span>
          </div>
        </div>
      </div>
    );
  }

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  return (
    <div className={`customers-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name="Clientes">
          <BsFillPersonLinesFill size={25} />
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
              placeholder="Buscar por nome"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
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
            <button onClick={handleFilter}><LuSearch style={{ marginRight: '5px' }} />Buscar</button>
            <button onClick={clearFilters}><LuSearchX style={{ marginRight: '5px' }} />Limpar Filtros</button>
          </div>
          
          {(!isFiltering || filteredCustomers.length > 0) && (
            <Link to={"/newcustomers"} className="newitem-button">
              <BsFillPersonPlusFill color="#fff" size={25} />
              Cadastrar novo cliente
            </Link>
          )}
        </div>
        </div>
        {filteredCustomers.length === 0 ? (
          <div className="container customers">
            <span className="not-search">
              {isFiltering
                ? "Nenhum cliente encontrado para a busca."
                : "Nenhum cliente encontrado"}
            </span>
          </div>
        ) : (
          <>
            <table className={`table ${isDarkMode ? 'dark' : ''}`}>
              <thead>
                <tr>
                  <th scope="col">N°</th>
                  <th scope="col">Nome</th>
                  <th scope="col">Telefone Celular</th>
                  <th scope="col">Cadastrado em</th>
                  <th scope="col">#</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td data-label="N°">{customer.customerNumber}</td>
                    <td data-label="Nome">{customer.nomeCustomer}</td>
                    <td data-label="Telefone">{customer.telefone}</td>
                    <td data-label="Cadastrado em">{customer.createdFormat}</td>
                    <td data-label="#">
                      <Link to={`/newcustomers/${customer.id}`} className="action">
                        Editar Cliente
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
                .filter((page) => page <= Math.ceil(filteredCustomers.length / customersPerPage))
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
              {currentPage < Math.ceil(filteredCustomers.length / customersPerPage) && (
                <button
                  className="page-button"
                  onClick={() => handlePageChange(Math.ceil(filteredCustomers.length / customersPerPage))}
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
