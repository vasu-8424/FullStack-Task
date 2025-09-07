import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { CustomersAPI, type Customer } from '../lib/api'
import { Link } from 'react-router-dom'

export default function CustomersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, page, limit }],
    queryFn: async () => {
      const { data } = await CustomersAPI.list({ search, page, limit })
      return data as { items: Customer[]; page: number; limit: number; total: number }
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; email: string; phone?: string; company?: string }) => CustomersAPI.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Customer> }) => CustomersAPI.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CustomersAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData) as Record<string, string>
    createMutation.mutate({ 
      name: payload.name, 
      email: payload.email, 
      phone: payload.phone || undefined, 
      company: payload.company || undefined 
    })
    form.reset()
  }

  function handleEdit(customer: Customer) {
    const newName = prompt('Enter new name:', customer.name)
    if (newName && newName !== customer.name) {
      updateMutation.mutate({ id: customer._id, payload: { name: newName } })
    }
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Customer Management</h1>

      <form onSubmit={onCreate} className="form-grid">
        <input 
          name="name" 
          placeholder="Full Name" 
          required 
          className="form-input"
        />
        <input 
          name="email" 
          placeholder="Email Address" 
          type="email" 
          required 
          className="form-input"
        />
        <input 
          name="phone" 
          placeholder="Phone Number" 
          className="form-input"
        />
        <input 
          name="company" 
          placeholder="Company Name" 
          className="form-input"
        />
        <button 
          type="submit" 
          disabled={createMutation.isPending} 
          className="primary-button"
        >
          {createMutation.isPending ? 'Adding...' : '+ Add Customer'}
        </button>
      </form>

      <div className="search-section">
        <input 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setPage(1) }} 
          placeholder="Search customers by name or email..." 
          className="search-input"
        />
        <button 
          onClick={() => qc.invalidateQueries({ queryKey: ['customers'] })} 
          className="secondary-button"
        >
          🔄 Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((customer) => (
              <tr key={customer._id}>
                <td>
                  <Link to={`/customers/${customer._id}`} className="table-link">
                    {customer.name}
                  </Link>
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.company || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(customer)} 
                      className="edit-button"
                      disabled={updateMutation.isPending}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(customer._id, customer.name)} 
                      className="delete-button"
                      disabled={deleteMutation.isPending}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!!data && (
        <div className="pagination">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage((p) => p - 1)}
            className="pagination-button"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {page} of {Math.max(1, Math.ceil((data.total || 0) / limit))}
          </span>
          <button 
            disabled={page >= Math.ceil((data.total || 0) / limit)} 
            onClick={() => setPage((p) => p + 1)}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
