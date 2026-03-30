import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data, selectedFeature, onSelect }) {
  const chartData = {
    labels: data.map(d => d.feature_name),
    datasets: [
      {
        label: 'Total Clicks',
        data: data.map(d => d.total_clicks),
        backgroundColor: data.map(d => 
          d.feature_name === selectedFeature ? '#00e5ff' : 'rgba(0, 229, 255, 0.3)'
        ),
        borderColor: '#00e5ff',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
        if (elements.length > 0) {
            const index = elements[0].index;
            onSelect(data[index].feature_name);
        }
    },
    scales: {
      x: { grid: { color: '#222230' }, ticks: { color: '#888899' } },
      y: { grid: { color: '#222230', display: false }, ticks: { color: '#888899' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111118',
        titleColor: '#00e5ff',
        bodyColor: '#ffffff',
        borderColor: '#222230',
        borderWidth: 1
      }
    }
  };

  if(!data.length) return <div className="text-secondary flex-center h-full" style={{minHeight:'100%'}}>No data available</div>;

  return <Bar data={chartData} options={options} />;
}
