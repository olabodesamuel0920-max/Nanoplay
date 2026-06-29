-- Add Phase 2M platform launch settings to platform_settings table
INSERT INTO public.platform_settings (key, value, description) VALUES
('launch_mode', '"preview"', 'Platform launch stage mode: "preview", "controlled_live", or "full_live".'),
('wallet_funding_enabled', 'false', 'Enable or disable Paystack wallet deposits globally.'),
('otp_mode', '"mock"', 'OTP dispatch driver: "mock", "termii", or "twilio".'),
('paystack_mode', '"test"', 'Paystack transaction environment: "disabled", "test", or "live".'),
('support_whatsapp', '""', 'Customer support phone number for WhatsApp routing.'),
('support_email', '""', 'Customer support inbox address.'),
('disclaimer_toggles', '{"show_no_affiliation": true, "show_reviewed_rewards": true}', 'JSON controls for displaying safety and non-affiliation disclaimers.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
