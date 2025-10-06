/**
 * Example usage of SiteSettingsManager
 * This file demonstrates how to use the settings manager in React components
 */

import { useState, useEffect } from 'react';
import { SiteSettingsManager, ColorTheme, GetInvolvedType, useSiteSettings } from './SiteSettingsManager';

// Example 1: Using the class directly
export function DirectUsageExample() {
  const [settings, setSettings] = useState(SiteSettingsManager.getInstance().getSettings());

  const handleColorThemeChange = (colorTheme: ColorTheme) => {
    SiteSettingsManager.getInstance().setColorTheme(colorTheme);
    setSettings(SiteSettingsManager.getInstance().getSettings());
  };

  const handleEmailSubscription = (subscribed: boolean) => {
    SiteSettingsManager.getInstance().setEmailSubscribed(subscribed);
    setSettings(SiteSettingsManager.getInstance().getSettings());
  };

  const handleGetInvolvedSubmission = (type: GetInvolvedType, submitted: boolean) => {
    SiteSettingsManager.getInstance().setGetInvolvedSubmission(type, submitted);
    setSettings(SiteSettingsManager.getInstance().getSettings());
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Settings Manager - Direct Usage</h2>
      
      {/* Color Theme Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Color Theme</label>
        <select
          value={settings.colorTheme}
          onChange={(e) => handleColorThemeChange(e.target.value as ColorTheme)}
          className="border rounded px-3 py-2"
        >
          <option value="purple">Purple</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
          <option value="amber">Amber</option>
          <option value="rose">Rose</option>
        </select>
      </div>

      {/* Email Subscription */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.emailSubscribed}
            onChange={(e) => handleEmailSubscription(e.target.checked)}
            className="rounded"
          />
          <span>Email subscribed</span>
        </label>
      </div>

      {/* Get Involved Submissions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Get Involved Submissions</h3>
        {(['vendor', 'sponsor', 'volunteer'] as GetInvolvedType[]).map((type) => (
          <label key={type} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={settings.getInvolvedSubmissions[type]}
              onChange={(e) => handleGetInvolvedSubmission(type, e.target.checked)}
              className="rounded"
            />
            <span className="capitalize">{type}</span>
          </label>
        ))}
      </div>

      {/* Settings Summary */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Settings Summary</h3>
        <pre className="text-sm">
          {JSON.stringify(SiteSettingsManager.getInstance().getSettingsSummary(), null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Example 2: Using the React hook
export function HookUsageExample() {
  const settings = useSiteSettings();
  const [currentSettings, setCurrentSettings] = useState(settings.getSettings());

  // Update local state when settings change
  useEffect(() => {
    setCurrentSettings(settings.getSettings());
  }, []);

  const handleUpdate = (updates: any) => {
    settings.updateSettings(updates);
    setCurrentSettings(settings.getSettings());
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Settings Manager - Hook Usage</h2>
      
      {/* Color Theme Toggle */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleUpdate({ colorTheme: 'purple' })}
          className={`px-4 py-2 rounded ${
            currentSettings.colorTheme === 'purple' ? 'bg-purple-500 text-white' : 'bg-gray-200'
          }`}
        >
          Purple
        </button>
        <button
          onClick={() => handleUpdate({ colorTheme: 'green' })}
          className={`px-4 py-2 rounded ${
            currentSettings.colorTheme === 'green' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
        >
          Green
        </button>
        <button
          onClick={() => handleUpdate({ colorTheme: 'blue' })}
          className={`px-4 py-2 rounded ${
            currentSettings.colorTheme === 'blue' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Blue
        </button>
        <button
          onClick={() => handleUpdate({ colorTheme: 'amber' })}
          className={`px-4 py-2 rounded ${
            currentSettings.colorTheme === 'amber' ? 'bg-amber-500 text-white' : 'bg-gray-200'
          }`}
        >
          Amber
        </button>
        <button
          onClick={() => handleUpdate({ colorTheme: 'rose' })}
          className={`px-4 py-2 rounded ${
            currentSettings.colorTheme === 'rose' ? 'bg-rose-500 text-white' : 'bg-gray-200'
          }`}
        >
          Rose
        </button>
      </div>

      {/* Email Subscription Toggle */}
      <div>
        <button
          onClick={() => handleUpdate({ emailSubscribed: !currentSettings.emailSubscribed })}
          className={`px-4 py-2 rounded ${
            currentSettings.emailSubscribed ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
        >
          {currentSettings.emailSubscribed ? 'Unsubscribe' : 'Subscribe'} to Email
        </button>
      </div>

      {/* Get Involved Quick Actions */}
      <div className="space-y-2">
        <h3 className="font-semibold">Quick Actions</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => settings.setGetInvolvedSubmission('vendor', true)}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
          >
            Mark as Vendor
          </button>
          <button
            onClick={() => settings.setGetInvolvedSubmission('sponsor', true)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Mark as Sponsor
          </button>
          <button
            onClick={() => settings.setGetInvolvedSubmission('volunteer', true)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Mark as Volunteer
          </button>
        </div>
        <button
          onClick={() => {
            settings.clearGetInvolvedSubmissions();
            setCurrentSettings(settings.getSettings());
          }}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Clear All Submissions
        </button>
      </div>

      {/* Current Status Display */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Current Status</h3>
        <div className="space-y-1 text-sm">
          <div>Color Theme: <span className="font-mono">{currentSettings.colorTheme}</span></div>
          <div>Email Subscribed: <span className="font-mono">{currentSettings.emailSubscribed ? 'Yes' : 'No'}</span></div>
          <div>Vendor: <span className="font-mono">{currentSettings.getInvolvedSubmissions.vendor ? 'Yes' : 'No'}</span></div>
          <div>Sponsor: <span className="font-mono">{currentSettings.getInvolvedSubmissions.sponsor ? 'Yes' : 'No'}</span></div>
          <div>Volunteer: <span className="font-mono">{currentSettings.getInvolvedSubmissions.volunteer ? 'Yes' : 'No'}</span></div>
          <div>Any Submissions: <span className="font-mono">{settings.hasAnyGetInvolvedSubmission() ? 'Yes' : 'No'}</span></div>
        </div>
      </div>
    </div>
  );
}

// Example 3: Integration with existing forms
export function FormIntegrationExample() {
  const settings = useSiteSettings();

  const handleEmailSignup = async (email: string) => {
    // Simulate email signup process
    console.log('Email signup:', email);
    
    // Mark as subscribed in settings
    settings.setEmailSubscribed(true);
    
    // You could also store the email or timestamp in meta data
    // Note: This would require extending the SiteSettings interface to include meta field
    console.log('Email signup metadata:', {
      emailSignupDate: new Date().toISOString(),
      emailAddress: email
    });
  };

  const handleGetInvolvedSubmission = async (type: GetInvolvedType, formData: any) => {
    // Simulate form submission
    console.log(`${type} submission:`, formData);
    
    // Mark as submitted in settings
    settings.setGetInvolvedSubmission(type, true);
    
    // Store submission metadata
    // Note: This would require extending the SiteSettings interface to include meta field
    console.log('Submission metadata:', {
      [`${type}SubmissionDate`]: new Date().toISOString(),
      [`${type}FormData`]: formData
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Form Integration Example</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Email Signup</h3>
          <button
            onClick={() => handleEmailSignup('user@example.com')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Simulate Email Signup
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Get Involved Forms</h3>
          <div className="space-x-2">
            <button
              onClick={() => handleGetInvolvedSubmission('vendor', { businessName: 'Test Business' })}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
            >
              Submit as Vendor
            </button>
            <button
              onClick={() => handleGetInvolvedSubmission('sponsor', { companyName: 'Test Company' })}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Submit as Sponsor
            </button>
            <button
              onClick={() => handleGetInvolvedSubmission('volunteer', { name: 'Test Volunteer' })}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Submit as Volunteer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
