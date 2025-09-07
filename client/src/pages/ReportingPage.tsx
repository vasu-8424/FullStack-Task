import { useQuery } from '@tanstack/react-query'
import { ReportsAPI } from '../lib/api'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#60a5fa', '#f59e0b', '#10b981', '#ef4444']

export default function ReportingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['report', 'lead-status'],
    queryFn: async () => {
      const { data } = await ReportsAPI.leadStatus()
      return data as { statusCounts: Record<string, number> }
    },
  })

  const chartData = data
    ? [
        { name: 'New', value: data.statusCounts.New || 0 },
        { name: 'Contacted', value: data.statusCounts.Contacted || 0 },
        { name: 'Converted', value: data.statusCounts.Converted || 0 },
        { name: 'Lost', value: data.statusCounts.Lost || 0 },
      ]
    : []

  const totalLeads = chartData.reduce((sum, item) => sum + item.value, 0)
  const colorClasses = ['color-blue', 'color-orange', 'color-green', 'color-red']

  return (
    <div className="page-container">
      <h1 className="page-title">Lead Status Analytics</h1>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {chartData.map((item, index) => (
              <div key={item.name} className="stat-card">
                <div className={`stat-icon ${colorClasses[index]}`}>
                  {item.value}
                </div>
                <h3 className="stat-title">{item.name}</h3>
                <p className="stat-description">
                  {totalLeads > 0 ? Math.round((item.value / totalLeads) * 100) : 0}% of total
                </p>
              </div>
            ))}
          </div>
          
          <div className="chart-container">
            <h2 className="chart-title">Lead Distribution Overview</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer>
                <PieChart>
                  <Pie 
                    dataKey="value" 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-summary">
              <h3 className="summary-title">Total Leads: {totalLeads}</h3>
              <p className="summary-description">
                Track your lead conversion progress and identify opportunities
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


