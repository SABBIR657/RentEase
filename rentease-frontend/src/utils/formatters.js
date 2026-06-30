export const formatCurrency = (amount) =>
  `$${Number(amount).toLocaleString('en-AU')}/wk`

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return formatDate(date)
}

export const truncate = (str, n = 100) =>
  str?.length > n ? str.slice(0, n) + '...' : str

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)