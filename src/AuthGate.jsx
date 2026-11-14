
import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'
import App from './App'

export default function AuthGate() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [registro, setRegistro] = useState(false)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, user => {
      setUsuario(user)
      setCargando(false)
    })
    return cancelar
  }, [])

  const enviar = async e => {
    e.preventDefault()
    setError('')
    setProcesando(true)

    try {
      if (registro) {
        await createUserWithEmailAndPassword(
          auth, correo, password
        )
      } else {
        await signInWithEmailAndPassword(
          auth, correo, password
        )
      }
    } catch (err) {
      const mensajes = {
        'auth/email-already-in-use':
          'Este correo ya está registrado.',
        'auth/invalid-email':
          'Ingresa un correo válido.',
        'auth/weak-password':
          'La contraseña es demasiado débil.',
        'auth/invalid-credential':
          'Correo o contraseña incorrectos.',
        'auth/too-many-requests':
          'Demasiados intentos. Intenta más tarde.',
        'auth/operation-not-allowed':
          'Habilita correo y contraseña en Firebase.',
      }

      console.error('Error de Firebase:', err.code, err.message)

setError(
  mensajes[err.code] ||
  `Error de Firebase: ${err.code || 'desconocido'}`
)
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return <p style={{ padding: 40 }}>
      Cargando TaskFlow...
    </p>
  }

  if (usuario) {
    return (
      <>
        <div style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 1000,
          background: 'white',
          padding: 12,
          borderRadius: 12,
          boxShadow: '0 4px 20px #0002',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12 }}>
            {usuario.email}
          </span>
          <button
            onClick={() => signOut(auth)}
            style={{
              border: 0,
              background: '#2563eb',
              color: 'white',
              padding: '10px 15px',
              borderRadius: 8,
            }}
          >
            Cerrar sesión
          </button>
        </div>
        <App usuario={usuario} />
      </>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#f5f7fb',
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: 420,
        padding: 35,
        borderRadius: 18,
        boxShadow: '0 12px 40px #0000000c',
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#2563eb',
          fontSize: 30,
        }}>
          ✓ TaskFlow
        </h1>

        <h2 style={{ textAlign: 'center' }}>
          {registro ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#64748b',
        }}>
          Organiza tus tareas en un solo lugar.
        </p>

        <form onSubmit={enviar}>
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            required
            style={campo}
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
            style={campo}
          />

          {error && (
            <p role="alert" style={{
              color: '#dc2626',
              fontSize: 13,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={procesando}
            style={{
              width: '100%',
              padding: 14,
              background: '#2563eb',
              color: 'white',
              border: 0,
              borderRadius: 9,
              fontWeight: 700,
              marginTop: 15,
            }}
          >
            {procesando
              ? 'Procesando...'
              : registro ? 'Registrarme' : 'Ingresar'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 22,
          fontSize: 14,
        }}>
          {registro
            ? '¿Ya tienes una cuenta? '
            : '¿No tienes cuenta? '}

          <button
            type="button"
            onClick={() => {
              setRegistro(!registro)
              setError('')
            }}
            style={{
              background: 'none',
              border: 0,
              color: '#2563eb',
              fontWeight: 700,
            }}
          >
            {registro ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  )
}

const campo = {
  display: 'block',
  width: '100%',
  margin: '9px 0 19px',
  padding: 13,
  border: '1px solid #dbe2ed',
  borderRadius: 9,
  boxSizing: 'border-box',
}
