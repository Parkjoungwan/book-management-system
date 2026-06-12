export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return response
}