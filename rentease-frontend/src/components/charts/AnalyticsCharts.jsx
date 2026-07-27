import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, ScatterChart, Scatter, ZAxis,
} from 'recharts'

const COLORS = ['#1B5E9B','#1A6B3C','#6A1B9A','#B45309','#991B1B','#0891B2','#059669','#7C3AED']

const ChartCard = ({ title, subtitle, children, height = 280 }) => (
  <div className="card p-5">
    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{title}</h3>
    {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}
    <div style={{ height }}>{children}</div>
  </div>
)

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-3 py-2 text-xs">
      {label && <p className="font-medium text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#1B5E9B' }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toFixed(0) : p.value}{suffix}
        </p>
      ))}
    </div>
  )
}

// 1. Average Rent by Suburb
export function AvgRentBySuburb({ data = [] }) {
  const chartData = data
    .map(d => ({ suburb: d._id || 'Unknown', avgRent: Math.round(d.avgRent || 0) }))
    .slice(0, 12)

  return (
    <ChartCard title="Average Rent by Suburb" subtitle="Top 12 suburbs by weekly rent (AUD)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="suburb" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
          <Tooltip content={<CustomTooltip prefix="$" suffix="/wk" />} />
          <Bar dataKey="avgRent" name="Avg Rent" fill="#1B5E9B" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// 2. Property Type Distribution
export function PropertyTypeDistribution({ data = [] }) {
  const chartData = data.map(d => ({ name: d._id || 'Other', value: d.count || 0 }))

  return (
    <ChartCard title="Property Type Distribution" subtitle="Breakdown by property type">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="45%"
            outerRadius={90} innerRadius={45}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [v, 'Properties']} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// 3. Listings by City
export function ListingsByCity({ data = [] }) {
  const chartData = data.map(d => ({
    city: d._id || 'Unknown',
    count: d.count || 0
  })).slice(0, 10)

  return (
    <ChartCard title="Listings by City" subtitle="Top 10 cities by total listings">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="city" tick={{ fontSize: 9 }} width={58} />
          <Tooltip content={<CustomTooltip suffix=" listings" />} />
          <Bar dataKey="count" name="Listings" radius={[0,4,4,0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// 4. Rent Range Distribution
export function RentRangeDistribution({ data = [] }) {
  const chartData = data.map(d => ({
    range: d._id === '2000+' ? '$2000+' : `$${d._id}`,
    count: d.count || 0,
    avgRent: Math.round(d.avgRent || 0),
  }))

  return (
    <ChartCard title="Rent Range Distribution" subtitle="Number of properties per price band">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="range" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip suffix=" properties" />} />
          <Bar dataKey="count" name="Properties" fill="#1A6B3C" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// 5. Bedroom Distribution
export function BedroomDistribution({ data = [] }) {
  const chartData = data.map(d => ({
    bedrooms: `${d._id} bed${d._id !== 1 ? 's' : ''}`,
    count: d.count || 0,
  })).sort((a,b) => parseInt(a.bedrooms) - parseInt(b.bedrooms))

  return (
    <ChartCard title="Bedroom Count Distribution" subtitle="How many properties per bedroom count">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="bedrooms" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip suffix=" properties" />} />
          <Bar dataKey="count" name="Properties" fill="#6A1B9A" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// 6. Rent Trend Over Time
export function RentTrend({ data = [] }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const chartData = data.map(d => ({
    period: `${months[(d._id?.month || 1) - 1]} ${d._id?.year || ''}`,
    avgRent: Math.round(d.avgRent || 0),
  }))

  return (
    <ChartCard title="Rent Trend Over Time" subtitle="Average weekly rent by month">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="period" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
          <Tooltip content={<CustomTooltip prefix="$" suffix="/wk" />} />
          <Line
            type="monotone" dataKey="avgRent" name="Avg Rent"
            stroke="#B45309" strokeWidth={2.5}
            dot={{ r: 4, fill: '#B45309' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// 7. Price vs Bedrooms Scatter
export function PriceVsBedrooms({ data = [] }) {
  const chartData = data.map(d => ({
    bedrooms: d.bedrooms || 0,
    rentPrice: d.rentPrice || 0,
    type: d.type || 'other',
  })).filter(d => d.rentPrice > 0 && d.rentPrice < 3000)

  return (
    <ChartCard title="Price vs Bedrooms" subtitle="Scatter plot — rent price vs bedroom count">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="bedrooms" name="Bedrooms" type="number"
            label={{ value: 'Bedrooms', position: 'insideBottom', offset: -2, fontSize: 10 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            dataKey="rentPrice" name="Rent"
            tickFormatter={v => `$${v}`}
            tick={{ fontSize: 10 }}
          />
          <ZAxis range={[20, 20]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]?.payload
              return (
                <div className="bg-white border border-gray-100 shadow rounded-lg px-3 py-2 text-xs">
                  <p className="font-medium capitalize">{d?.type}</p>
                  <p>Bedrooms: {d?.bedrooms}</p>
                  <p>Rent: ${d?.rentPrice}/wk</p>
                </div>
              )
            }}
          />
          <Scatter data={chartData} fill="#1B5E9B" fillOpacity={0.6} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// 8. Vacancy Rate by City
export function VacancyRateByCity({ data = [] }) {
  const chartData = data.map(d => {
    const available = d.statuses?.find(s => s.status === 'available')?.count || 0
    const total = d.total || 1
    return {
      city: d._id || 'Unknown',
      available,
      rented: total - available,
      rate: Math.round((available / total) * 100),
    }
  }).slice(0, 10)

  return (
    <ChartCard title="Vacancy Rate by City" subtitle="Available vs rented properties per city">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="city" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="available" name="Available" fill="#1A6B3C" radius={[4,4,0,0]} stackId="a" />
          <Bar dataKey="rented"    name="Rented"    fill="#991B1B" radius={[4,4,0,0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}