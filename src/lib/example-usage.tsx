/**
 * Example usage of the LeadsPublic and LeadsAdmin classes in React components
 * This file demonstrates how to integrate the lead management system with React
 */

import React, { useState, useEffect } from 'react';
import { createLeadsPublicService, createLeadsAdminService, CreateLeadInput, Lead } from './index';

// Example React component for lead submission
export function LeadSubmissionForm() {
  const [formData, setFormData] = useState<CreateLeadInput>({
    lead_kind: 'subscriber',
    email: '',
    contact_name: '',
    business_name: '',
    phone: '',
    website: '',
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const leadsService = createLeadsPublicService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const result = await leadsService.createLead(formData);
      
      if (result.success) {
        setMessage('Lead submitted successfully!');
        setFormData({
          lead_kind: 'subscriber',
          email: '',
          contact_name: '',
          business_name: '',
          phone: '',
          website: '',
          tags: [],
        });
      } else {
        setMessage(`Error: ${result.error?.message}`);
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="lead_kind" className="block text-sm font-medium">
          Lead Type
        </label>
        <select
          id="lead_kind"
          value={formData.lead_kind}
          onChange={(e) => setFormData({ ...formData, lead_kind: e.target.value as any })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        >
          <option value="general">General</option>
          <option value="vendor">Vendor</option>
          <option value="sponsor">Sponsor</option>
          <option value="volunteer">Volunteer</option>
        </select>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="contact_name" className="block text-sm font-medium">
          Contact Name
        </label>
        <input
          type="text"
          id="contact_name"
          value={formData.contact_name || ''}
          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="business_name" className="block text-sm font-medium">
          Business Name
        </label>
        <input
          type="text"
          id="business_name"
          value={formData.business_name || ''}
          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium">
          Website
        </label>
        <input
          type="url"
          id="website"
          value={formData.website || ''}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Lead'}
      </button>

      {message && (
        <div className={`rounded-md p-4 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}
    </form>
  );
}

// Example React component for admin lead management
export function AdminLeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const leadsAdminService = createLeadsAdminService();

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const result = await leadsAdminService.searchLeads({
        limit: 50,
        orderBy: 'created_at',
        orderDirection: 'desc',
      });

      if (result.success && result.data) {
        setLeads(result.data.leads);
      } else {
        setError(result.error?.message || 'Failed to load leads');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const result = await leadsAdminService.exportLeadsToCSV();
      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to export CSV');
    }
  };

  if (loading) return <div>Loading leads...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leads Dashboard</h2>
        <button
          onClick={exportToCSV}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {lead.lead_kind}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.contact_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.business_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
