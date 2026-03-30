import { Line } from 'react-chartjs-2';
import { trackEvent } from '../api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

let lastHover = 0;

export default function LineChart({ data, feature }) {
  if (!feature) return <div className="text-secondary flex-center h-full" style={{minHeight:'400px'}}>Select a feature</div>;

  const featureData = data.filter(d => d.feature_name === feature).sort((a,b) => new Date(a.date) - new Date(b.date));
  
  const chartData = {
    labels: featureData.map(d => d.date),
    datasets: [
      {
        label: `Clicks on ${feature}`,
        data: featureData.map(d => d.click_count),
        borderColor: '#00e5ff',
        backgroundColor: 'rgba(0, 229, 255, 0.2)',
        pointBackgroundColor: '#111118',
        pointBorderColor: '#00e5ff',
        pointHoverBackgroundColor: '#00e5ff',
        pointHoverBorderColor: '#ffffff',
        fill: true,
        tension: 0.4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    onHover: (event, elements) => {
      if (elements.length > 0) {
         const now = Date.now();
         if (now - lastHover > 1000) {
            trackEvent('line_chart_hover');
            lastHover = now;
         }
      }
    },
    scales: {
      x: { grid: { color: '#222230' }, ticks: { color: '#888899' } },
      y: { grid: { color: '#222230' }, ticks: { color: '#888899', precision: 0 } }
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

  if(!featureData.length) return <div className="text-secondary flex-center h-full" style={{minHeight:'100%'}}>No line data available</div>;

  return <Line data={chartData} options={options} />;
}
