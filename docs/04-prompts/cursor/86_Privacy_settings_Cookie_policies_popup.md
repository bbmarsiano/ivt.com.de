Scope: Add a simple privacy settings / cookie policy popup on initial page load. Keep implementation lightweight and reversible. Do NOT break existing functionality.

Goal:
Show a cookie/privacy popup when the site is first loaded, with support for both EN and DE.
The popup should not reappear after the user makes a choice, unless local storage is cleared.

Requirements:
- Show on first load only
- Support EN and DE using the existing language system
- Include:
  - title
  - short explanatory text
  - button to accept
  - button to open/manage privacy settings
  - link/button to privacy policy page if already available
- Save choice in localStorage
- Reversible and isolated implementation
- No third-party cookie library unless absolutely necessary

Suggested UX:
- Bottom-centered or bottom-right modal/popup
- Matches current defense/modern UI style
- Clear readable contrast
- Accessible buttons

Suggested copy:

EN:
Title: "Privacy Settings"
Text: "We use cookies and similar technologies to improve your experience, analyze traffic, and support essential site functionality."
Accept button: "Accept All"
Manage button: "Manage Settings"
Privacy link: "Privacy Policy"

DE:
Title: "Datenschutzeinstellungen"
Text: "Wir verwenden Cookies und ähnliche Technologien, um Ihre Erfahrung zu verbessern, den Datenverkehr zu analysieren und die grundlegende Funktionalität der Website zu gewährleisten."
Accept button: "Alle akzeptieren"
Manage button: "Einstellungen verwalten"
Privacy link: "Datenschutz"

Implementation:
1) Create a lightweight cookie/privacy banner component.
2) Use localStorage key like:
   ivt_cookie_consent
3) If key is missing, show popup.
4) On accept, save consent and hide popup.
5) On manage settings:
   - either open a small inline expanded state in the popup
   - or keep it as a secondary action placeholder if no full settings modal exists yet
6) Link privacy button to the existing privacy page route.
7) Integrate the popup at layout level so it appears site-wide.
8) Keep styling consistent with the current site.

Output:
- List modified files
- Minimal diff summary
- Confirm localStorage key used and language support added