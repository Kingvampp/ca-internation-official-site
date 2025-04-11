/**
 * Development Logger Utility
 * 
 * This utility helps track changes and log issues during development
 * without interfering with the existing website functionality.
 */

const devLogger = {
  /**
   * Log a development message to console only in development environment
   * @param {string} message - The message to log
   * @param {string} type - The type of log (info, warning, error, success)
   */
  log: (message, type = 'info') => {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      const styles = {
        info: 'color: #2563eb; font-weight: bold;',
        warning: 'color: #f59e0b; font-weight: bold;',
        error: 'color: #dc2626; font-weight: bold;',
        success: 'color: #10b981; font-weight: bold;'
      };
      
      console.log(`%c[CA-DEV-${type.toUpperCase()}]`, styles[type], message);
    }
  },
  
  /**
   * Track mobile-specific issues
   * @param {string} component - The component name
   * @param {string} issue - Description of the issue
   */
  trackMobileIssue: (component, issue) => {
    if (process.env.NODE_ENV !== 'production') {
      devLogger.log(`Mobile Issue - ${component}: ${issue}`, 'warning');
      
      // In the future, this could write to a file or send to an API
    }
  },
  
  /**
   * Record a change made during implementation
   * @param {string} component - The component being changed
   * @param {string} description - Description of the change
   */
  recordChange: (component, description) => {
    if (process.env.NODE_ENV !== 'production') {
      devLogger.log(`Change Applied - ${component}: ${description}`, 'success');
      
      // In the future, this could write to a file or send to an API
    }
  }
};

export default devLogger; 