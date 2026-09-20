import React, { useEffect, useState } from 'react';

const AgentWorkflowTimeline = ({ ticketId }) => {
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/agent/workflow/${ticketId}`);
        if (res.ok) {
          const data = await res.json();
          setWorkflowData(data);
        }
      } catch (err) {
        console.error("Failed to fetch workflow logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [ticketId]);

  if (loading) return <div className="p-4 text-gray-500">Loading Agent Pipeline Status...</div>;
  if (!workflowData) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mt-4">
      {/* Header Badges */}
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Multi-Agent Execution Pipeline</h3>
        <div className="flex gap-2">
          {workflowData.jira_key && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded border border-blue-300">
              Jira: {workflowData.jira_key} ({workflowData.jira_status})
            </span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${
            workflowData.workflow_status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'
          }`}>
            Status: {workflowData.workflow_status}
          </span>
        </div>
      </div>

      {/* Agent Step Progression */}
      <div className="space-y-4">
        {workflowData.agent_executions?.map((exec, idx) => (
          <div key={exec.execution_id || idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-md border border-gray-100">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              {idx + 1}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">{exec.agent_name} Agent</h4>
                <span className="text-xs text-gray-500 font-mono">
                  Confidence: {(exec.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {exec.output_data?.diagnosis || exec.output_data?.reason || "Executed successfully."}
              </p>

              {/* Resolution Steps Display */}
              {exec.output_data?.suggested_steps && (
                <ul className="list-disc list-inside text-xs text-gray-700 mt-2 bg-white p-2 rounded border">
                  {exec.output_data.suggested_steps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Email Delivery Logs */}
      {workflowData.email_logs && workflowData.email_logs.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Notifications</h4>
          <div className="flex flex-wrap gap-2">
            {workflowData.email_logs.map((log, lIdx) => (
              <span key={lIdx} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded border">
                ✉️ {log.email_type} → {log.status}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentWorkflowTimeline;