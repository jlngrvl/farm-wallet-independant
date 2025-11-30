import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import TopBar from '../components/Layout/TopBar';
import '../styles/faq.css';

/**
 * FAQ Page - Frequently Asked Questions
 * Public page explaining wallet concepts
 */
const FaqPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  
  // Page title
  const pageTitle = '❓ Aide & FAQ';

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: t('faq.generateQuestion') || "C'est quoi \"Générer\" ?",
      answer: t('faq.generateAnswer') || "Générer signifie créer un nouveau compte wallet. Le système génère automatiquement 12 mots secrets (phrase mnémonique) qui constituent votre identifiant unique et votre mot de passe. Ces 12 mots sont la seule clé pour accéder à vos jetons. Notez-les précieusement sur papier et conservez-les en lieu sûr."
    },
    {
      question: t('faq.importQuestion') || "C'est quoi \"Importer\" ?",
      answer: t('faq.importAnswer') || "Importer permet de restaurer un compte existant en utilisant vos 12 mots secrets que vous avez notés lors de la création. Si vous avez déjà un wallet et que vous changez d'appareil, utilisez \"Importer\" avec vos 12 mots pour retrouver l'accès à vos jetons."
    },
    {
      question: t('faq.whyConnectQuestion') || "Pourquoi se connecter ?",
      answer: t('faq.whyConnectAnswer') || "La connexion (via Générer ou Importer) est nécessaire pour interagir avec vos jetons : acheter des jetons de ferme, payer vos producteurs, recevoir des paiements, et consulter vos soldes. Sans connexion, vous ne pouvez que consulter l'annuaire des fermes."
    },
    {
      question: t('faq.safetyQuestion') || "Mes 12 mots sont-ils en sécurité ?",
      answer: t('faq.safetyAnswer') || "Vos 12 mots sont stockés localement sur votre appareil. Personne d'autre n'y a accès. Cependant, si vous perdez vos 12 mots ET effacez votre navigateur, vous perdez définitivement l'accès à vos jetons. C'est pourquoi il est crucial de les noter sur papier."
    },
    {
      question: t('faq.costQuestion') || "Y a-t-il des frais ?",
      answer: t('faq.costQuestion') || "Les transactions sur le réseau eCash nécessitent des frais minuscules (moins d'un centime pour 100 transactions). Pour vos achats de jetons de ferme, les conditions sont définies par chaque producteur."
    },
    {
      question: t('faq.verifiedStatusQuestion') || "Que signifient les statuts \"Vérifiée\" et \"Non vérifiée\" ?",
      answer: t('faq.verifiedStatusAnswer') || "Une ferme \"Vérifiée\" a validé son identité (KYC) et confirmé son activité agricole cette année auprès de la plateforme. Une ferme \"Non vérifiée\" est libre mais n'a pas encore fourni ces garanties."
    },
    {
      question: t('faq.whyKycQuestion') || "Pourquoi une ferme doit valider son identité (KYC) ?",
      answer: t('faq.whyKycAnswer') || "Cela garantit aux utilisateurs que la ferme existe réellement et qu'elle est toujours en activité. Cette vérification est renouvelée chaque année."
    }
  ];

  return (
    <div className="faq-container">
      <TopBar />

      <div className="faq-content">
        <header className="faq-header">
          <h2 className="faq-subtitle-header">❓ {t('faq.title') || 'Questions Fréquentes'}</h2>
          <p className="faq-subtitle">
            {t('faq.subtitle') || 'Tout ce que vous devez savoir pour démarrer'}
          </p>
        </header>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => toggleFaq(index)}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-toggle-icon">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <p className="faq-cta-text">
            {t('faq.ctaText') || 'Prêt à commencer ?'}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="faq-cta-button"
          >
            {t('faq.ctaButton') || 'Découvrir les fermes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
