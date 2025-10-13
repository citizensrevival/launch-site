/**
 * Site Settings Manager
 * Manages site settings and state using Local Storage
 */

export type ColorTheme = 'purple' | 'green' | 'blue' | 'amber' | 'rose';
export type GetInvolvedType = 'vendor' | 'sponsor' | 'volunteer';

export interface SiteSettings {
  colorTheme: ColorTheme;
  emailSubscribed: boolean;
  getInvolvedSubmissions: {
    vendor: boolean;
    sponsor: boolean;
    volunteer: boolean;
  };
}

export interface GetInvolvedSubmission {
  type: GetInvolvedType;
  submitted: boolean;
  submittedAt?: string;
}

/**
 * Manages site settings and state using Local Storage
 */
export class SiteSettingsManager {
  private static readonly STORAGE_KEY = 'siteSettings';
  private static instance: SiteSettingsManager | null = null;

  private constructor() {}

  /**
   * Gets the singleton instance of SiteSettingsManager
   */
  public static getInstance(): SiteSettingsManager {
    if (!this.instance) {
      this.instance = new SiteSettingsManager();
    }
    return this.instance;
  }

  /**
   * Gets all site settings from Local Storage
   */
  public getSettings(): SiteSettings {
    if (typeof window === 'undefined') {
      return this.getDefaultSettings();
    }

    try {
      const stored = localStorage.getItem(SiteSettingsManager.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn('Failed to parse site settings from localStorage:', error);
    }

    return this.getDefaultSettings();
  }

  /**
   * Updates site settings in Local Storage
   */
  public updateSettings(updates: Partial<SiteSettings>): void {
    if (typeof window === 'undefined') return;

    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      localStorage.setItem(SiteSettingsManager.STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to update site settings:', error);
    }
  }

  /**
   * Gets the current color theme
   */
  public getColorTheme(): ColorTheme {
    return this.getSettings().colorTheme;
  }

  /**
   * Sets the color theme
   */
  public setColorTheme(colorTheme: ColorTheme): void {
    this.updateSettings({ colorTheme });
  }

  /**
   * Gets email subscription status
   */
  public getEmailSubscribed(): boolean {
    return this.getSettings().emailSubscribed;
  }

  /**
   * Sets email subscription status
   */
  public setEmailSubscribed(subscribed: boolean): void {
    this.updateSettings({ emailSubscribed: subscribed });
  }

  /**
   * Gets Get Involved submission status for a specific type
   */
  public getGetInvolvedSubmission(type: GetInvolvedType): boolean {
    const settings = this.getSettings();
    return settings.getInvolvedSubmissions[type];
  }

  /**
   * Sets Get Involved submission status for a specific type
   */
  public setGetInvolvedSubmission(type: GetInvolvedType, submitted: boolean): void {
    const settings = this.getSettings();
    const updatedSubmissions = {
      ...settings.getInvolvedSubmissions,
      [type]: submitted
    };
    this.updateSettings({ getInvolvedSubmissions: updatedSubmissions });
  }

  /**
   * Gets all Get Involved submission statuses
   */
  public getAllGetInvolvedSubmissions(): { vendor: boolean; sponsor: boolean; volunteer: boolean } {
    return this.getSettings().getInvolvedSubmissions;
  }

  /**
   * Sets multiple Get Involved submission statuses
   */
  public setGetInvolvedSubmissions(submissions: Partial<{ vendor: boolean; sponsor: boolean; volunteer: boolean }>): void {
    const settings = this.getSettings();
    const updatedSubmissions = {
      ...settings.getInvolvedSubmissions,
      ...submissions
    };
    this.updateSettings({ getInvolvedSubmissions: updatedSubmissions });
  }

  /**
   * Checks if user has submitted any Get Involved forms
   */
  public hasAnyGetInvolvedSubmission(): boolean {
    const submissions = this.getAllGetInvolvedSubmissions();
    return submissions.vendor || submissions.sponsor || submissions.volunteer;
  }

  /**
   * Gets a summary of all settings
   */
  public getSettingsSummary(): {
    colorTheme: ColorTheme;
    emailSubscribed: boolean;
    getInvolvedCount: number;
    hasAnySubmissions: boolean;
  } {
    const settings = this.getSettings();
    const getInvolvedSubmissions = settings.getInvolvedSubmissions;
    const getInvolvedCount = Object.values(getInvolvedSubmissions).filter(Boolean).length;

    return {
      colorTheme: settings.colorTheme,
      emailSubscribed: settings.emailSubscribed,
      getInvolvedCount,
      hasAnySubmissions: getInvolvedCount > 0
    };
  }

  /**
   * Resets all settings to defaults
   */
  public resetSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(SiteSettingsManager.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset site settings:', error);
    }
  }

