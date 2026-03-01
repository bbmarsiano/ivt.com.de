'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

export default function PrivacyPage() {
  const { language, t } = useLanguage();

  return (
    <div className="flex flex-col">
      <section className="section-spacing">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="mb-8">{t.pages.privacy.title}</h1>
            <div className="prose prose-lg max-w-none">
              <h2>
                {language === 'de' ? '1. Datenschutz auf einen Blick' : '1. Data Protection at a Glance'}
              </h2>
              <h3>
                {language === 'de' ? 'Allgemeine Hinweise' : 'General Information'}
              </h3>
              <p>
                {language === 'de'
                  ? 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.'
                  : 'The following notes provide a simple overview of what happens to your personal data when you visit this website.'}
              </p>

              <h3>
                {language === 'de' ? 'Datenerfassung auf dieser Website' : 'Data Collection on this Website'}
              </h3>
              <p>
                {language === 'de'
                  ? 'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.'
                  : 'Data processing on this website is carried out by the website operator. You can find their contact details in the imprint of this website.'}
              </p>

              <h2>
                {language === 'de' ? '2. Allgemeine Hinweise und Pflichtinformationen' : '2. General Information and Mandatory Information'}
              </h2>
              <h3>
                {language === 'de' ? 'Datenschutz' : 'Data Protection'}
              </h3>
              <p>
                {language === 'de'
                  ? 'Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.'
                  : 'The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
