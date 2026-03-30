import { useEffect, useState } from 'react';
import api, { trackEvent } from '../api';
import FilterBar from '../components/FilterBar';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';

export default function Dashboard() {
  const [data, setData] = useState({ barData: [], lineData: [] });
  const [selectedFeature, setSelectedFeature] = useState(null);

  const fetchAnalytics = async (filters) => {
    try {
      const params = new URLSearchParams(filters);
      for (const [key, value] of Array.from(params.entries())) {
          if (!value) params.delete(key);
      }
      
      const res = await api.get(`/analytics?${params.toString()}`);
      setData(res.data);
      
      if (res.data.barData.length > 0) {
        const topFeature = [...res.data.barData].sort((a,b) => b.total_clicks - a.total_clicks)[0].feature_name;
        if (!selectedFeature || !res.data.barData.find(f => f.feature_name === selectedFeature)) {
            setSelectedFeature(topFeature);
        }
      } else {
        setSelectedFeature(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    trackEvent('bar_chart_click');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <header className="surface" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '2rem' }}>
        <div className="container flex items-center justify-between" style={{ padding: '0.5rem 2rem' }}>
          <h1 className="text-accent" style={{ margin: 0, letterSpacing: '4px' }}>VIGILITY</h1>
          <button className="btn" onClick={handleLogout}>LOGOUT</button>
        </div>
      </header>

      <div className="container flex-col gap-8">
        <FilterBar onChange={fetchAnalytics} />
        
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-4 surface">
            <h3 className="text-secondary">TOTAL CLICKS BY FEATURE</h3>
            <div className="chart-container">
                <BarChart data={data.barData} selectedFeature={selectedFeature} onSelect={handleFeatureSelect} />
            </div>
          </div>
          
          <div className="col-span-8 surface">
            <h3 className="text-secondary">
                CLICKS OVER TIME {selectedFeature ? `— ${selectedFeature.toUpperCase()}` : ''}
            </h3>
            <div className="chart-container">
                <LineChart data={data.lineData} feature={selectedFeature} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
