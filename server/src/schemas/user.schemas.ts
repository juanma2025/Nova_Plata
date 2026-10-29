import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().trim().optional(),
    name: z.string().trim().optional(),
    avatar_url: z.string().optional(),
    phone: z.string().optional(),
    phone_prefix: z.string().optional(),
    document_id: z.string().optional(),
    occupation: z.string().optional(),
    currency: z.string().optional(),
    tax_regime: z.string().optional(),
    anomaly_alert_threshold: z.number().optional(),
    ai_copilot_proactive: z.boolean().optional(),
    ai_weekly_audit: z.boolean().optional(),
    ai_subscription_detection: z.boolean().optional(),
    ai_risk_profile: z.string().optional(),
    monthly_income: z.number().optional(),
    monthly_budget: z.number().optional(),
    savings_goal: z.number().optional(),
  }).passthrough(),
});

export const onboardingSchema = z.object({
  body: z.object({
    monthly_income: z.number().min(0, 'El ingreso no puede ser negativo'),
    main_income_source: z.string().min(1, 'Selecciona una fuente de ingresos'),
    approximate_monthly_expenses: z.number().min(0),
    monthly_budget: z.number().min(0),
    savings_goal: z.number().min(0),
    main_expense_categories: z.array(z.string()).min(1, 'Selecciona al menos una categoría'),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type OnboardingInput = z.infer<typeof onboardingSchema>['body'];
