import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CustomersAPI, LeadsAPI, type Lead } from '../lib/api'
import { useState } from 'react'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [status, setStatus] = useState<string>('')

  const { data: customerResp } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data } = await CustomersAPI.get(id!)
      return data as { name: string; email: string; phone?: string; company?: string }
    },
    enabled: !!id,
  })

  const { data: leads } = useQuery({
    queryKey: ['leads', { id, status }],
    queryFn: async () => {
      const { data } = await LeadsAPI.list(id!, status || undefined)
      return data as Lead[]
    },
    enabled: !!id,
  })

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string; status?: string; value?: number }) => LeadsAPI.create(id!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['customer'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: Partial<Lead> }) => LeadsAPI.update(id!, leadId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['customer'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (leadId: string) => LeadsAPI.remove(id!, leadId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['customer'] })
    },
  })

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData) as Record<string, string>
    createMutation.mutate({
      title: payload.title,
      description: payload.description || undefined,
      status: payload.status || 'New',
      value: Number(payload.value || 0),
    })
    form.reset()
  }

  function handleEditLead(lead: Lead) {
    const newStatus = prompt('Enter new status (New, Contacted, Converted, Lost):', lead.status)
    if (newStatus && ['New', 'Contacted', 'Converted', 'Lost'].includes(newStatus)) {
      updateMutation.mutate({ leadId: lead._id, payload: { status: newStatus as 'New' | 'Contacted' | 'Converted' | 'Lost' } })
    }
  }

  function handleDeleteLead(leadId: string, title: string) {
    if (confirm(`Are you sure you want to delete the lead "${title}"?`)) {
      deleteMutation.mutate(leadId)
    }
  }

  const getStatusBadgeClass = (leadStatus: string) => {
    switch (leadStatus) {
      case 'New': return 'status-badge status-new'
      case 'Contacted': return 'status-badge status-contacted'
      case 'Converted': return 'status-badge status-converted'
      case 'Lost': return 'status-badge status-lost'
      default: return 'status-badge'
    }
  }

  return (
    <div className="page-container">
      <div className="back-link">
        <Link to="/" className="table-link">← Back to Customers</Link>
      </div>
      
      <h1 className="page-title">Customer Details</h1>
      
      {customerResp && (
        <div className="customer-info-card">
          <div className="customer-header">
            <div className="customer-avatar">
              {customerResp.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
            <div className="customer-details">
              <h2 className="customer-name">{customerResp.name}</h2>
              <div className="customer-meta">
                <span>📧 {customerResp.email}</span>
                {customerResp.phone && <span>📞 {customerResp.phone}</span>}
                {customerResp.company && <span>🏢 {customerResp.company}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">Lead Management</h2>
      </div>

      <form onSubmit={onCreate} className="form-grid">
        <input 
          name="title" 
          placeholder="Lead Title" 
          required 
          className="form-input"
        />
        <input 
          name="description" 
          placeholder="Description" 
          className="form-input"
        />
        <select 
          name="status" 
          defaultValue="New" 
          className="form-input"
          aria-label="Lead Status"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
        <input 
          name="value" 
          placeholder="Lead Value ($)" 
          type="number" 
          min="0"
          step="0.01"
          className="form-input"
        />
        <button 
          type="submit" 
          disabled={createMutation.isPending} 
          className="primary-button"
        >
          {createMutation.isPending ? 'Adding...' : '+ Add Lead'}
        </button>
      </form>

      <div className="filter-section">
        <label htmlFor="status-filter" className="filter-label">Filter by Status:</label>
        <select 
          id="status-filter"
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          className="form-input"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads?.map((lead) => (
            <tr key={lead._id}>
              <td>
                <div className="lead-title">{lead.title}</div>
              </td>
              <td>
                <div className="lead-description">{lead.description || '-'}</div>
              </td>
              <td>
                <span className={getStatusBadgeClass(lead.status)}>
                  {lead.status}
                </span>
              </td>
              <td>
                <div className="lead-value">
                  ${lead.value?.toLocaleString() || '0'}
                </div>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    onClick={() => handleEditLead(lead)} 
                    className="edit-button"
                    disabled={updateMutation.isPending}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteLead(lead._id, lead.title)} 
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

      {leads && leads.length === 0 && (
        <div className="empty-state">
          <h3>No leads found</h3>
          <p>Start by adding your first lead for this customer.</p>
        </div>
      )}
    </div>
  )
}
