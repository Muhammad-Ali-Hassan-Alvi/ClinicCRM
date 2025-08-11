import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-2 border border-gray-200 rounded-lg shadow-lg">
        <p className="label text-gray-700">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const TicketsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false} />
        <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} content={<CustomTooltip />} />
        <Bar dataKey="value" barSize={35} radius={[0, 8, 8, 0]}>
            <Cell fill="#22D3EE"/>
            <Cell fill="#22C55E"/>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TicketsChart;