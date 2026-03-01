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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n';
import { validators } from '@/lib/validators';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  projectSlug: string;
}

interface FormData {
  companyName: string;
  companyEmail: string;
  companyWebsite: string;
  contactPerson: string;
  contactDetails: string;
  message: string;
  projectSlug: string;
  website2?: string; // Honeypot field
}

interface FormErrors {
  companyName?: string;
  companyEmail?: string;
  companyWebsite?: string;
  contactPerson?: string;
  contactDetails?: string;
  message?: string;
}

export function ApplyModal({
  isOpen,
  onClose,
  projectTitle,
  projectSlug,
}: ApplyModalProps) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyEmail: '',
    companyWebsite: '',
    contactPerson: '',
    contactDetails: '',
    message: '',
    projectSlug,
    website2: '', // Honeypot field
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validators.required(formData.companyName)) {
      newErrors.companyName = t.pages.projects.applyModal.errors.required;
    }

    if (!validators.required(formData.companyEmail)) {
      newErrors.companyEmail = t.pages.projects.applyModal.errors.required;
    } else if (!validators.email(formData.companyEmail)) {
      newErrors.companyEmail = t.pages.projects.applyModal.errors.invalidEmail;
    }

    if (!validators.required(formData.companyWebsite)) {
      newErrors.companyWebsite = t.pages.projects.applyModal.errors.required;
    } else if (!validators.url(formData.companyWebsite)) {
      newErrors.companyWebsite = t.pages.projects.applyModal.errors.invalidUrl;
    }

    if (!validators.required(formData.contactPerson)) {
      newErrors.contactPerson = t.pages.projects.applyModal.errors.required;
    }

    if (!validators.required(formData.contactDetails)) {
      newErrors.contactDetails = t.pages.projects.applyModal.errors.required;
    }

    if (!validators.required(formData.message)) {
      newErrors.message = t.pages.projects.applyModal.errors.required;
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

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectSlug: formData.projectSlug,
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyWebsite: formData.companyWebsite,
          contactPerson: formData.contactPerson,
          contactDetails: formData.contactDetails,
          message: formData.message,
          website2: formData.website2, // Honeypot
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show user-friendly error message
        const errorMessage =
          data.error ||
          (language === 'de'
            ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
            : 'An error occurred. Please try again later.');
        setErrors({ message: errorMessage });
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({
        message:
          language === 'de'
            ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
            : 'An error occurred. Please try again later.',
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        companyName: '',
        companyEmail: '',
        companyWebsite: '',
        contactPerson: '',
        contactDetails: '',
        message: '',
        projectSlug,
        website2: '',
      });
      setErrors({});
      setIsSuccess(false);
      onClose();
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {t.pages.projects.applyModal.title}
                </DialogTitle>
                <DialogDescription>
                  {t.pages.projects.applyModal.subtitle}
                  <br />
                  <span className="font-semibold text-foreground mt-2 block">
                    {projectTitle}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {t.pages.projects.applyModal.companyName}
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    placeholder={t.pages.projects.applyModal.companyNamePlaceholder}
                    className={errors.companyName ? 'border-destructive' : ''}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">
                      {t.pages.projects.applyModal.companyEmail}
                    </Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
                      placeholder={t.pages.projects.applyModal.companyEmailPlaceholder}
                      className={errors.companyEmail ? 'border-destructive' : ''}
                    />
                    {errors.companyEmail && (
                      <p className="text-sm text-destructive">{errors.companyEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">
                      {t.pages.projects.applyModal.companyWebsite}
                    </Label>
                    <Input
                      id="companyWebsite"
                      type="url"
                      value={formData.companyWebsite}
                      onChange={(e) => handleFieldChange('companyWebsite', e.target.value)}
                      placeholder={t.pages.projects.applyModal.companyWebsitePlaceholder}
                      className={errors.companyWebsite ? 'border-destructive' : ''}
                    />
                    {errors.companyWebsite && (
                      <p className="text-sm text-destructive">{errors.companyWebsite}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">
                      {t.pages.projects.applyModal.contactPerson}
                    </Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                      placeholder={t.pages.projects.applyModal.contactPersonPlaceholder}
                      className={errors.contactPerson ? 'border-destructive' : ''}
                    />
                    {errors.contactPerson && (
                      <p className="text-sm text-destructive">{errors.contactPerson}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactDetails">
                      {t.pages.projects.applyModal.contactDetails}
                    </Label>
                    <Input
                      id="contactDetails"
                      value={formData.contactDetails}
                      onChange={(e) => handleFieldChange('contactDetails', e.target.value)}
                      placeholder={t.pages.projects.applyModal.contactDetailsPlaceholder}
                      className={errors.contactDetails ? 'border-destructive' : ''}
                    />
                    {errors.contactDetails && (
                      <p className="text-sm text-destructive">{errors.contactDetails}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t.pages.projects.applyModal.message}</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    placeholder={t.pages.projects.applyModal.messagePlaceholder}
                    rows={5}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message}</p>
                  )}
                </div>

                {/* Honeypot field - hidden from users */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <Label htmlFor="website2">Website (do not fill)</Label>
                  <Input
                    id="website2"
                    type="text"
                    value={formData.website2}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, website2: e.target.value }))
                    }
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    {t.pages.projects.applyModal.cancel}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.pages.projects.applyModal.submitting}
                      </>
                    ) : (
                      t.pages.projects.applyModal.submit
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
                  {t.pages.projects.applyModal.title}
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {t.pages.projects.applyModal.successMessage}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <Button onClick={handleClose} size="lg">
                  {t.pages.projects.applyModal.close}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
