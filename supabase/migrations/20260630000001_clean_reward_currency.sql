-- Clean up reward currency prefixes from database tiers to consistently show "NGN"
UPDATE public.account_tiers 
SET perks = perks || '{"reward": "NGN 50,000"}'::jsonb 
WHERE name = 'Starter';

UPDATE public.account_tiers 
SET perks = perks || '{"reward": "NGN 100,000"}'::jsonb 
WHERE name = 'Standard';

UPDATE public.account_tiers 
SET perks = perks || '{"reward": "NGN 200,000"}'::jsonb 
WHERE name = 'Premium';
