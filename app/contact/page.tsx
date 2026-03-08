'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  const { language, t } = useLanguage();

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'info@innovationvalley-thueringen.de',
    },
    {
      icon: Phone,
      title: { de: 'Telefon', en: 'Phone' },
      value: '+49 (0) 123 456 789',
    },
    {
      icon: MapPin,
      title: { de: 'Adresse', en: 'Address' },
      value: 'Innovation Valley Thüringen, 99084 Erfurt',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="section-spacing bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="mb-6">{t.pages.contact.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.contact.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold mb-6">
                {language === 'de' ? 'Kontaktinformationen' : 'Contact Information'}
              </h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="rounded-md border border-white/10 bg-white/5 p-2 flex-shrink-0">
                          <info.icon className="ivt-icon-md text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">
                            {typeof info.title === 'string' ? info.title : info.title[language]}
                          </h3>
                          <p className="text-muted-foreground">{info.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">
                    {language === 'de' ? 'Nachricht senden' : 'Send Message'}
                  </h2>
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {language === 'de' ? 'Name' : 'Name'}
                      </Label>
                      <Input id="name" placeholder={language === 'de' ? 'Ihr Name' : 'Your name'} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={language === 'de' ? 'Ihre E-Mail' : 'Your email'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {language === 'de' ? 'Nachricht' : 'Message'}
                      </Label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder={language === 'de' ? 'Ihre Nachricht' : 'Your message'}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {language === 'de' ? 'Absenden' : 'Send'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
