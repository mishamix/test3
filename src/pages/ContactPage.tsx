import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Select from '../components/Select';
import Button from '../components/Button';

export default function ContactPage() {
  const { t } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'email',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('property_inquiries').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message || null,
        preferred_contact: formData.preferredContact,
        property_id: null,
        status: 'new',
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        preferredContact: 'email',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h1 className="section-heading">{t('contact.title')}</h1>
          <p className="section-subheading">{t('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl p-8 md:p-12">
              {success ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-12 h-12 text-luxury-gold" />
                  </div>
                  <h3 className="font-display text-3xl font-bold text-secondary-900 dark:text-white mb-4">
                    {t('contact.form.success')}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-8 max-w-md mx-auto">
                    We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn btn-outline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-3xl font-bold text-secondary-900 dark:text-white mb-8">
                    Get in Touch
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        name="name"
                        label={t('contact.form.name')}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                      <Input
                        type="email"
                        name="email"
                        label={t('contact.form.email')}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        type="tel"
                        name="phone"
                        label={t('contact.form.phone')}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                      />
                      <Select
                        name="preferredContact"
                        label={t('contact.form.preferredContact')}
                        value={formData.preferredContact}
                        onChange={handleChange}
                        options={[
                          { value: 'email', label: 'Email' },
                          { value: 'whatsapp', label: 'WhatsApp' },
                          { value: 'telegram', label: 'Telegram' },
                        ]}
                      />
                    </div>

                    <Textarea
                      name="message"
                      label={t('contact.form.message')}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="I am interested in..."
                      rows={5}
                    />

                    {error && (
                      <div className="p-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
                        {error}
                      </div>
                    )}

                    <Button type="submit" loading={loading} className="w-full md:w-auto px-12">
                      <Send className="w-5 h-5 mr-2" />
                      {t('contact.form.submit')}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 dark:from-secondary-800 dark:via-secondary-900 dark:to-secondary-800 rounded-3xl shadow-2xl p-8 md:p-10 text-white sticky top-32">
              <h2 className="font-display text-3xl font-bold mb-8">
                {t('contact.info.title')}
              </h2>

              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-luxury-gold/20">
                    <MapPin className="w-7 h-7 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white text-lg">{t('contact.info.address')}</h3>
                    <p className="text-secondary-400 leading-relaxed">
                      Downtown Dubai, Burj Khalifa Tower<br />
                      Level 120, Dubai, UAE
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-luxury-gold/20">
                    <Phone className="w-7 h-7 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white text-lg">{t('contact.info.phone')}</h3>
                    <p className="text-secondary-400">+971 4 123 4567</p>
                    <p className="text-secondary-400">+971 50 987 6543</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-luxury-gold/20">
                    <Mail className="w-7 h-7 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white text-lg">{t('contact.info.email')}</h3>
                    <p className="text-secondary-400">info@luxuryestates.com</p>
                    <p className="text-secondary-400">sales@luxuryestates.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-luxury-gold/20">
                    <Clock className="w-7 h-7 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white text-lg">{t('contact.info.workingHours')}</h3>
                    <p className="text-secondary-400">Mon - Fri: 9:00 AM - 7:00 PM</p>
                    <p className="text-secondary-400">Sat - Sun: 10:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-secondary-700/50">
                <p className="text-secondary-400 text-sm mb-5 font-medium">Quick Connect</p>
                <div className="space-y-4">
                  <a
                    href="https://wa.me/97141234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-social w-full bg-green-600 hover:bg-green-500 text-white gap-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp Us
                  </a>
                  <a
                    href="https://t.me/luxuryestates"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-social w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white gap-3"
                  >
                    <Send className="w-5 h-5" />
                    Telegram Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
