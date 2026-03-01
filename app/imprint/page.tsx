'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

export default function ImprintPage() {
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
            <h1 className="mb-8">{t.pages.imprint.title}</h1>
            <div className="prose prose-lg max-w-none">
              <h2>
                {language === 'de' ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}
              </h2>
              <p>
                Innovation Valley Thüringen<br />
                Musterstraße 123<br />
                99084 Erfurt<br />
                Deutschland
              </p>

              <h3>
                {language === 'de' ? 'Vertreten durch' : 'Represented by'}
              </h3>
              <p>Max Mustermann</p>

              <h3>
                {language === 'de' ? 'Kontakt' : 'Contact'}
              </h3>
              <p>
                {language === 'de' ? 'Telefon' : 'Phone'}: +49 (0) 123 456 789<br />
                E-Mail: info@innovationvalley-thueringen.de
              </p>

              <h3>
                {language === 'de' ? 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV' : 'Responsible for content according to § 55 Abs. 2 RStV'}
              </h3>
              <p>
                Max Mustermann<br />
                Musterstraße 123<br />
                99084 Erfurt
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
