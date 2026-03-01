'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n';
import { validators } from '@/lib/validators';
import { CheckCircle2, Loader2, LockKeyhole } from 'lucide-react';
import type { Resource } from '@/lib/types/content';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  projectSlug: string;
}

interface FormData {
  email: string;
  company: string;
}

interface FormErrors {
  email?: string;
  company?: string;
}

export function RequestAccessModal({
  isOpen,
  onClose,
  resource,
  projectSlug,
}: RequestAccessModalProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    company: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resourceTitle = language === 'de' ? resource.title_de : resource.title_en;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validators.required(formData.email)) {
      newErrors.email =
        language === 'de' ? 'E-Mail ist erforderlich' : 'Email is required';
    } else if (!validators.email(formData.email)) {
      newErrors.email =
        language === 'de' ? 'Ungültige E-Mail-Adresse' : 'Invalid email address';
    }

    if (!validators.required(formData.company)) {
      newErrors.company =
        language === 'de' ? 'Firma ist erforderlich' : 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/resources/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          company: formData.company,
          resourceKey: resource.key,
          projectSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.error ||
          (language === 'de'
            ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
            : 'An error occurred. Please try again later.');
        setErrorMessage(errorMsg);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error requesting access:', error);
      setErrorMessage(
        language === 'de'
          ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
          : 'An error occurred. Please try again later.'
      );
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        email: '',
        company: '',
      });
      setErrors({});
      setErrorMessage(null);
      setIsSuccess(false);
      onClose();
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <LockKeyhole className="h-5 w-5" />
                  {language === 'de' ? 'Zugang anfragen' : 'Request Access'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'de'
                    ? 'Bitte füllen Sie das Formular aus, um Zugang zu dieser Ressource zu erhalten.'
                    : 'Please fill out the form to request access to this resource.'}
                  <br />
                  <span className="font-semibold text-foreground mt-2 block">
                    {resourceTitle}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === 'de' ? 'E-Mail' : 'Email'} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder={
                      language === 'de'
                        ? 'ihre@email.de'
                        : 'your@email.com'
                    }
                    className={errors.email ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">
                    {language === 'de' ? 'Firma' : 'Company'} *
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleFieldChange('company', e.target.value)}
                    placeholder={
                      language === 'de'
                        ? 'Ihre Firma'
                        : 'Your Company'
                    }
                    className={errors.company ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company}</p>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    {language === 'de' ? 'Abbrechen' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === 'de' ? 'Wird gesendet...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="mr-2 h-4 w-4" />
                        {language === 'de' ? 'Anfrage senden' : 'Send Request'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <DialogHeader className="space-y-4">
                <DialogTitle className="text-2xl">
                  {language === 'de' ? 'Anfrage gesendet' : 'Request Sent'}
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {language === 'de'
                    ? 'Vielen Dank! Wir haben Ihnen eine E-Mail mit einem Download-Link gesendet. Der Link ist 24 Stunden gültig und kann mehrfach verwendet werden.'
                    : 'Thanks! We sent you an email with a download link. The link is valid for 24 hours and can be used multiple times until it expires.'}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <Button onClick={handleClose} size="lg">
                  {language === 'de' ? 'Schließen' : 'Close'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
