import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { trackEvent } from '../api';

export default function FilterBar({ onChange }) {
  const [filters, setFilters] = useState({
    start_date: Cookies.get('filter_start') || '',
    end_date: Cookies.get('filter_end') || '',
    age: Cookies.get('filter_age') || 'All Ages',
    gender: Cookies.get('filter_gender') || 'All Genders'
  });

  useEffect(() => {
    // Initial fetch on mount
    onChange(filters);
    // eslint-disable-next-line
  }, []);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (value) {
        Cookies.set(`filter_${key === 'start_date' ? 'start' : key === 'end_date' ? 'end' : key}`, value, { expires: 7 });
    } else {
        Cookies.remove(`filter_${key === 'start_date' ? 'start' : key === 'end_date' ? 'end' : key}`);
    }

    if (key === 'start_date' || key === 'end_date') trackEvent('date_filter');
    if (key === 'age') trackEvent('age_filter');
    if (key === 'gender') trackEvent('gender_filter');

    onChange(newFilters);
  };

  return (
    <div className="surface flex-center gap-8" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      <div className="flex-col gap-2">
        <label className="text-sm text-secondary">Start Date</label>
        <input type="date" className="input-field" style={{ marginBottom: 0, padding: '8px' }}
          value={filters.start_date}
          onChange={(e) => handleChange('start_date', e.target.value)} />
      </div>

      <div className="flex-col gap-2">
        <label className="text-sm text-secondary">End Date</label>
        <input type="date" className="input-field" style={{ marginBottom: 0, padding: '8px' }}
          value={filters.end_date}
          onChange={(e) => handleChange('end_date', e.target.value)} />
      </div>

      <div className="flex-col gap-2">
        <label className="text-sm text-secondary">Age Group</label>
        <select className="input-field" style={{ marginBottom: 0, padding: '8px' }}
          value={filters.age}
          onChange={(e) => handleChange('age', e.target.value)}>
          <option value="All Ages">All Ages</option>
          <option value="Under 18">Under 18</option>
          <option value="18-40">18-40</option>
          <option value="Over 40">Over 40</option>
        </select>
      </div>

      <div className="flex-col gap-2">
        <label className="text-sm text-secondary">Gender</label>
        <select className="input-field" style={{ marginBottom: 0, padding: '8px' }}
          value={filters.gender}
          onChange={(e) => handleChange('gender', e.target.value)}>
          <option value="All Genders">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
}
