import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LeadsPublic } from '../lib/LeadsPublic';
import { EnvironmentConfigProvider } from '../lib/supabase';
import { CreateLeadInput, LeadType } from '../lib/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setGetInvolvedSubmission } from '../store/slices/sessionSlice';
import { Icon } from '@mdi/react';
import { mdiClose, mdiCheck } from '@mdi/js';

interface GetInvolvedDialogProps {
  preselectedType?: LeadType;
}

interface FormData {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  social_links: string[];
}

interface SocialLink {
  id: string;
  value: string;
}

export function GetInvolvedDialog({ preselectedType }: GetInvolvedDialogProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const getInvolvedSubmissions = useAppSelector((state) => state.session.getInvolvedSubmissions);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<LeadType | null>(preselectedType || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    social_links: []
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [existingSubmissions, setExistingSubmissions] = useState<{ vendor: boolean; sponsor: boolean; volunteer: boolean }>({
    vendor: false,
    sponsor: false,
    volunteer: false
  });

  // Check if dialog should be open based on URL
  useEffect(() => {
    const dialogOpen = searchParams.get('dialog') === 'get-involved';
    setIsOpen(dialogOpen);
    if (dialogOpen && preselectedType) {
      setSelectedType(preselectedType);
    }
  }, [searchParams, preselectedType]);

  // Check for existing submissions when dialog opens
  useEffect(() => {
    if (isOpen) {
      setExistingSubmissions(getInvolvedSubmissions);
    }
  }, [isOpen, getInvolvedSubmissions]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDialog();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const closeDialog = useCallback(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('dialog');
      return newParams;
    });
    setIsOpen(false);
    setSelectedType(null);
    setFormData({
      business_name: '',
      contact_name: '',
      email: '',
      phone: '',
      website: '',
      social_links: []
    });
    setSocialLinks([]);
    setValidationErrors({});
    setSubmitStatus('idle');
    setErrorMessage('');
  }, [setSearchParams]);

  const handleTypeSelection = (type: LeadType) => {
    setSelectedType(type);
    setValidationErrors({});
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      value: ''
    };
    setSocialLinks(prev => [...prev, newLink]);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id));
  };

  const updateSocialLink = (id: string, value: string) => {
    setSocialLinks(prev => prev.map(link => 
      link.id === id ? { ...link, value } : link
    ));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Common required fields
    if (!formData.contact_name.trim()) {
      errors.contact_name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Website validation
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'Website must be a valid URL starting with http:// or https://';
    }

    // Social links validation
    socialLinks.forEach((link, index) => {
      if (link.value && !/^https?:\/\/.+/.test(link.value)) {
        errors[`social_${index}`] = 'Social link must be a valid URL starting with http:// or https://';
      }
    });

    // Type-specific validation
    if (selectedType === 'vendor' || selectedType === 'sponsor') {
      if (!formData.business_name.trim()) {
        errors.business_name = 'Business name is required';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const configProvider = new EnvironmentConfigProvider();
      const leadsPublic = new LeadsPublic(configProvider);

      const socialLinksArray = socialLinks
        .map(link => link.value.trim())
        .filter(link => link.length > 0);

      const leadData: CreateLeadInput = {
        lead_kind: selectedType!,
        business_name: formData.business_name.trim() || undefined,
        contact_name: formData.contact_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        social_links: socialLinksArray.length > 0 ? socialLinksArray : undefined,
        source_path: window.location.pathname,
        tags: [selectedType!],
        meta: {
          submitted_via: 'get_involved_dialog',
          timestamp: new Date().toISOString()
        }
      };

      const result = await leadsPublic.createLead(leadData);

      if (result.success) {
        setSubmitStatus('success');
        // Track the submission in Redux (only for get involved types)
        if (selectedType === 'vendor' || selectedType === 'sponsor' || selectedType === 'volunteer') {
          dispatch(setGetInvolvedSubmission({ type: selectedType, submitted: true }));
        }
        // Update local state
        setExistingSubmissions(prev => ({ ...prev, [selectedType!]: true }));
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error?.message || 'Failed to submit form');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getThemeColors = () => {
    const colorTheme = theme?.colorTheme || 'purple';
    switch (colorTheme) {
      case 'green':
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-900',
          accent: 'text-emerald-600',
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          typeButton: 'border-emerald-200 hover:border-emerald-300 bg-emerald-50 hover:bg-emerald-100',
          typeButtonSelected: 'border-emerald-500 bg-emerald-100',
          typeButtonHover: 'hover:border-emerald-400'
        };
      case 'blue':
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-900',
          accent: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          typeButton: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100',
          typeButtonSelected: 'border-blue-500 bg-blue-100',
          typeButtonHover: 'hover:border-blue-400'
        };
      case 'amber':
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-900',
          accent: 'text-amber-600',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          typeButton: 'border-amber-200 hover:border-amber-300 bg-amber-50 hover:bg-amber-100',
          typeButtonSelected: 'border-amber-500 bg-amber-100',
          typeButtonHover: 'hover:border-amber-400'
        };
      case 'rose':
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-900',
          accent: 'text-rose-600',
          button: 'bg-rose-600 hover:bg-rose-700 text-white',
          buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          typeButton: 'border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100',
          typeButtonSelected: 'border-rose-500 bg-rose-100',
          typeButtonHover: 'hover:border-rose-400'
        };
      default: // purple
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-900',
          accent: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700 text-white',
          buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          typeButton: 'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100',
          typeButtonSelected: 'border-purple-500 bg-purple-100',
          typeButtonHover: 'hover:border-purple-400'
        };
    }
  };

  const themeColors = getThemeColors();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeDialog}
      />
      
      {/* Dialog */}
      <div className={`
        relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl
        ${themeColors.bg} ${themeColors.border} border
        sm:max-w-lg
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`text-xl font-semibold ${themeColors.text}`}>
            {submitStatus === 'success' ? 'Thank You!' : 'Get Involved'}
          </h2>
          <button
            onClick={closeDialog}
            className={`p-2 rounded-lg ${themeColors.buttonSecondary} hover:opacity-80 transition-opacity`}
          >
            <Icon path={mdiClose} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {submitStatus === 'success' ? (
            <div className="p-6 text-center">
              <div className="mb-4">
                <Icon path={mdiCheck} className="w-16 h-16 mx-auto text-green-500" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${themeColors.text}`}>
                Thank you for your interest!
              </h3>
              <p className={`text-sm mb-6 ${themeColors.text} opacity-80`}>
                We've received your submission and will be in touch soon with next steps.
              </p>
              <button
                onClick={closeDialog}
                className={`px-6 py-2 rounded-lg ${themeColors.button} text-white font-medium transition-colors`}
              >
                Close
              </button>
            </div>
          ) : !selectedType ? (
            <div className="p-6">
              <p className={`text-sm mb-6 ${themeColors.text} opacity-80`}>
                Choose how you'd like to get involved with our community event:
              </p>
              <div className="space-y-3">
                {(['sponsor', 'vendor', 'volunteer'] as LeadType[]).map((type) => {
                  const hasSubmitted = existingSubmissions[type as keyof typeof existingSubmissions];
                  return (
                    <button
                      key={type}
                      onClick={() => !hasSubmitted && handleTypeSelection(type)}
                      disabled={hasSubmitted}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        hasSubmitted
                          ? 'border-green-200 bg-green-50 cursor-not-allowed'
                          : selectedType === type 
                            ? themeColors.typeButtonSelected
                            : `${themeColors.typeButton} ${themeColors.typeButtonHover}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`font-medium capitalize ${themeColors.text}`}>
                          {type === 'sponsor' ? 'Sponsor' : type === 'vendor' ? 'Vendor' : 'Volunteer'}
                        </div>
                        {hasSubmitted && (
                          <div className="flex items-center gap-2">
                            <Icon path={mdiCheck} className={`w-4 h-4 ${themeColors.accent}`} />
                            <span className={`${themeColors.accent} text-xs font-medium`}>Already Submitted</span>
                          </div>
                        )}
                      </div>
                      <div className={`text-xs mt-1 ${themeColors.text} ${hasSubmitted ? 'opacity-60' : 'opacity-70'}`}>
                        {hasSubmitted 
                          ? 'Thank you for your submission! We\'ll be in touch soon.'
                          : type === 'sponsor' 
                            ? 'Support our event with sponsorship opportunities'
                            : type === 'vendor' 
                              ? 'Sell your products or services at our event'
                              : 'Help make our event a success with your time'
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Type Selection Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${themeColors.text}`}>
                    {selectedType === 'sponsor' ? 'Sponsor' : selectedType === 'vendor' ? 'Vendor' : 'Volunteer'} Registration
                  </h3>
                  <p className={`text-xs ${themeColors.text} opacity-70`}>
                    {selectedType === 'volunteer' ? 'Required: Name, Email, Phone' : 'All fields required'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className={`text-xs ${themeColors.accent} hover:opacity-80`}
                >
                  Change
                </button>
              </div>

              {/* Business Name (Vendor/Sponsor only) */}
              {(selectedType === 'vendor' || selectedType === 'sponsor') && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeColors.text}`}>
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      validationErrors.business_name ? 'border-red-500' : 'border-gray-300'
                    } bg-white ${themeColors.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Your business name"
                  />
                  {validationErrors.business_name && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.business_name}</p>
                  )}
                </div>
              )}

              {/* Contact Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeColors.text}`}>
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    validationErrors.contact_name ? 'border-red-500' : 'border-gray-300'
                  } bg-white ${themeColors.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="Your full name"
                />
                {validationErrors.contact_name && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.contact_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeColors.text}`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  } bg-white ${themeColors.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="your@email.com"
                />
                {validationErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeColors.text}`}>
                  Phone Number {selectedType === 'volunteer' ? '' : '*'}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  } bg-white ${themeColors.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="(555) 123-4567"
                />
                {validationErrors.phone && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.phone}</p>
                )}
              </div>

              {/* Website (Vendor/Sponsor only) */}
              {(selectedType === 'vendor' || selectedType === 'sponsor') && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeColors.text}`}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      validationErrors.website ? 'border-red-500' : 'border-gray-300'
                    } bg-white ${themeColors.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="https://yourwebsite.com"
                  />
                  {validationErrors.website && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.website}</p>
                  )}
                </div>
              )}

              {/* Social Links (Vendor/Sponsor only) */}
              {(selectedType === 'vendor' || selectedType === 'sponsor') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${themeColors.text}`}>
                      Social Media Links
                    </label>
                    <button
                      type="button"
                      onClick={addSocialLink}
                      className={`text-xs ${themeColors.accent} hover:opacity-80`}
                    >
                      + Add Link
                    </button>
                  </div>
                  {socialLinks.map((link, index) => (
                    <div key={link.id} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={link.value}
                        onChange={(e) => updateSocialLink(link.id, e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          validationErrors[`social_${index}`] ? 'border-red-500' : 'border-gray-300'
                        } bg-white ${themeColors.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                        placeholder="https://facebook.com/yourpage"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(link.id)}
                        className={`px-3 py-2 rounded-lg ${themeColors.buttonSecondary} ${themeColors.text} hover:opacity-80`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {socialLinks.some((_, index) => validationErrors[`social_${index}`]) && (
                    <p className="text-red-600 text-xs mt-1">
                      {Object.values(validationErrors).find(error => error.includes('Social link'))}
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className={`flex-1 px-4 py-2 rounded-lg ${themeColors.buttonSecondary} font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-lg ${themeColors.button} font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
