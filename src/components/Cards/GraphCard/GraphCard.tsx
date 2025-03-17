'use client';
import { DonutChart } from '@tremor/react';

const GraphCard = () => {
  const data = [
    { name: 'Approved', value: 80, color: '#4CAF50' },
    { name: 'Pending', value: 100, color: '#FFC107' },
    { name: 'Rejected', value: 54, color: '#F44336' },
  ];

  return (
    <div className="bg-[#F8F4FF] rounded-2xl shadow-md p-4 w-full">
      <h3 className="text-lg font-semibold text-center">Venue Requests</h3>
      <div className="flex justify-center items-center my-4 relative">
        <DonutChart
          data={data}
          category="value"
          index="name"
          colors={data.map((d) => d.color)}
          valueFormatter={(number) => `${number}`}
          showLabel={false}
          className="h-40 w-40"
        />
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold">234</span>
          <span className="text-gray-500 text-sm">Total Requests</span>
        </div>
      </div>
    </div>
  );
};

export default GraphCard;
