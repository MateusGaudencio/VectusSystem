import { BrowserRouter } from 'react-router-dom'
import RoutesApp from './routes';
import AuthProvider from './contexts/auth';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
         <ToastContainer autoClose={3000}/>
         <RoutesApp/>
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
