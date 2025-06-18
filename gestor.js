// src/App.tsx
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNQuRql4DX4M5NXEs8V_YtM6jyNLjq2oU",
  authDomain: "gestor-financeiro-ighor-7d15b.firebaseapp.com",
  projectId: "gestor-financeiro-ighor-7d15b",
  storageBucket: "gestor-financeiro-ighor-7d15b.firebasestorage.app",
  messagingSenderId: "348574776528",
  appId: "1:348574776528:web:abc10507647982cd0db2d5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const categoriasFixas = ["Alimentação", "Transporte", "Lazer", "Contas"];
const cartoesFixos = ["Nubank", "Itaú", "Santander", "PicPay"];

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState(categoriasFixas[0]);
  const [cartao, setCartao] = useState(cartoesFixos[0]);
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      if (usuario) carregarGastos(usuario.uid);
    });
  }, []);

  async function entrar() {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch {
      await createUserWithEmailAndPassword(auth, email, senha);
    }
  }

  async function sair() {
    await signOut(auth);
    setUser(null);
    setGastos([]);
  }

  async function adicionarGasto() {
    const docRef = await addDoc(collection(db, "gastos"), {
      uid: user.uid,
      descricao,
      valor: parseFloat(valor),
      categoria,
      cartao,
      data: new Date(),
    });
    carregarGastos(user.uid);
  }

  async function carregarGastos(uid) {
    const q = query(collection(db, "gastos"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const lista = [];
    querySnapshot.forEach((doc) => lista.push(doc.data()));
    setGastos(lista);
  }

  const totalPorCartao = cartoesFixos.map((c) => ({
    nome: c,
    total: gastos.filter((g) => g.cartao === c).reduce((s, g) => s + g.valor, 0),
  }));

  if (!user) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2">Login</h1>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full mb-2" />
        <input type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} className="border p-2 w-full mb-2" />
        <button onClick={entrar} className="bg-blue-500 text-white px-4 py-2 w-full">Entrar / Cadastrar</button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Gestor Financeiro Ighor</h1>
      <button onClick={sair} className="text-sm text-red-500 mb-4">Sair</button>
      <div className="grid grid-cols-1 gap-2 mb-4">
        <input placeholder="Descrição" onChange={(e) => setDescricao(e.target.value)} className="border p-2" />
        <input type="number" placeholder="Valor" onChange={(e) => setValor(e.target.value)} className="border p-2" />
        <select onChange={(e) => setCategoria(e.target.value)} className="border p-2">
          {categoriasFixas.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
        <select onChange={(e) => setCartao(e.target.value)} className="border p-2">
          {cartoesFixos.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={adicionarGasto} className="bg-green-500 text-white px-4 py-2">Adicionar Gasto</button>
      </div>

      <h2 className="font-bold mb-2">Totais por Cartão:</h2>
      <ul className="mb-4">
        {totalPorCartao.map(({ nome, total }) => (
          <li key={nome}>{nome}: R$ {total.toFixed(2)}</li>
        ))}
      </ul>

      <h2 className="font-bold mb-2">Gastos:</h2>
      <ul>
        {gastos.map((g, i) => (
          <li key={i}>{g.descricao} - R$ {g.valor.toFixed(2)} ({g.cartao})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
