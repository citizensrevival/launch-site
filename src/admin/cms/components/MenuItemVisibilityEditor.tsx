// Menu Item Visibility Editor Component
// Configure visibility rules for menu items

import { useState, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { 
  mdiClose,
  mdiContentSave,
  mdiMonitor,
  mdiAccount,
  mdiFlag,
  mdiCalendar,
  mdiEye,
  mdiEyeOff
} from '@mdi/js';

interface MenuItemVisibilityEditorProps {
  visibility?: any;
  onSave: (visibility: any) => void;
  onClose: () => void;
}

interface VisibilityRule {
  type: 'device' | 'audience' | 'feature_flag' | 'schedule';
  condition: string;
  value: any;
  enabled: boolean;
}

export function MenuItemVisibilityEditor({ visibility, onSave, onClose }: MenuItemVisibilityEditorProps) {
  const [rules, setRules] = useState<VisibilityRule[]>([]);
  const [defaultVisibility, setDefaultVisibility] = useState(true);

  useEffect(() => {
    if (visibility) {
      setRules(visibility.rules || []);
      setDefaultVisibility(visibility.default_visibility !== false);
    }
  }, [visibility]);

  const addRule = (type: VisibilityRule['type']) => {
    const newRule: VisibilityRule = {
      type,
      condition: 'equals',
      value: '',
      enabled: true
    };
    setRules(prev => [...prev, newRule]);
  };

  const updateRule = (index: number, updates: Partial<VisibilityRule>) => {
    setRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, ...updates } : rule
    ));
  };

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const visibilityData = {
      default_visibility: defaultVisibility,
      rules: rules.filter(rule => rule.enabled && rule.value)
    };
    onSave(visibilityData);
  };

  const getRuleIcon = (type: VisibilityRule['type']) => {
    switch (type) {
      case 'device': return mdiMonitor;
      case 'audience': return mdiAccount;
      case 'feature_flag': return mdiFlag;
      case 'schedule': return mdiCalendar;
      default: return mdiEye;
    }
  };

  const getRuleLabel = (type: VisibilityRule['type']) => {
    switch (type) {
      case 'device': return 'Device Type';
      case 'audience': return 'User Audience';
      case 'feature_flag': return 'Feature Flag';
      case 'schedule': return 'Schedule';
      default: return 'Unknown';
    }
  };

  const getConditionOptions = (type: VisibilityRule['type']) => {
    switch (type) {
      case 'device':
        return [
          { value: 'equals', label: 'Is' },
          { value: 'not_equals', label: 'Is Not' }
        ];
      case 'audience':
        return [
          { value: 'equals', label: 'Is' },
          { value: 'not_equals', label: 'Is Not' },
          { value: 'contains', label: 'Contains' }
        ];
      case 'feature_flag':
        return [
          { value: 'equals', label: 'Is' },
          { value: 'not_equals', label: 'Is Not' }
        ];
      case 'schedule':
        return [
          { value: 'between', label: 'Between' },
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' }
        ];
      default:
        return [{ value: 'equals', label: 'Is' }];
    }
  };

  const getValueOptions = (type: VisibilityRule['type']) => {
    switch (type) {
      case 'device':
        return [
          { value: 'desktop', label: 'Desktop' },
          { value: 'tablet', label: 'Tablet' },
          { value: 'mobile', label: 'Mobile' }
        ];
      case 'audience':
        return [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' },
          { value: 'premium', label: 'Premium' }
        ];
      case 'feature_flag':
        return [
          { value: 'new_feature', label: 'New Feature' },
          { value: 'beta_access', label: 'Beta Access' },
          { value: 'premium_features', label: 'Premium Features' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Visibility Rules</h2>
            <p className="text-sm text-gray-400">Configure when this menu item should be visible</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Default Visibility */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Default Visibility</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="default_visibility"
                  checked={defaultVisibility}
                  onChange={() => setDefaultVisibility(true)}
                  className="text-blue-600"
                />
                <Icon path={mdiEye} size={1} className="text-green-400" />
                <div>
                  <div className="text-sm font-medium text-white">Visible by default</div>
                  <div className="text-xs text-gray-400">Show this item unless rules hide it</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="default_visibility"
                  checked={!defaultVisibility}
                  onChange={() => setDefaultVisibility(false)}
                  className="text-blue-600"
                />
                <Icon path={mdiEyeOff} size={1} className="text-red-400" />
                <div>
                  <div className="text-sm font-medium text-white">Hidden by default</div>
                  <div className="text-xs text-gray-400">Hide this item unless rules show it</div>
                </div>
              </label>
            </div>
          </div>

          {/* Visibility Rules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Visibility Rules</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => addRule('device')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  + Device
                </button>
                <button
                  onClick={() => addRule('audience')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  + Audience
                </button>
                <button
                  onClick={() => addRule('feature_flag')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  + Feature
                </button>
                <button
                  onClick={() => addRule('schedule')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  + Schedule
                </button>
              </div>
            </div>

            {rules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon path={mdiEye} size={2} className="mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No visibility rules configured</p>
                <p className="text-xs">Add rules to control when this item is visible</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={index} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon path={getRuleIcon(rule.type)} size={1} className="text-blue-400" />
                      <span className="text-sm font-medium text-white">
                        {getRuleLabel(rule.type)}
                      </span>
                      <button
                        onClick={() => removeRule(index)}
                        className="ml-auto p-1 text-gray-400 hover:text-red-400 rounded"
                      >
                        <Icon path={mdiClose} size={0.8} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Condition */}
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Condition
                        </label>
                        <select
                          value={rule.condition}
                          onChange={(e) => updateRule(index, { condition: e.target.value })}
                          className="w-full px-2 py-1 text-sm bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                        >
                          {getConditionOptions(rule.type).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Value */}
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Value
                        </label>
                        {rule.type === 'schedule' ? (
                          <input
                            type="datetime-local"
                            value={rule.value}
                            onChange={(e) => updateRule(index, { value: e.target.value })}
                            className="w-full px-2 py-1 text-sm bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                          />
                        ) : getValueOptions(rule.type).length > 0 ? (
                          <select
                            value={rule.value}
                            onChange={(e) => updateRule(index, { value: e.target.value })}
                            className="w-full px-2 py-1 text-sm bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Select value...</option>
                            {getValueOptions(rule.type).map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => updateRule(index, { value: e.target.value })}
                            className="w-full px-2 py-1 text-sm bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                            placeholder="Enter value..."
                          />
                        )}
                      </div>

                      {/* Enabled */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => updateRule(index, { enabled: e.target.checked })}
                          className="text-blue-600"
                        />
                        <label className="text-xs text-gray-300">Enabled</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Icon path={mdiContentSave} size={0.8} />
              Save Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
