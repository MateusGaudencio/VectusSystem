// src/pages/Services/index.js

import { useContext, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import DarkModeContext from '../../contexts/DarkModeContext';
import { format } from 'date-fns';
import NavBar from "../../components/NavBar";
import Title from '../../components/Title';
import { Link } from "react-router-dom";
import { FaTools, FaPlusCircle } from "react-icons/fa";
import { LuSearch, LuSearchX } from "react-icons/lu";
import { RiFilterLine, RiFilterFill  } from "react-icons/ri";

export default function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
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
  const servicesPerPage = 8;

  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      try {
        const servicesRef = collection(db, "services");
        const q = query(servicesRef, orderBy('created', 'desc'));
        const querySnapshot = await getDocs(q);

        const loadedServices = querySnapshot.docs.map(doc => ({
          id: doc.id,
          serviceNumber: doc.data().serviceNumber ?? 'Indisponível',
          nomeService: doc.data().nomeService ?? 'Indisponível',
          preco: formatPrice(doc.data().preco), // Formata o preço corretamente
          created: doc.data().created,
          createdFormat: doc.data().created 
            ? format(doc.data().created.toDate(), 'dd/MM/yyyy') 
            : 'Data não disponível',
        }));

        setServices(loadedServices);
        setFilteredServices(loadedServices);
      } catch (error) {
        console.error("Erro ao carregar serviços: ", error);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  // Função para formatar o preço
function formatPrice(value) {
  if (value === undefined || value === null) {
    return 'Não informado';
  }

  // Verifica se o valor já está formatado como moeda
  if (typeof value === 'string' && value.includes('R$')) {
    return value; // Retorna o valor diretamente, já que está formatado
  }

  // Caso contrário, converte o valor numérico em formato de moeda
  const numberValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue / 100);
}

  // Função para aplicar o filtro de busca na tabela
  function handleFilter() {
    setIsFiltering(true);
  
    const filtered = services.filter((service) => {
      const serviceDate = service.created?.toDate();
  
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
        (!start || serviceDate >= start) && (!adjustedEnd || serviceDate < adjustedEnd); // Ajustado para ser < ao invés de <=
  
      return (
        isInDateRange &&
        (searchNumber === "" || String(service.serviceNumber).includes(searchNumber)) &&
        (searchName === "" || service.nomeService.toLowerCase().includes(searchName.toLowerCase()))
      );
    });
  
    setFilteredServices(filtered);
    setCurrentPage(1); // Reseta para a primeira página ao aplicar o filtro
  }  

  function clearFilters() {
    setSearchNumber("");
    setSearchName("");
    setStartDate("");
    setEndDate("");
    setIsFiltering(false);
    setFilteredServices(services);
    setCurrentPage(1);
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
      <div className={`services-page ${isDarkMode ? 'dark' : ''}`}>
        <NavBar />
        <div className="content">
          <Title name="Serviços">
            <FaTools size={25} />
          </Title>
          <div className="container">
            <span>Carregando serviços...</span>
          </div>
        </div>
      </div>
    );
  }

  // Paginação - obtém os itens da página atual
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  return (
    <div className={`services-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name="Serviços">
          <FaTools size={25} />
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
            <button onClick={handleFilter}><LuSearch style={{ marginRight: '5px' }}/>Buscar</button>
            <button onClick={clearFilters}><LuSearchX style={{ marginRight: '5px' }}/>Limpar Filtros</button>
          </div>

          {(!isFiltering || filteredServices.length > 0) && (
            <Link to={"/newservices"} className="newitem-button">
              <FaPlusCircle color="#fff" size={25} />
              Cadastrar novo serviço
            </Link>
          )}
        </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="container">
            <span className="not-search">
              {isFiltering
                ? "Nenhum serviço encontrado para a busca."
                : "Nenhum serviço encontrado"}
            </span>
          </div>
        ) : (
          <>
            <table className={`table ${isDarkMode ? 'dark' : ''}`}>
              <thead>
                <tr>
                  <th scope="col">N°</th>
                  <th scope="col">Nome</th>
                  <th scope="col">Preço</th>
                  <th scope="col">Cadastrado em</th>
                  <th scope="col">#</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.map((service) => (
                  <tr key={service.id}>
                    <td data-label="N°">{service.serviceNumber}</td>
                    <td data-label="Nome">{service.nomeService}</td>
                    <td data-label="Preço">{service.preco}</td>
                    <td data-label="Cadastrado em">{service.createdFormat}</td>
                    <td data-label="#">
                      <Link to={`/newservices/${service.id}`} className="action">
                        Editar serviço
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              {Array.from({ length: Math.ceil(filteredServices.length / servicesPerPage) }, (_, index) => (
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
