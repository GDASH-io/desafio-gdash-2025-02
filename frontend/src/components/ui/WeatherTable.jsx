import React from 'react'

export default function WeatherTable({data=[], loading=false}){
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="pb-2">Data / Hora</th>
            <th className="pb-2">Local</th>
            <th className="pb-2">Temp (°C)</th>
            <th className="pb-2">Umidade</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan="4" className="py-4 text-center text-gray-300">Carregando...</td></tr>}
          {!loading && data.length===0 && <tr><td colSpan="4" className="py-6 text-center text-gray-400">Sem registros ainda</td></tr>}
          {data.map((r,i)=>(
            <tr key={i} className="border-t border-white/5 hover:bg-white/2">
              <td className="py-2 align-top">{r.timestamp ? new Date(r.timestamp).toLocaleString() : '-'}</td>
              <td className="py-2 align-top">{r.location ?? '-'}</td>
              <td className="py-2 align-top">{r.temperature ?? '-'}</td>
              <td className="py-2 align-top">{r.humidity ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
