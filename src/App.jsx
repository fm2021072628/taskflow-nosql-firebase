
import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from './firebase'
import './App.css'

const STORAGE_KEY = 'taskflow-tareas'

const nuevaTarea = {
  titulo: '',
  descripcion: '',
  fecha: '',
  estado: 'Pendiente',
}

function App({ usuario }) {
  
   const [tareas, setTareas] = useState([])
const [errorFirestore, setErrorFirestore] = useState('')

  const [formulario, setFormulario] = useState(nuevaTarea)
  const [filtro, setFiltro] = useState('Todas')
  const [editando, setEditando] = useState(null)

  useEffect(() => {
  const consulta = query(
    collection(db, 'tareas'),
    where('usuarioId', '==', usuario.uid)
  )

  const cancelar = onSnapshot(
    consulta,
    snapshot => {
      const datos = snapshot.docs.map(documento => ({
        ...documento.data(),
        id: documento.id,
      }))

      datos.sort((a, b) =>
        (b.creada || '').localeCompare(a.creada || '')
      )

      setTareas(datos)
      setErrorFirestore('')
    },
    error => {
      console.error('Error de Firestore:', error)
      setErrorFirestore(
        `No se pudieron cargar las tareas: ${error.code}`
      )
    }
  )

  return () => cancelar()
}, [usuario.uid])

  const guardarTarea = async e => {
  e.preventDefault()

  if (!formulario.titulo.trim()) return

  try {
    setErrorFirestore('')

    const datos = {
      titulo: formulario.titulo.trim(),
      descripcion: formulario.descripcion.trim(),
      fecha: formulario.fecha,
      estado: formulario.estado,
    }

    if (editando !== null) {
      await updateDoc(doc(db, 'tareas', editando), datos)
    } else {
      await addDoc(collection(db, 'tareas'), {
        ...datos,
        usuarioId: usuario.uid,
        creada: new Date().toISOString(),
      })
    }

    setFormulario({ ...nuevaTarea })
    setEditando(null)
  } catch (error) {
    console.error(error)
    setErrorFirestore(`No se pudo guardar: ${error.code}`)
  }
}

  const editarTarea = (tarea) => {
    setFormulario({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fecha: tarea.fecha,
      estado: tarea.estado,
    })
    setEditando(tarea.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

 const eliminarTarea = async id => {
  if (!window.confirm('¿Deseas eliminar esta tarea?')) return

  try {
    setErrorFirestore('')
    await deleteDoc(doc(db, 'tareas', id))

    if (editando === id) cancelarEdicion()
  } catch (error) {
    console.error(error)
    setErrorFirestore(`No se pudo eliminar: ${error.code}`)
  }
}

  const cambiarEstado = async id => {
  const tarea = tareas.find(t => t.id === id)
  if (!tarea) return

  try {
    setErrorFirestore('')

    await updateDoc(doc(db, 'tareas', id), {
      estado: tarea.estado === 'Completada'
        ? 'Pendiente'
        : 'Completada',
    })
  } catch (error) {
    console.error(error)
    setErrorFirestore(`No se pudo actualizar: ${error.code}`)
  }
}

  const cancelarEdicion = () => {
    setEditando(null)
    setFormulario({ ...nuevaTarea })
  }

  const visibles = tareas.filter((tarea) => {
  if (filtro === 'Todas') {
    return true
  }

  return tarea.estado === filtro
})

  const contar = (estado) =>
    tareas.filter(t => t.estado === estado).length

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">✓</span>
          TaskFlow
        </div>

        <p className="menu-label">ESPACIO DE TRABAJO</p>

        <nav className="menu">
          <button className="menu-active">
            ◫ &nbsp; Mis tareas
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className="online-dot"></span>
          Aplicación local
          <small>React + Vite</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / Mis tareas</span>
          </div>
          <div className="avatar">TF</div>
        </header>

        <div className="content">
          {errorFirestore && (
  <p role="alert" style={{
    color: '#dc2626',
    background: '#fef2f2',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  }}>
    {errorFirestore}
  </p>
)}
          <div className="page-heading">
            <div>
              <p className="eyebrow">PANEL DE CONTROL</p>
              <h1>Mis tareas</h1>
              <p className="subtitle">
                Organiza tus actividades y sigue tu progreso.
              </p>
            </div>
            <span className="date-label">
              {new Date().toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <section className="stats">
            <div className="stat-card">
              <span>Total de tareas</span>
              <strong>{tareas.length}</strong>
              <small>Tareas registradas</small>
            </div>
            <div className="stat-card">
              <span>Pendientes</span>
              <strong>{contar('Pendiente')}</strong>
              <small>Por comenzar</small>
            </div>
            <div className="stat-card">
              <span>En proceso</span>
              <strong>{contar('En proceso')}</strong>
              <small>En desarrollo</small>
            </div>
            <div className="stat-card">
              <span>Completadas</span>
              <strong>{contar('Completada')}</strong>
              <small>Finalizadas</small>
            </div>
          </section>

          <section className="panel form-panel">
            <div className="section-heading">
              <div>
                <h2>
                  {editando ? 'Editar tarea' : 'Nueva tarea'}
                </h2>
                <p>Registra y organiza una actividad.</p>
              </div>
            </div>

            <form onSubmit={guardarTarea}>
              <div className="field">
                <label htmlFor="titulo">Título de la tarea</label>
                <input
                  id="titulo"
                  placeholder="Ej. Terminar el proyecto NoSQL"
                  value={formulario.titulo}
                  onChange={e => setFormulario({
                    ...formulario,
                    titulo: e.target.value,
                  })}
                  required
                  maxLength={100}
                />
              </div>

              <div className="field">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  placeholder="Describe lo que necesitas realizar..."
                  value={formulario.descripcion}
                  onChange={e => setFormulario({
                    ...formulario,
                    descripcion: e.target.value,
                  })}
                  rows="3"
                />
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="fecha">Fecha límite</label>
                  <input
                    id="fecha"
                    type="date"
                    value={formulario.fecha}
                    onChange={e => setFormulario({
                      ...formulario,
                      fecha: e.target.value,
                    })}
                  />
                </div>

                <div className="field">
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    value={formulario.estado}
                    onChange={e => setFormulario({
                      ...formulario,
                      estado: e.target.value,
                    })}
                  >
                    <option>Pendiente</option>
                    <option>En proceso</option>
                    <option>Completada</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                {editando && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cancelarEdicion}
                  >
                    Cancelar
                  </button>
                )}

                <button type="submit" className="btn-primary">
                  {editando ? 'Guardar cambios' : '+ Crear tarea'}
                </button>
              </div>
            </form>
          </section>

          <section className="panel tasks-panel">
            <div className="section-heading">
              <div>
                <h2>Listado de tareas</h2>
                <p>{visibles.length} tareas encontradas</p>
              </div>
            </div>

            <div className="filters">
              {['Todas', 'Pendiente', 'En proceso', 'Completada'].map(
                estado => (
                  <button
                    key={estado}
                    onClick={() => setFiltro(estado)}
                    className={filtro === estado ? 'active' : ''}
                  >
                    {estado}
                  </button>
                )
              )}
            </div>

            {visibles.length === 0 ? (
              <div className="empty-state">
                <span>☑</span>
                <h3>No hay tareas para mostrar</h3>
                <p>
                  Crea una nueva tarea o cambia el filtro.
                </p>
              </div>
            ) : (
              <div className="task-list">
                {visibles.map(tarea => (
                  <div className="task-item" key={tarea.id}>
                    <button
                      className={`task-check ${
                        tarea.estado === 'Completada' ? 'checked' : ''
                      }`}
                      onClick={() => cambiarEstado(tarea.id)}
                      title="Alternar tarea completada"
                      aria-label="Alternar estado completado"
                    >
                      {tarea.estado === 'Completada' ? '✓' : ''}
                    </button>

                    <div className="task-info">
                      <h3>{tarea.titulo}</h3>
                      {tarea.descripcion && (
                        <p>{tarea.descripcion}</p>
                      )}
                      <div className="task-meta">
                        <span className={`status ${tarea.estado
                          .toLowerCase()
                          .replace(' ', '-')}`}>
                          {tarea.estado}
                        </span>
                        {tarea.fecha && (
                          <span>📅 {tarea.fecha}</span>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button onClick={() => editarTarea(tarea)}>
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => eliminarTarea(tarea.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="footer">
            TaskFlow © 2026 · Sistema de gestión de tareas
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
