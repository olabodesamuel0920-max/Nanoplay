-- Seed Account Tiers
INSERT INTO public.account_tiers (name, price_ngn, perks) VALUES
('Starter', 5000, '{"reward": "₦50,000", "predictions_per_round": 3, "referral_bonus": 1000}'::jsonb),
('Standard', 10000, '{"reward": "₦100,000", "predictions_per_round": 3, "referral_bonus": 1000, "priority": true}'::jsonb),
('Premium', 20000, '{"reward": "₦200,000", "predictions_per_round": 3, "referral_bonus": 1000, "priority": true, "elite_badge": true}'::jsonb)
ON CONFLICT (name) DO UPDATE SET price_ngn = EXCLUDED.price_ngn, perks = EXCLUDED.perks;

-- Seed Platform Settings
INSERT INTO public.platform_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'Enable or disable platform maintenance mode.'),
('tier_pricing', '{"starter": 5000, "standard": 10000, "premium": 20000}', 'Pricing for account tiers in NGN.'),
('referral_bonus', '1000', 'Bonus amount for successful referrals in NGN.'),
('payout_limits', '{"min": 5000, "max": 500000}', 'Minimum and maximum payout limits.'),
('announcement_banner', '{"text": "Welcome to NanoPlay! Elite Tiers are now active.", "active": true}', 'Homepage announcement banner content.'),
('trust_stats_mode', '"real"', 'Display mode for homepage stats: "real" or "launch".')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
