import { useParams } from 'react-router-dom';
import { AdminLayout } from '../AdminLayout';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AdminLayout
      breadcrumb={
        <div className="flex items-center gap-2">
          <a href="/manage/analytics" className="text-gray-400 hover:text-gray-300">Analytics</a>
          <span className="text-gray-600">›</span>
          <a href="/manage/analytics/sessions" className="text-gray-400 hover:text-gray-300">Sessions</a>
          <span className="text-gray-600">›</span>
          <span className="text-gray-300">Session {id}</span>
        </div>
      }
      pageHeader={
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Session Detail</h1>
          <p className="text-gray-400 mt-1">Session ID: {id}</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Session Summary Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Session Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Start Time</div>
              <div className="text-white font-medium">Loading...</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Duration</div>
              <div className="text-white font-medium">Loading...</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Pageviews</div>
              <div className="text-white font-medium">Loading...</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Events</div>
              <div className="text-white font-medium">Loading...</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">IP Address</div>
              <div className="text-white font-medium">Loading...</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Location</div>
              <div className="text-white font-medium">Loading...</div>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Session Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="text-sm text-gray-400">0:00</div>
              <div className="text-white">Page / (home)</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="text-sm text-gray-400">0:10</div>
              <div className="text-white">Clicked "Get Involved"</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="text-sm text-gray-400">0:35</div>
              <div className="text-white">Form submitted</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="text-sm text-gray-400">1:05</div>
              <div className="text-white">Page /thank-you</div>
            </div>
          </div>
        </div>

        {/* Event Log Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Event Log</h2>
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "sessionId": "${id}",
  "events": [
    {
      "timestamp": "2024-01-09T10:00:00Z",
      "type": "pageview",
      "url": "/",
      "title": "Home"
    },
    {
      "timestamp": "2024-01-09T10:00:10Z",
      "type": "event",
      "name": "cta_click",
      "label": "Get Involved"
    }
  ]
}`}
            </pre>
          </div>
        </div>

        {/* Lead Submission Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Lead Submission</h2>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-300">No lead submission found for this session.</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
