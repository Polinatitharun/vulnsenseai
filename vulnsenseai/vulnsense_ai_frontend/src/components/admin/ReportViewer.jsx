import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { get } from '../auth/api'

export default function ReportViewer() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await get('/auth/audits/');
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <p>Loading reports...</p>;

  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>Audit Reports Viewer</h2>
        <p>Click on a report to view detailed findings</p>
      </div>
      <div className="reports-list">
        {reports.map(report => (
          <div key={report.id} className="report-card">
            <FileText className="icon" />
            <div className="report-details">
              <h4>{report.name}</h4>
              <p>Target: {report.target_name}</p>
              <p>Generated: {new Date(report.generated_at).toLocaleString()}</p>
            </div>
            <a href={report.report_url} target="_blank" className="btn btn-primary btn-sm">
              View Report
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
