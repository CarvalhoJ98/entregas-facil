import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { 
  Upload, 
  Map as MapIcon, 
  List, 
  Navigation, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Truck
} from 'lucide-react';

// URL da API - Ajuste se o backend rodar em outra porta
const API_URL = 'http://localhost:3001/api';

function App() {
  const [file, setFile] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pontoInicial, setPontoInicial] = useState({ lat: -23.5505, lng: -46.6333 }); // Centro de SP
  const [view, setView] = useState('map'); // 'map' ou 'list'

  // Carregar entregas iniciais
  const fetchEntregas = async () => {
    try {
      const res = await axios.get(`${API_URL}/entregas`);
      setEntregas(res.data);
    } catch (err) {
      console.error("Erro ao buscar entregas", err);
    }
  };

  // 🚀 ADICIONADO: Buscar dados no banco assim que a página carrega
  useEffect(() => {
    fetchEntregas();
  }, []);

  const handleUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      // 1. Upload do arquivo para ler os dados
      const res = await axios.post(`${API_URL}/upload`, formData);
      const dadosBrutos = res.data;

      // 2. Enviar para roteirização
      const rotaRes = await axios.post(`${API_URL}/roteirizar`, {
        entregas: dadosBrutos,
        pontoInicial
      });

      setEntregas(rotaRes.data);
      setView('map');
    } catch (err) {
      alert("Erro ao processar arquivo. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'concluido' ? 'pendente' : 'concluido';
    try {
      await axios.patch(`${API_URL}/entregas/${id}`, { status: newStatus });
      setEntregas(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      console.error("Erro ao atualizar status", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Sidebar - Mobile Header / Desktop Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Truck size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Entregas Fácil</h1>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Importar Pedidos
          </label>
          <div className="relative group">
            <input 
              type="file" 
              accept=".csv,.xlsx" 
              onChange={handleUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all group-hover:border-blue-500 group-hover:bg-blue-50">
              <Upload className="text-slate-400 group-hover:text-blue-500" />
              <span className="text-sm text-slate-500 group-hover:text-blue-600 font-medium text-center">
                Clique ou arraste seu CSV/Excel aqui
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">Formatos aceitos: .csv, .xlsx</p>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setView('map')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'map' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <MapIcon size={20} />
            <span className="font-medium">Mapa da Rota</span>
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <List size={20} />
            <span className="font-medium">Lista de Entregas</span>
          </button>
        </nav>

        {entregas.length > 0 && (
          <div className="mt-auto p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-1">Resumo da Rota</h4>
            <p className="text-xs text-blue-600">{entregas.length} paradas planejadas</p>
            <div className="mt-3 h-2 w-full bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500" 
                style={{ width: `${(entregas.filter(e => e.status === 'concluido').length / entregas.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Dashboard /</span>
            <span className="text-slate-800 font-semibold uppercase text-sm tracking-wide">
              {view === 'map' ? 'Visualização Geográfica' : 'Tabela de Pedidos'}
            </span>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-blue-600 animate-pulse">
              <Clock size={16} className="animate-spin" />
              <span className="text-sm font-medium">Processando rota...</span>
            </div>
          )}
        </header>

        {/* Dynamic View */}
        <section className="flex-1 p-6 overflow-auto">
          {entregas.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Navigation size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sua rota está vazia</h3>
              <p className="text-slate-500 mb-8">Importe um arquivo de pedidos no menu lateral para gerar automaticamente a melhor rota de entrega para hoje.</p>
            </div>
          ) : view === 'map' ? (
            <div className="h-full min-h-[500px] relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
              <MapContainer 
                center={[pontoInicial.lat, pontoInicial.lng]} 
                zoom={13} 
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* Ponto de Partida */}
                <Marker position={[pontoInicial.lat, pontoInicial.lng]}>
                  <Popup>🏠 Base / Início</Popup>
                </Marker>

                {/* Linha da Rota */}
                <Polyline 
                  positions={[
                    [pontoInicial.lat, pontoInicial.lng],
                    ...entregas.map(e => [e.lat, e.lng])
                  ]} 
                  color="#3b82f6" 
                  weight={4}
                  opacity={0.6}
                  dashArray="10, 10"
                />

                {/* Marcadores de Entrega */}
                {entregas.map((entrega, idx) => (
                  <Marker 
                    key={entrega.id} 
                    position={[entrega.lat, entrega.lng]}
                  >
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-slate-800 mb-1">#{idx + 1} {entrega.destinatario}</p>
                        <p className="text-xs text-slate-500 mb-2">{entrega.endereco}</p>
                        <button 
                          onClick={() => toggleStatus(entrega.id, entrega.status)}
                          className={`w-full py-1 rounded text-xs font-bold text-white transition-colors ${entrega.status === 'concluido' ? 'bg-green-500' : 'bg-blue-500'}`}
                        >
                          {entrega.status === 'concluido' ? 'Concluído' : 'Marcar como Feito'}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parada</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Destinatário</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entregas.map((entrega, idx) => (
                    <tr key={entrega.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{entrega.destinatario || entrega.nome || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{entrega.endereco_completo || entrega.endereco}</td>
                      <td className="px-6 py-4">
                        {entrega.status === 'concluido' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            <CheckCircle size={12} /> Concluído
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                            <Clock size={12} /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleStatus(entrega.id, entrega.status)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          Alterar Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