  /**
   * Clears only Get Involved submissions
   */
  public clearGetInvolvedSubmissions(): void {
    this.setGetInvolvedSubmissions({
      vendor: false,
      sponsor: false,
      volunteer: false
    });
  }

  /**
   * Gets default settings
   */
  private getDefaultSettings(): SiteSettings {
    return {
      colorTheme: 'purple',
      emailSubscribed: false,
      getInvolvedSubmissions: {
        vendor: false,
        sponsor: false,
        volunteer: false
      }
    };
  }

  /**
   * Merges stored settings with defaults to ensure all properties exist
   */
  private mergeWithDefaults(stored: any): SiteSettings {
    const defaults = this.getDefaultSettings();
    
    return {
      colorTheme: stored.colorTheme || defaults.colorTheme,
      emailSubscribed: stored.emailSubscribed ?? defaults.emailSubscribed,
      getInvolvedSubmissions: {
        vendor: stored.getInvolvedSubmissions?.vendor ?? defaults.getInvolvedSubmissions.vendor,
        sponsor: stored.getInvolvedSubmissions?.sponsor ?? defaults.getInvolvedSubmissions.sponsor,
        volunteer: stored.getInvolvedSubmissions?.volunteer ?? defaults.getInvolvedSubmissions.volunteer
      }
    };
  }
}

/**
 * Convenience function to get the singleton instance
 */
export const getSiteSettings = (): SiteSettingsManager => {
  return SiteSettingsManager.getInstance();
};

/**
 * React hook for using site settings (optional - for React components)
 */
export const useSiteSettings = () => {
  const settingsManager = getSiteSettings();
  
  return {
    getSettings: () => settingsManager.getSettings(),
    updateSettings: (updates: Partial<SiteSettings>) => settingsManager.updateSettings(updates),
    getColorTheme: () => settingsManager.getColorTheme(),
    setColorTheme: (colorTheme: ColorTheme) => settingsManager.setColorTheme(colorTheme),
    getEmailSubscribed: () => settingsManager.getEmailSubscribed(),
    setEmailSubscribed: (subscribed: boolean) => settingsManager.setEmailSubscribed(subscribed),
    getGetInvolvedSubmission: (type: GetInvolvedType) => settingsManager.getGetInvolvedSubmission(type),
    setGetInvolvedSubmission: (type: GetInvolvedType, submitted: boolean) => settingsManager.setGetInvolvedSubmission(type, submitted),
    getAllGetInvolvedSubmissions: () => settingsManager.getAllGetInvolvedSubmissions(),
    setGetInvolvedSubmissions: (submissions: Partial<{ vendor: boolean; sponsor: boolean; volunteer: boolean }>) => settingsManager.setGetInvolvedSubmissions(submissions),
    hasAnyGetInvolvedSubmission: () => settingsManager.hasAnyGetInvolvedSubmission(),
    getSettingsSummary: () => settingsManager.getSettingsSummary(),
    resetSettings: () => settingsManager.resetSettings(),
    clearGetInvolvedSubmissions: () => settingsManager.clearGetInvolvedSubmissions()
  };
};
