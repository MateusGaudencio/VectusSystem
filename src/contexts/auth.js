import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const storageUser = localStorage.getItem('@usersDATA');
      if (storageUser) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function signIn(email, password) {
    setLoadingAuth(true);
    await signInWithEmailAndPassword(auth, email, password)
      .then(async (value) => {
        let uid = value.user.uid;

        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().isAuthorized) {
          let data = {
            uid: uid,
            nome: docSnap.data().nome,
            email: value.user.email,
            avatarUrl: docSnap.data().avatarUrl,
          };
          setUser(data);
          storageUser(data);
          setLoadingAuth(false);
          toast.success('Logado com sucesso!');
          navigate('/tickets');
        } else {
          setLoadingAuth(false);
          toast.error('Sua conta ainda não foi autorizada. Aguarde a aprovação.');
          signOut(auth); // Desloga imediatamente se não autorizado
        }
      })
      .catch((error) => {
        console.log(error);
        setLoadingAuth(false);
        toast.error('Erro ao logar!');
      });
  }

  async function signUp(name, email, password) {
    setLoadingAuth(true);
    await createUserWithEmailAndPassword(auth, email, password)
      .then(async (value) => {
        let uid = value.user.uid;
        await setDoc(doc(db, 'users', uid), {
          nome: name,
          avatarUrl: null,
          isAuthorized: false,
        }).then(() => {
          setLoadingAuth(false);
          toast.success('Cadastro realizado com sucesso. Aguarde autorização para acessar o sistema.');
          navigate('/'); // Redirecionar para uma página de espera ou de aviso
        });
      })
      .catch((error) => {
        console.log(error);
        setLoadingAuth(false);
        toast.error('Erro ao realizar cadastro!');
      });
  }

  function storageUser(data) {
    localStorage.setItem('@usersDATA', JSON.stringify(data));
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem('@usersDATA');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ signed: !!user, user, signIn, signUp, logout, loadingAuth, loading, storageUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
