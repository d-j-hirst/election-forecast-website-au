import React, {useEffect} from 'react';

import {Header, Footer, StandardErrorBoundary} from 'components';
import {useWindowDimensions} from '../../utils/window.js';
import {
  DONATIONS_ENABLED,
  STRIPE_BUY_BUTTON_ID,
  STRIPE_PAYMENT_LINK_URL,
  STRIPE_PUBLISHABLE_KEY,
} from 'config/donations';

import styles from './Support.module.css';

const StripeBuyButton = () => {
  useEffect(() => {
    if (!STRIPE_BUY_BUTTON_ID || !STRIPE_PUBLISHABLE_KEY) return;
    const existingScript = document.querySelector(
      'script[src="https://js.stripe.com/v3/buy-button.js"]'
    );
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    document.body.appendChild(script);
  }, []);

  if (!STRIPE_BUY_BUTTON_ID || !STRIPE_PUBLISHABLE_KEY) return null;

  return React.createElement('stripe-buy-button', {
    'buy-button-id': STRIPE_BUY_BUTTON_ID,
    'publishable-key': STRIPE_PUBLISHABLE_KEY,
  });
};

const DonationOptions = () => {
  const hasStripeBuyButton = STRIPE_BUY_BUTTON_ID && STRIPE_PUBLISHABLE_KEY;

  if (!DONATIONS_ENABLED) {
    return (
      <p className={styles.setupNotice}>
        Donation payments are not configured yet. Add the Stripe Payment Link
        settings to the frontend environment to enable this page.
      </p>
    );
  }

  return (
    <>
      {hasStripeBuyButton && (
        <div className={styles.donationWidget}>
          <StripeBuyButton />
        </div>
      )}
      {STRIPE_PAYMENT_LINK_URL && (
        <p className={styles.paymentLinkText}>
          <a className={styles.paymentLink} href={STRIPE_PAYMENT_LINK_URL}>
            Open the Stripe payment page
          </a>
        </p>
      )}
    </>
  );
};

const Support = () => {
  const windowDimensions = useWindowDimensions();
  document.title = `AEF - Support`;

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page="support" />
      <main className={styles.content}>
        <StandardErrorBoundary>
          <div className={styles.mainText}>
            <h4>Support Australian Election Forecasts</h4>
            <p>
              Australian Election Forecasts is free to read and use. If the site
              is useful to you, an optional contribution is a way to show
              appreciation for the many hours spent developing the website and
              forecasts, and to encourage me to keep maintaining it in the
              future.
            </p>
            <DonationOptions />
            <p className={styles.disclaimer}>
              Contributions do not affect the forecasts, methods, commentary, or
              access to the site.
            </p>
          </div>
        </StandardErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
