// src/pages/Products/index.js

import { useContext, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import DarkModeContext from '../../contexts/DarkModeContext';
import { format } from 'date-fns';
import NavBar from "../../components/NavBar";
import Title from '../../components/Title';
import { Link } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import { FaBoxesPacking } from "react-icons/fa6";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { LuSearch, LuSearchX } from "react-icons/lu";
import { RiFilterLine, RiFilterFill  } from "react-icons/ri";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchNumber, setSearchNumber] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchMarca, setSearchMarca] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { isDarkMode } = useContext(DarkModeContext);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const productsRef = collection(db, "products");

    async function loadProducts() {
      setLoading(true);
      try {
        const q = query(productsRef, orderBy('created', 'desc'));
        const querySnapshot = await getDocs(q);

        const loadedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          productNumber: doc.data().productNumber ?? 'Indisponível',
          nomeProduct: doc.data().nomeProduct ?? 'Indisponível',
          marca: doc.data().marca?.trim() ? doc.data().marca : 'Não informado',
          preco: doc.data().precoVenda ?? 'Não informado',
          created: doc.data().created,
          createdFormat: doc.data().created 
            ? format(doc.data().created.toDate(), 'dd/MM/yyyy') 
            : 'Data não disponível',
        }));

        setProducts(loadedProducts);
        setFilteredProducts(loadedProducts);
      } catch (error) {
        console.error("Erro ao carregar produtos: ", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Função para aplicar o filtro de busca na tabela
  function handleFilter() {
    setIsFiltering(true);
  
    const filtered = products.filter((product) => {
      const productDate = product.created?.toDate();
  
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
        (!start || productDate >= start) && (!adjustedEnd || productDate < adjustedEnd); // Ajustado para ser < ao invés de <=
  
      return (
        isInDateRange &&
        (searchNumber === "" || String(product.productNumber).includes(searchNumber)) &&
        (searchName === "" || product.nomeProduct.toLowerCase().includes(searchName.toLowerCase())) &&
        (searchMarca === "" || product.marca.toLowerCase().includes(searchMarca.toLowerCase()))
      );
    });
  
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reseta a página para a primeira ao filtrar
  }
  
    
  // Função para limpar os filtros
  function clearFilters() {
    setSearchNumber("");
    setSearchName("");
    setSearchMarca("");
    setStartDate("");
    setEndDate("");
    setIsFiltering(false); // Reseta o estado de busca
    setFilteredProducts(products);
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
          <Title name="Produtos">
            <FaBoxesPacking size={25} />
          </Title>
          <div className="container products">
            <span>Carregando produtos...</span>
          </div>
        </div>
      </div>
    );
  }

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className={`products-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name="Produtos">
          <FaBoxesPacking size={25} />
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
              type="text"
              placeholder="Buscar por marca"
              value={searchMarca}
              onChange={(e) => setSearchMarca(e.target.value)}
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
          {(!isFiltering || filteredProducts.length > 0) && (
            <Link to={"/newproducts"} className="newitem-button">
              <FaPlusCircle color="#fff" size={25} />
              Cadastrar novo produto
            </Link>
          )}
        </div>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="container">
            <span className="not-search">
              {isFiltering
                ? "Nenhum produto encontrado para a busca."
                : "Nenhum produto encontrado"}
            </span>
          </div>
        ) : (
          <>
            <table className={`table ${isDarkMode ? 'dark' : ''}`}>
              <thead>
                <tr>
                  <th scope="col">N°</th>
                  <th scope="col">Nome</th>
                  <th scope="col">Marca</th>
                  <th scope="col">Preço de Venda</th>
                  <th scope="col">Cadastrado em</th>
                  <th scope="col">#</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id}>
                    <td data-label="N°">{product.productNumber}</td>
                    <td data-label="Nome">{product.nomeProduct}</td>
                    <td data-label="Marca">{product.marca}</td>
                    <td data-label="Preço">
                      {(() => {
                        // Verifica se o preço já está formatado (começa com "R$")
                        if (product.preco && product.preco.trim().startsWith("R$")) {
                          return product.preco; // Já formatado, retorna como está
                        }

                        // Caso contrário, realiza o processamento e formata o preço
                        try {
                          // Remove espaços, pontos e troca vírgula por ponto para tratar inconsistências
                          const precoLimpo = product.preco
                            .replace(/\s+/g, '') // Remove espaços extras
                            .replace(/\./g, '') // Remove os pontos (milhares)
                            .replace(',', '.'); // Troca a vírgula por ponto
                          
                          const precoNumerico = parseFloat(precoLimpo); // Converte para número
                          if (isNaN(precoNumerico)) throw new Error(); // Se não for um número válido, lança erro

                          // Retorna o preço formatado no padrão brasileiro
                          return new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(precoNumerico);
                        } catch {
                          return "Valor inválido"; // Retorna mensagem para preços mal formatados
                        }
                      })()}
                    </td>
                    <td data-label="Cadastrado em">{product.createdFormat}</td>
                    <td data-label="#">
                      <Link to={`/newproducts/${product.id}`} className="action">
                        Editar Produto
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
                .filter((page) => page <= Math.ceil(filteredProducts.length / productsPerPage))
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
              {currentPage < Math.ceil(filteredProducts.length / productsPerPage) && (
                <button
                  className="page-button"
                  onClick={() => handlePageChange(Math.ceil(filteredProducts.length / productsPerPage))}
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
