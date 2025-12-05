import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function WeatherChart({data=[]}){
  const chartData = (data || []).slice(0,50).map(d=>({ time: d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : '', temp: d.temperature }))
  return (
    <div style={{ width:'100%', height:300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
          <XAxis dataKey="time" tick={{fontSize:12, fill:'#94a3b8'}} />
          <YAxis tick={{fontSize:12, fill:'#94a3b8'}} domain={['dataMin - 5','dataMax + 5']} />
          <Tooltip wrapperStyle={{background:'#0b1220', borderRadius:8}} labelStyle={{color:'#cbd5e1'}} />
          <Line type="monotone" dataKey="temp" stroke="#60a5fa" strokeWidth={2} dot={{r:2}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
